import { Place } from "../types";
import { haversineDistanceMeters } from "../estimate";
import landmarks from "@/data/landmarks.json";
import stations from "@/data/stations.json";
import stops from "@/data/stops.json";

// Pune Metropolitan Coordinates
const PUNE_LAT = 18.5204;
const PUNE_LNG = 73.8567;

/**
 * Searches places across the entire map using live OpenStreetMap (Photon + Nominatim)
 * with Pune biasing, as well as local transit stops and landmarks.
 * Works for any address, street, colony, market, station, or city just like Google Maps.
 */
export async function searchPlaces(query: string): Promise<Place[]> {
  const cleanQuery = query.trim();
  if (!cleanQuery) return [];

  const results: Place[] = [];
  const seenKeys = new Set<string>();

  // 1. Search local curated transit stops & landmarks first for instant matching
  const lower = cleanQuery.toLowerCase();
  const tokens = lower.split(/\s+/).filter(Boolean);

  const localCandidates: Place[] = [];

  // Metro stations
  for (const st of stations) {
    localCandidates.push({
      id: st.id,
      title: `${st.name} Metro Station`,
      subtitle: `${st.line} Line ${st.isInterchange ? "• Interchange" : ""}, Pune`,
      label: `${st.name} Metro Station, Pune`,
      lat: st.lat,
      lng: st.lng,
      placeType: "metro",
    });
  }

  // Landmarks & Tech Parks
  for (const lm of landmarks) {
    localCandidates.push({
      id: lm.id,
      title: lm.name,
      subtitle: `${lm.area}, Pune • ${lm.category}`,
      label: `${lm.name}, ${lm.area}, Pune`,
      lat: lm.lat,
      lng: lm.lng,
      placeType: "landmark",
    });
  }

  // PMPML Bus Stops & Stands
  for (const s of stops) {
    const isBus = s.type === "bus_stop";
    localCandidates.push({
      id: s.id,
      title: s.name,
      subtitle: isBus ? "PMPML Bus Stop, Pune" : "Auto Rickshaw Stand, Pune",
      label: `${s.name}, Pune`,
      lat: s.lat,
      lng: s.lng,
      placeType: isBus ? "bus" : "auto",
    });
  }

  // Filter local candidates strictly matching query tokens
  for (const item of localCandidates) {
    const tLower = (item.title || "").toLowerCase();
    const sLower = (item.subtitle || "").toLowerCase();
    const lLower = item.label.toLowerCase();

    if (tokens.every((tok) => tLower.includes(tok) || sLower.includes(tok) || lLower.includes(tok))) {
      const key = `${item.title?.toLowerCase()}_${item.lat.toFixed(3)}_${item.lng.toFixed(3)}`;
      if (!seenKeys.has(key)) {
        seenKeys.add(key);
        results.push(item);
      }
    }
  }

  // 2. Query Live OpenStreetMap database via Photon API (Worldwide / Pan-Pune & Maharashtra)
  try {
    const photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(
      cleanQuery
    )}&lat=${PUNE_LAT}&lon=${PUNE_LNG}&limit=8`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(photonUrl, {
      headers: { "User-Agent": "ExitSmart-Pune/1.0" },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data.features && Array.isArray(data.features)) {
        for (const f of data.features) {
          const props = f.properties || {};
          const title = props.name || props.street || cleanQuery;
          const district = props.district || props.suburb || props.locality || "";
          const city = props.city || props.town || props.county || "Pune";
          const state = props.state || "Maharashtra";

          const subParts = [district, city, state].filter(Boolean);
          // Deduplicate adjacent identical parts
          const cleanSubtitle = subParts
            .filter((v, i, a) => a.indexOf(v) === i)
            .join(", ") || "Maharashtra, India";

          const lat = f.geometry.coordinates[1];
          const lng = f.geometry.coordinates[0];
          const key = `${title.toLowerCase()}_${lat.toFixed(3)}_${lng.toFixed(3)}`;

          if (!seenKeys.has(key)) {
            seenKeys.add(key);
            let placeType: "metro" | "bus" | "auto" | "landmark" | "area" = "landmark";
            if (props.osm_value === "station" || props.osm_value === "subway") placeType = "metro";
            else if (props.osm_value === "bus_stop") placeType = "bus";
            else if (props.osm_value === "city" || props.osm_value === "suburb" || props.osm_value === "town") placeType = "area";

            results.push({
              id: `osm_${props.osm_id || Math.random()}`,
              title,
              subtitle: cleanSubtitle,
              label: `${title}, ${cleanSubtitle}`,
              lat,
              lng,
              placeType,
            });
          }
        }
      }
    }
  } catch (err) {
    // Timeout or network fallback
  }

  // 3. Fallback to OpenStreetMap Nominatim if results are still sparse
  if (results.length < 3) {
    try {
      const nomUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        cleanQuery
      )}&countrycodes=in&viewbox=73.65,18.75,74.15,18.35&limit=5`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const nomRes = await fetch(nomUrl, {
        headers: { "User-Agent": "ExitSmart-Pune/1.0" },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (nomRes.ok) {
        const nomData = await nomRes.json();
        if (Array.isArray(nomData)) {
          for (const item of nomData) {
            const rawParts = item.display_name.split(",").map((s: string) => s.trim());
            const title = rawParts[0] || cleanQuery;
            const subtitle = rawParts.slice(1, 4).join(", ") || "Pune, Maharashtra";
            const lat = parseFloat(item.lat);
            const lng = parseFloat(item.lon);
            const key = `${title.toLowerCase()}_${lat.toFixed(3)}_${lng.toFixed(3)}`;

            if (!seenKeys.has(key)) {
              seenKeys.add(key);
              results.push({
                id: `nom_${item.place_id || Math.random()}`,
                title,
                subtitle,
                label: `${title}, ${subtitle}`,
                lat,
                lng,
                placeType: "landmark",
              });
            }
          }
        }
      }
    } catch {
      // Ignore
    }
  }

  return results.slice(0, 8);
}

