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
 * Computes routing leg distance and travel time.
 * Tries in-memory cache -> disk cache -> OpenRouteService -> straight-line fallback.
 */
export async function getLegDistanceAndTime(
  from: LatLng,
  to: LatLng,
  mode: "walk" | "drive"
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

  // 3. OpenRouteService API (Server-side)
  const apiKey = process.env.ORS_API_KEY;
  if (apiKey) {
    try {
      const profile = mode === "walk" ? "foot-walking" : "driving-car";
      const url = `https://api.openrouteservice.org/v2/directions/${profile}/geojson`;

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
      });

      if (res.ok) {
        const geojson = await res.json();
        const feature = geojson.features?.[0];
        if (feature) {
          const summary = feature.properties.summary;
          const meters = Math.round(summary.distance);
          const minutes = Math.ceil(summary.duration / 60);
          // Coordinates in GeoJSON are [lng, lat], convert to [lat, lng] for Leaflet
          const polyline: [number, number][] = (feature.geometry.coordinates || []).map(
            (c: [number, number]) => [c[1], c[0]]
          );

          const result: RoutingLegResult = {
            meters,
            minutes,
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
      // Fall through to fallback
    }
  }

  // 4. Fallback: Straight-line distance with urban detour multipliers
  const straightMeters = haversineDistanceMeters(from, to);
  const detourFactor = mode === "walk" ? 1.25 : 1.35;
  const meters = Math.round(straightMeters * detourFactor);

  // Speed: walk 4.5 km/h = 75 m/min; drive 20 km/h = 333 m/min
  const speedMPerMin = mode === "walk" ? 75 : 333;
  const minutes = Math.max(1, Math.ceil(meters / speedMPerMin));

  // Generate a 2-point line (or mid-point jitter)
  const polyline: [number, number][] = [
    [from.lat, from.lng],
    [to.lat, to.lng],
  ];

  const fallbackResult: RoutingLegResult = {
    meters,
    minutes,
    polyline,
    confidence: "Estimated",
    source: "Straight-line with urban detour factor (Offline fallback)",
  };

  memoryCache.set(key, fallbackResult);
  writeDiskCache(key, fallbackResult);
  return fallbackResult;
}
