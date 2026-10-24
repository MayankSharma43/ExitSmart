import { LatLng, StopCandidate, ConfidenceLabel } from "./types";
import { haversineDistanceMeters, estimateMetroTime, estimateBusTime } from "./estimate";
import { calculateMetroFare, calculatePMPMLFare } from "./fares";
import stationsData from "@/data/stations.json";
import stopsData from "@/data/stops.json";
import pmpmlRoutes from "@/data/pmpml_routes.json";

export interface TrunkPair {
  entry: StopCandidate;
  exit: StopCandidate;
  trunkType: "metro" | "bus";
  routeId?: string;
  routeName?: string;
  stationsTraversed?: number;
  hasInterchange?: boolean;
  distanceMeters: number;
  fareInr: number;
  fareConfidence: ConfidenceLabel;
  travelMin: number;
  waitMin: number;
  polyline: [number, number][];
}

/**
 * Finds all candidate transit stops within a maximum radius of a given point.
 */
export function findNearbyStops(
  coords: LatLng,
  maxRadiusMeters: number = 4000,
  limit: number = 6
): StopCandidate[] {
  const candidates: StopCandidate[] = [];

  // 1. Check Metro stations
  for (const st of stationsData) {
    const dist = haversineDistanceMeters(coords, { lat: st.lat, lng: st.lng });
    if (dist <= maxRadiusMeters) {
      candidates.push({
        id: st.id,
        name: `${st.name} Metro`,
        lat: st.lat,
        lng: st.lng,
        type: "metro_station",
        line: st.line as "Aqua" | "Purple",
        order: st.order,
        isInterchange: st.isInterchange,
        distanceMeters: dist,
      });
    }
  }

  // 2. Check Bus stops & Auto stands
  for (const stop of stopsData) {
    const dist = haversineDistanceMeters(coords, { lat: stop.lat, lng: stop.lng });
    if (dist <= maxRadiusMeters) {
      candidates.push({
        id: stop.id,
        name: stop.name,
        lat: stop.lat,
        lng: stop.lng,
        type: stop.type as "bus_stop" | "auto_stand",
        distanceMeters: dist,
      });
    }
  }

  // Sort by distance ascending and return top N
  candidates.sort((a, b) => a.distanceMeters - b.distanceMeters);
  return candidates.slice(0, limit);
}

/**
 * Finds valid trunk connections between candidate entry stops and candidate exit stops.
 * A trunk connection is valid if:
 * 1. Both are metro stations on the same line, or connected via District Court interchange.
 * 2. Both are on a PMPML bus route in sequential order (or nearby linked stops).
 */
export function findValidTrunkPairs(
  entries: StopCandidate[],
  exits: StopCandidate[],
  departureHour?: number
): TrunkPair[] {
  const validPairs: TrunkPair[] = [];

  for (const entry of entries) {
    for (const exit of exits) {
      if (entry.id === exit.id) continue;

      // Case A: Both are Metro stations
      if (entry.type === "metro_station" && exit.type === "metro_station") {
        const sameLine = entry.line === exit.line;
        const hasInterchange = !sameLine; // Aqua <-> Purple transfers at District Court

        let stationsTraversed = 1;
        if (sameLine && entry.order !== undefined && exit.order !== undefined) {
          stationsTraversed = Math.abs(exit.order - entry.order);
        } else if (hasInterchange && entry.order !== undefined && exit.order !== undefined) {
          // Aqua DC is order 9, Purple DC is order 6
          const entryToDC = entry.line === "Aqua" ? Math.abs(entry.order - 9) : Math.abs(entry.order - 6);
          const exitFromDC = exit.line === "Aqua" ? Math.abs(exit.order - 9) : Math.abs(exit.order - 6);
          stationsTraversed = entryToDC + exitFromDC;
        }

        const distanceM = stationsTraversed * 1400; // ~1.4 km between stations on average
        const fare = calculateMetroFare(distanceM / 1000);
        const { minutes, waitMinutes } = estimateMetroTime(stationsTraversed, hasInterchange, departureHour);

        validPairs.push({
          entry,
          exit,
          trunkType: "metro",
          routeName: hasInterchange ? "Aqua Line -> Purple Line" : `${entry.line} Line Metro`,
          stationsTraversed,
          hasInterchange,
          distanceMeters: distanceM,
          fareInr: fare,
          fareConfidence: "Real",
          travelMin: minutes,
          waitMin: waitMinutes,
          polyline: [
            [entry.lat, entry.lng],
            ...(hasInterchange ? [[18.5283, 73.8566] as [number, number]] : []),
            [exit.lat, exit.lng],
          ],
        });
      }

      // Case B: PMPML Bus Route connection
      for (const route of pmpmlRoutes) {
        // Find if entry stop (or a stop very close to entry) and exit stop are on the route
        const entryIdx = route.stops.findIndex(
          (sId) => sId === entry.id || (entry.id === "metro_ramwadi" && sId === "stop_ramwadi_metro")
        );
        const exitIdx = route.stops.findIndex(
          (sId) => sId === exit.id || (exit.id === "metro_ramwadi" && sId === "stop_ramwadi_metro")
        );

        if (entryIdx !== -1 && exitIdx !== -1 && entryIdx < exitIdx) {
          // Valid forward sequential journey on this bus route
          const stopsCount = exitIdx - entryIdx;
          const distanceM = stopsCount * 1200; // ~1.2 km between bus stages
          const fare = calculatePMPMLFare(distanceM / 1000);
          const { minutes, waitMinutes } = estimateBusTime(distanceM, route.headwayMin, departureHour);

          validPairs.push({
            entry,
            exit,
            trunkType: "bus",
            routeId: route.id,
            routeName: `PMPML Bus ${route.routeNumber} (${route.name})`,
            distanceMeters: distanceM,
            fareInr: fare,
            fareConfidence: "Real",
            travelMin: minutes,
            waitMin: waitMinutes,
            polyline: [
              [entry.lat, entry.lng],
              [exit.lat, exit.lng],
            ],
          });
        }
      }
    }
  }

  return validPairs;
}
