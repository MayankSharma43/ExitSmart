import { LatLng, ConfidenceLabel } from "../types";
import { haversineDistanceMeters } from "../estimate";
import fs from "fs";
import path from "path";

export interface RoutingLegResult {
  meters: number;
  minutes: number;
  polyline: [number, number][]; // [lat, lng] array for Leaflet
  confidence: ConfidenceLabel;
  source: string;
}

// In-memory cache
const memoryCache = new Map<string, RoutingLegResult>();

function getCacheKey(from: LatLng, to: LatLng, mode: "walk" | "drive"): string {
  const fLat = from.lat.toFixed(4);
  const fLng = from.lng.toFixed(4);
  const tLat = to.lat.toFixed(4);
  const tLng = to.lng.toFixed(4);
  return `${mode}_${fLat}_${fLng}_${tLat}_${tLng}`;
}

const CACHE_FILE = path.join(process.cwd(), "data", "cache", "routes.json");

function readDiskCache(): Record<string, RoutingLegResult> {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      const data = fs.readFileSync(CACHE_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch {
    // Ignore read errors
  }
  return {};
}

function writeDiskCache(key: string, val: RoutingLegResult) {
  try {
    const current = readDiskCache();
    current[key] = val;
    fs.writeFileSync(CACHE_FILE, JSON.stringify(current, null, 2), "utf-8");
  } catch {
    // Ignore write errors
  }
}

/**
 * Computes real-world routing leg distance, duration, and road geometry polyline.
 * Priority pipeline:
 * 1. In-memory cache
 * 2. Persistent disk cache
 * 3. OpenRouteService (if ORS_API_KEY is configured)
 * 4. High-accuracy OpenStreetMap OSRM Routing Engine (real Pune road network & geometry)
 * 5. Fallback: Straight-line distance with calibrated urban detour multipliers
 */
export async function getLegDistanceAndTime(
  from: LatLng,
  to: LatLng,
  mode: "walk" | "drive",
  departureHour?: number
): Promise<RoutingLegResult> {
  const key = getCacheKey(from, to, mode);

  // 1. In-memory cache
  if (memoryCache.has(key)) {
    return memoryCache.get(key)!;
  }

  // 2. Disk cache
  const disk = readDiskCache();
  if (disk[key]) {
    memoryCache.set(key, disk[key]);
    return disk[key];
  }

  // 3. OpenRouteService API (Server-side if key provided)
  const apiKey = process.env.ORS_API_KEY;
  if (apiKey) {
    try {
      const profile = mode === "walk" ? "foot-walking" : "driving-car";
      const url = `https://api.openrouteservice.org/v2/directions/${profile}/geojson`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const res = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          coordinates: [
            [from.lng, from.lat],
            [to.lng, to.lat],
          ],
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const geojson = await res.json();
        const feature = geojson.features?.[0];
        if (feature) {
          const summary = feature.properties.summary;
          const meters = Math.round(summary.distance);
          let minutes = Math.ceil(summary.duration / 60);

          // Apply peak hour traffic multiplier for driving
          if (mode === "drive" && departureHour !== undefined) {
            const isPeak =
              (departureHour >= 8 && departureHour <= 11) ||
              (departureHour >= 17 && departureHour <= 20);
            if (isPeak) minutes = Math.round(minutes * 1.25);
          }

          const polyline: [number, number][] = (feature.geometry.coordinates || []).map(
            (c: [number, number]) => [c[1], c[0]]
          );

          const result: RoutingLegResult = {
            meters,
            minutes: Math.max(1, minutes),
            polyline,
            confidence: "Real",
            source: "OpenRouteService",
          };

          memoryCache.set(key, result);
          writeDiskCache(key, result);
          return result;
        }
      }
    } catch {
      // Fall through to OSRM
    }
  }

  // 4. OpenStreetMap OSRM Public Routing Engine (Accurate real road network)
  try {
    const osrmProfile = mode === "walk" ? "walking" : "driving";
    const osrmUrl = `https://router.project-osrm.org/route/v1/${osrmProfile}/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const osrmRes = await fetch(osrmUrl, {
      signal: controller.signal,
      headers: { "User-Agent": "ExitSmart-Pune/1.0" },
    });
    clearTimeout(timeoutId);

    if (osrmRes.ok) {
      const data = await osrmRes.json();
      if (data.code === "Ok" && data.routes && data.routes.length > 0) {
        const primaryRoute = data.routes[0];
        const meters = Math.round(primaryRoute.distance);
        let minutes = Math.ceil(primaryRoute.duration / 60);

        // Adjust for Pune dense urban traffic during peak periods
        if (mode === "drive") {
          // OSRM raw driving duration is free-flow. Calibrate for Pune real-world traffic:
          let trafficFactor = 1.35; // Standard Pune daytime urban multiplier
          if (departureHour !== undefined) {
            const isPeak =
              (departureHour >= 8 && departureHour <= 11) ||
              (departureHour >= 17 && departureHour <= 20);
            const isLateNight = departureHour >= 23 || departureHour <= 5;
            if (isPeak) trafficFactor = 1.65;
            else if (isLateNight) trafficFactor = 1.05;
          }
          minutes = Math.max(2, Math.round(minutes * trafficFactor));
        } else {
          // Walking speed ~4.5 km/h
          minutes = Math.max(1, Math.ceil(meters / 75));
        }

        const polyline: [number, number][] = (
          primaryRoute.geometry?.coordinates || []
        ).map((c: [number, number]) => [c[1], c[0]]);

        const result: RoutingLegResult = {
          meters,
          minutes,
          polyline: polyline.length > 0 ? polyline : [[from.lat, from.lng], [to.lat, to.lng]],
          confidence: "Real",
          source: "OSRM Real-time Road Network",
        };

        memoryCache.set(key, result);
        writeDiskCache(key, result);
        return result;
      }
    }
  } catch {
    // Network timeout or offline - graceful fallback to calibrated model
  }

  // 5. Fallback: Straight-line distance with calibrated urban detour factor
  const straightMeters = haversineDistanceMeters(from, to);
  const detourFactor = mode === "walk" ? 1.25 : 1.35;
  const meters = Math.round(straightMeters * detourFactor);

  // Speed: walk 4.5 km/h = 75 m/min; drive 20 km/h = 333 m/min (peak 16 km/h)
  let speedMPerMin = mode === "walk" ? 75 : 333;
  if (mode === "drive" && departureHour !== undefined) {
    const isPeak =
      (departureHour >= 8 && departureHour <= 11) ||
      (departureHour >= 17 && departureHour <= 20);
    if (isPeak) speedMPerMin = 267; // 16 km/h
  }
  const minutes = Math.max(1, Math.ceil(meters / speedMPerMin));

  const polyline: [number, number][] = [
    [from.lat, from.lng],
    [to.lat, to.lng],
  ];

  const fallbackResult: RoutingLegResult = {
    meters,
    minutes,
    polyline,
    confidence: "Estimated",
    source: "Calibrated Urban Detour Factor (Offline)",
  };

  memoryCache.set(key, fallbackResult);
  writeDiskCache(key, fallbackResult);
  return fallbackResult;
}
