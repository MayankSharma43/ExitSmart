import {
  RecommendRequest,
  RecommendResponse,
  Option,
  Segment,
  StopCandidate,
  ExitSmartBannerInfo,
  AssumptionItem,
  CabDirectEstimate,
  TravelMode,
} from "./types";
import { haversineDistanceMeters } from "./estimate";
import { findNearbyStops, findValidTrunkPairs } from "./candidates";
import {
  calculateAutoFare,
  calculateCabFare,
  calculateSharedAutoFare,
  calculateMetroFare,
  calculatePMPMLFare,
} from "./fares";
import { getLegDistanceAndTime } from "./providers/routing";
import { filterParetoFrontier } from "./pareto";
import { selectTopThreeOptions } from "./score";
import stationsData from "@/data/stations.json";
import stopsData from "@/data/stops.json";
import tariffsData from "@/data/tariffs.json";

const ASSUMPTIONS: AssumptionItem[] = [
  {
    item: "Pune Metro Timings & Fares",
    formula: "Maha Metro Slabs: ₹10 (0-2 km), ₹15 (2-4 km), ₹20 (4-8 km), ₹25 (8-12 km), ₹30 (12-16 km), ₹35 (>16 km). Avg travel: 2 min/station, 5 min interchange.",
    source: "Maha Metro Official Tariff Card (Pune Metro Rail)",
    confidence: "Real",
  },
  {
    item: "PMPML Bus Fares",
    formula: "Official Stages: ₹5 (0-2 km), ₹10 (2-4 km), ₹15 (4-8 km), ₹20 (8-12 km), ₹25 (12-16 km), ₹30 (>16 km). Headways 10-20 min.",
    source: "PMPML Official Tariff (pmpml.org)",
    confidence: "Real",
  },
  {
    item: "Auto Rickshaw Fare Meter",
    formula: "Maharashtra RTO Pune: Base ₹25 (first 1.5 km) + ₹17/km. Night surcharge: +25% (00:00 - 05:00). Negotiate ceiling: +20% buffer.",
    source: "Maharashtra Regional Transport Authority Pune Official Revision",
    confidence: "Formula",
  },
  {
    item: "Transfer Buffer",
    formula: "5 minutes added per modal interchange (station access, ticketing, and platform transfer).",
    source: "ExitSmart Multimodal Transit Buffer Standard",
    confidence: "Formula",
  },
  {
    item: "App Cab Fare Estimate",
    formula: "Industry estimate: Base ₹50 (incl 2 km) + ₹18/km + ₹2/min. Night multiplier: 1.25x. No live aggregator API.",
    source: "Pune App Cab Non-Surge Standard Industry Model",
    confidence: "Estimated",
  },
  {
    item: "Walking Speed",
    formula: "4.5 km/h (75 meters per minute). Detour multiplier: 1.25x straight-line when offline.",
    source: "Standard Pedestrian Speed Heuristic",
    confidence: "Estimated",
  },
];

/**
 * Main recommendation pipeline for ExitSmart.
 */