/**
 * Reverse geocodes a coordinate (lat, lng) to a friendly street address / landmark name.
 */
export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  // 1. Try Photon reverse geocoding
  try {
    const url = `https://photon.komoot.io/reverse?lat=${lat}&lon=${lng}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const res = await fetch(url, {
      headers: { "User-Agent": "ExitSmart-Pune/1.0" },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const f = data.features?.[0];
      if (f && f.properties) {
        const p = f.properties;
        const name = p.name || p.street || p.district || p.suburb;
        const city = p.city || p.town || p.county || "Pune";
        if (name) {
          return `${name}, ${city}`;
        }
      }
    }
  } catch {
    // Fall through
  }

  // 2. Try Nominatim reverse geocoding
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const res = await fetch(url, {
      headers: { "User-Agent": "ExitSmart-Pune/1.0" },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.display_name) {
        const parts = data.display_name.split(",").map((s: string) => s.trim());
        return parts.slice(0, 3).join(", ");
      }
    }
  } catch {
    // Fall through
  }

  // 3. Local fallback: Find closest landmark or station
  let closestName = "";
  let minDistance = Infinity;

  for (const lm of landmarks) {
    const dist = haversineDistanceMeters({ lat, lng }, { lat: lm.lat, lng: lm.lng });
    if (dist < minDistance) {
      minDistance = dist;
      closestName = `${lm.name} (${lm.area})`;
    }
  }

  for (const st of stations) {
    const dist = haversineDistanceMeters({ lat, lng }, { lat: st.lat, lng: st.lng });
    if (dist < minDistance) {
      minDistance = dist;
      closestName = `${st.name} Metro`;
    }
  }

  if (minDistance <= 1500) {
    return `Near ${closestName} (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
  }

  return `Pinned Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
}