export async function getRecommendations(
  req: RecommendRequest
): Promise<RecommendResponse> {
  const { origin, destination, mode = "balanced", overrides } = req;
  const departureDate = req.departureTime ? new Date(req.departureTime) : new Date();
  const departureHour = departureDate.getHours();

  // 1. Calculate Direct Door-to-Door Cab & Auto Baseline
  const directRouting = await getLegDistanceAndTime(origin, destination, "drive");
  const directDistanceKm = directRouting.meters / 1000;
  const directCabFare = calculateCabFare(directDistanceKm, directRouting.minutes, departureHour);
  const directAutoFare = calculateAutoFare(directDistanceKm, departureHour);

  const cabDirectEstimate: CabDirectEstimate = {
    minInr: directCabFare.minFare,
    maxInr: directCabFare.maxFare,
    minutes: directRouting.minutes,
    meters: directRouting.meters,
  };

  // Direct distance check
  const straightMeters = haversineDistanceMeters(origin, destination);
  const generatedOptions: Option[] = [];

  // Option D1: Direct Cab Option
  generatedOptions.push({
    id: "direct_cab",
    label: "Fastest",
    tag: null,
    entryStopId: "door_origin",
    entryStopName: origin.label,
    exitStopId: "door_dest",
    exitStopName: destination.label,
    segments: [
      {
        type: "cab",
        from: origin.label,
        to: destination.label,
        fromCoords: origin,
        toCoords: destination,
        minutes: directRouting.minutes,
        inrMin: directCabFare.minFare,
        inrMax: directCabFare.maxFare,
        meters: directRouting.meters,
        confidence: "Estimated",
        fareConfidence: "Estimated",
        timeConfidence: directRouting.confidence,
        polyline: directRouting.polyline,
        details: directCabFare.breakdown,
      },
    ],
    totalMin: directRouting.minutes + 5, // 5 min cab wait
    totalInrMin: directCabFare.minFare,
    totalInrMax: directCabFare.maxFare,
    waitMin: 5,
    transfers: 0,
    walkM: 50,
    confidence: "Medium",
  });

  // Option D2: Direct Auto Option
  generatedOptions.push({
    id: "direct_auto",
    label: "Most Convenient",
    tag: null,
    entryStopId: "door_origin",
    entryStopName: origin.label,
    exitStopId: "door_dest",
    exitStopName: destination.label,
    segments: [
      {
        type: "auto",
        from: origin.label,
        to: destination.label,
        fromCoords: origin,
        toCoords: destination,
        minutes: directRouting.minutes + 2, // autos slightly slower in traffic
        inrMin: directAutoFare.minFare,
        inrMax: directAutoFare.maxFare,
        meters: directRouting.meters,
        confidence: "Formula",
        fareConfidence: "Formula",
        timeConfidence: directRouting.confidence,
        polyline: directRouting.polyline,
        details: directAutoFare.breakdown,
      },
    ],
    totalMin: directRouting.minutes + 2 + 3,
    totalInrMin: directAutoFare.minFare,
    totalInrMax: directAutoFare.maxFare,
    waitMin: 3,
    transfers: 0,
    walkM: 50,
    confidence: "High",
  });

  // If very short journey (< 1.5 km), include direct walk
  if (straightMeters <= 1800) {
    const walkRouting = await getLegDistanceAndTime(origin, destination, "walk");
    generatedOptions.push({
      id: "direct_walk",
      label: "Cheapest",
      tag: null,
      entryStopId: "door_origin",
      entryStopName: origin.label,
      exitStopId: "door_dest",
      exitStopName: destination.label,
      segments: [
        {
          type: "walk",
          from: origin.label,
          to: destination.label,
          fromCoords: origin,
          toCoords: destination,
          minutes: walkRouting.minutes,
          inrMin: 0,
          inrMax: 0,
          meters: walkRouting.meters,
          confidence: "Real",
          polyline: walkRouting.polyline,
          details: "Direct pedestrian route",
        },
      ],
      totalMin: walkRouting.minutes,
      totalInrMin: 0,
      totalInrMax: 0,
      waitMin: 0,
      transfers: 0,
      walkM: walkRouting.meters,
      confidence: "High",
    });
  }

  // 2. Discover Candidate Entry Stops & Candidate Exit Stops
  let entryCandidates = findNearbyStops(origin, 4500, 5);
  let exitCandidates = findNearbyStops(destination, 7500, 6);

  // If user provided overrides, honor them
  if (overrides?.entryStopId) {
    const overrideEntry = findStopById(overrides.entryStopId, origin);
    if (overrideEntry) {
      entryCandidates = [overrideEntry, ...entryCandidates.filter((c) => c.id !== overrideEntry.id)];
    }
  }

  if (overrides?.exitStopId) {
    const overrideExit = findStopById(overrides.exitStopId, destination);
    if (overrideExit) {
      exitCandidates = [overrideExit, ...exitCandidates.filter((c) => c.id !== overrideExit.id)];
    }
  }

  // 3. Find Valid Trunk Connections
  const trunkPairs = findValidTrunkPairs(entryCandidates, exitCandidates, departureHour);

  // Track the nearest entry and exit stops for baseline comparison
  const nearestEntry = entryCandidates[0];
  const nearestExit = exitCandidates[0];

  // 4. For each trunk pair, generate first-mile and last-mile options
  for (let i = 0; i < trunkPairs.length; i++) {
    const pair = trunkPairs[i];
    const { entry, exit } = pair;

    // Check user override filter
    if (overrides?.entryStopId && entry.id !== overrides.entryStopId) continue;
    if (overrides?.exitStopId && exit.id !== overrides.exitStopId) continue;

    // First mile: Origin -> Entry
    const firstMileDist = haversineDistanceMeters(origin, { lat: entry.lat, lng: entry.lng });
    const firstMileWalkRouting = await getLegDistanceAndTime(origin, { lat: entry.lat, lng: entry.lng }, "walk");

    // Last mile: Exit -> Destination
    const lastMileDist = haversineDistanceMeters({ lat: exit.lat, lng: exit.lng }, destination);
    const lastMileWalkRouting = await getLegDistanceAndTime({ lat: exit.lat, lng: exit.lng }, destination, "walk");

    // Combination 1: Public Transit Focused (Walk + Trunk + Walk or Short Auto)
    // First mile: Walk if < 1.2km, else auto
    const fmWalk = firstMileDist <= 1200;
    const firstMileType = fmWalk ? "walk" : "auto";
    const firstMileAutoFare = calculateAutoFare(firstMileDist / 1000, departureHour);
    const firstMileMinutes = fmWalk ? firstMileWalkRouting.minutes : Math.ceil(firstMileDist / 333);
    const firstMileMeters = fmWalk ? firstMileWalkRouting.meters : firstMileDist;
    const firstMileCostMin = fmWalk ? 0 : firstMileAutoFare.minFare;
    const firstMileCostMax = fmWalk ? 0 : firstMileAutoFare.maxFare;

    // Last mile: Walk if < 900m, else Auto
    const lmWalk = lastMileDist <= 900;
    const lastMileType = lmWalk ? "walk" : "auto";
    const lastMileAutoFare = calculateAutoFare(lastMileDist / 1000, departureHour);
    const lastMileMinutes = lmWalk ? lastMileWalkRouting.minutes : Math.ceil(lastMileDist / 333);
    const lastMileMeters = lmWalk ? lastMileWalkRouting.meters : lastMileDist;
    const lastMileCostMin = lmWalk ? 0 : lastMileAutoFare.minFare;
    const lastMileCostMax = lmWalk ? 0 : lastMileAutoFare.maxFare;

    const segments: Segment[] = [
      {
        type: firstMileType,
        from: origin.label,
        to: entry.name,
        fromCoords: origin,
        toCoords: { lat: entry.lat, lng: entry.lng },
        minutes: firstMileMinutes,
        inrMin: firstMileCostMin,
        inrMax: firstMileCostMax,
        meters: firstMileMeters,
        confidence: fmWalk ? "Real" : "Formula",
        polyline: firstMileWalkRouting.polyline,
        details: fmWalk ? "Walk to transit stop" : firstMileAutoFare.breakdown,
      },
      {
        type: pair.trunkType,
        from: entry.name,
        to: exit.name,
        fromCoords: { lat: entry.lat, lng: entry.lng },
        toCoords: { lat: exit.lat, lng: exit.lng },
        minutes: pair.travelMin,
        inrMin: pair.fareInr,
        inrMax: pair.fareInr,
        meters: pair.distanceMeters,
        route: pair.routeName,
        confidence: pair.fareConfidence,
        fareConfidence: pair.fareConfidence,
        timeConfidence: "Real",
        polyline: pair.polyline,
        details: `${pair.routeName} (${(pair.distanceMeters / 1000).toFixed(1)} km)`,
      },
      {
        type: lastMileType,
        from: exit.name,
        to: destination.label,
        fromCoords: { lat: exit.lat, lng: exit.lng },
        toCoords: destination,
        minutes: lastMileMinutes,
        inrMin: lastMileCostMin,
        inrMax: lastMileCostMax,
        meters: lastMileMeters,
        confidence: lmWalk ? "Real" : "Formula",
        polyline: lastMileWalkRouting.polyline,
        details: lmWalk ? "Walk to destination" : lastMileAutoFare.breakdown,
      },
    ];

    // Transfers count: 1 transfer between first-mile and trunk, plus 1 to last-mile.
    // If trunk itself has metro interchange, add 1.
    const transfers = (pair.hasInterchange ? 1 : 0) + (firstMileType !== "walk" ? 1 : 0) + 1;
    const transferBufferMin = transfers * 5; // 5 min buffer per transfer

    const totalMin = firstMileMinutes + pair.travelMin + lastMileMinutes + transferBufferMin;
    const totalInrMin = firstMileCostMin + pair.fareInr + lastMileCostMin;
    const totalInrMax = firstMileCostMax + pair.fareInr + lastMileCostMax;
    const totalWalkM = (firstMileType === "walk" ? firstMileMeters : 50) + (lastMileType === "walk" ? lastMileMeters : 50);

    generatedOptions.push({
      id: `opt_${entry.id}_${exit.id}_${i}`,
      label: "Cheapest",
      tag: null,
      entryStopId: entry.id,
      entryStopName: entry.name,
      exitStopId: exit.id,
      exitStopName: exit.name,
      segments,
      totalMin,
      totalInrMin,
      totalInrMax,
      waitMin: pair.waitMin + (firstMileType === "auto" ? 2 : 0) + (lastMileType === "auto" ? 2 : 0),
      transfers,
      walkM: totalWalkM,
      confidence: pair.trunkType === "metro" ? "High" : "Medium",
    });

    // Combination 2: If last-mile is > 1.5 km, also create a Shared Auto / Bus last mile option
    if (lastMileDist > 1500 && !lmWalk) {
      const sharedFare = calculateSharedAutoFare(lastMileDist / 1000);
      const sharedSegments: Segment[] = [
        ...segments.slice(0, 2),
        {
          type: "shared_auto",
          from: exit.name,
          to: destination.label,
          fromCoords: { lat: exit.lat, lng: exit.lng },
          toCoords: destination,
          minutes: lastMileMinutes + 3,
          inrMin: sharedFare,
          inrMax: sharedFare + 5,
          meters: lastMileMeters,
          confidence: "Estimated",
          polyline: lastMileWalkRouting.polyline,
          details: `Shared auto along corridor (₹${sharedFare})`,
        },
      ];

      generatedOptions.push({
        id: `opt_shared_${entry.id}_${exit.id}_${i}`,
        label: "Cheapest",
        tag: null,
        entryStopId: entry.id,
        entryStopName: entry.name,
        exitStopId: exit.id,
        exitStopName: exit.name,
        segments: sharedSegments,
        totalMin: totalMin + 4,
        totalInrMin: firstMileCostMin + pair.fareInr + sharedFare,
        totalInrMax: firstMileCostMax + pair.fareInr + sharedFare + 5,
        waitMin: pair.waitMin + 6,
        transfers: transfers + 1,
        walkM: totalWalkM + 100,
        confidence: "Medium",
      });
    }
  }

  // 5. Pareto Filtering
  const paretoFrontier = filterParetoFrontier(generatedOptions);

  // 6. Select Top 3 Options (Cheapest, Fastest, Most Convenient)
  const topThree = selectTopThreeOptions(paretoFrontier, mode);

  // 7. Baseline Comparison & ExitSmart Banner Calculation
  // Find the baseline option that uses the nearest entry and exit stops
  let baseline: Option | null = null;
  if (nearestEntry && nearestExit) {
    const baselineCandidate = generatedOptions.find(
      (o) => o.entryStopId === nearestEntry.id && o.exitStopId === nearestExit.id
    );
    if (baselineCandidate) {
      baseline = baselineCandidate;
    }
  }

  // Calculate ExitSmart savings banner
  let exitSmart: ExitSmartBannerInfo | null = null;
  const recommendedBest = topThree[0]; // Primary recommended option

  if (
    nearestEntry &&
    nearestExit &&
    recommendedBest &&
    recommendedBest.entryStopId !== "door_origin"
  ) {
    const isDifferentEntry = recommendedBest.entryStopId !== nearestEntry.id;
    const isDifferentExit = recommendedBest.exitStopId !== nearestExit.id;

    if (isDifferentEntry || isDifferentExit) {
      // Calculate savings vs nearest-stop baseline (or vs direct auto)
      const baselineTime = baseline ? baseline.totalMin : directRouting.minutes + 15;
      const baselineCost = baseline ? baseline.totalInrMin : directAutoFare.minFare;

      const savingMin = Math.max(0, baselineTime - recommendedBest.totalMin);
      const savingInr = Math.max(0, baselineCost - recommendedBest.totalInrMin);

      // Only show banner if there is meaningful time or money saved
      if (savingMin > 2 || savingInr > 15) {
        let summary = "";
        if (isDifferentEntry && isDifferentExit) {
          summary = `Enter at ${recommendedBest.entryStopName} and exit at ${recommendedBest.exitStopName} instead of nearest stops.`;
        } else if (isDifferentExit) {
          summary = `Exit at ${recommendedBest.exitStopName} instead of ${nearestExit.name} for faster and cheaper connectivity.`;
        } else {
          summary = `Enter at ${recommendedBest.entryStopName} instead of ${nearestEntry.name} to avoid traffic bottlenecks.`;
        }

        exitSmart = {
          entryStopId: recommendedBest.entryStopId,
          entryStopName: recommendedBest.entryStopName,
          exitStopId: recommendedBest.exitStopId,
          exitStopName: recommendedBest.exitStopName,
          nearestEntryStopId: nearestEntry.id,
          nearestEntryStopName: nearestEntry.name,
          nearestExitStopId: nearestExit.id,
          nearestExitStopName: nearestExit.name,
          savingMin,
          savingInr,
          summary,
        };
      }
    }
  }

  return {
    exitSmart,
    options: topThree,
    assumptions: ASSUMPTIONS,
    cabDirectEstimate,
    baseline,
  };
}

function findStopById(id: string, refCoords: { lat: number; lng: number }): StopCandidate | null {
  const st = stationsData.find((s) => s.id === id);
  if (st) {
    return {
      id: st.id,
      name: `${st.name} Metro`,
      lat: st.lat,
      lng: st.lng,
      type: "metro_station",
      line: st.line as "Aqua" | "Purple",
      order: st.order,
      isInterchange: st.isInterchange,
      distanceMeters: haversineDistanceMeters(refCoords, { lat: st.lat, lng: st.lng }),
    };
  }

  const stop = stopsData.find((s) => s.id === id);
  if (stop) {
    return {
      id: stop.id,
      name: stop.name,
      lat: stop.lat,
      lng: stop.lng,
      type: stop.type as "bus_stop" | "auto_stand",
      distanceMeters: haversineDistanceMeters(refCoords, { lat: stop.lat, lng: stop.lng }),
    };
  }

  return null;
}
