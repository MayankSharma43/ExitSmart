import { Place } from "../types";
import { haversineDistanceMeters } from "../estimate";
import landmarksData from "@/data/landmarks.json";
import stationsData from "@/data/stations.json";
import stopsData from "@/data/stops.json";

// Pune Metropolitan Center Coordinates
const PUNE_LAT = 18.5204;
const PUNE_LNG = 73.8567;

interface IndexedPlace {
  id: string;
  title: string;
  subtitle: string;
  label: string;
  lat: number;
  lng: number;
  placeType: "metro" | "bus" | "auto" | "landmark" | "area";
  popularity: number;
  tags: string[];
  aliases: string[];
}

// Common Pune transliteration, colloquial, and abbreviation mappings
const PUN_SYNONYMS: Record<string, string[]> = {
  hinjawadi: ["hinjewadi", "rgip", "phase 1", "phase 2", "phase 3"],
  hinjewadi: ["hinjawadi", "rgip", "phase 1", "phase 2", "phase 3"],
  pimpir: ["pimpri", "pcmc"],
  pimpri: ["pcmc", "deluxe"],
  pcmc: ["pimpri", "chinchwad", "bhosari", "nigdi"],
  kotrud: ["kothrud"],
  kothrud: ["paud road", "vanaz", "karve statue"],
  vimannagar: ["viman", "nagar", "phoenix"],
  viman: ["vimannagar", "phoenix"],
  airport: ["lohegaon", "pnq", "terminal 2", "flight"],
  lohegaon: ["airport", "pnq"],
  station: ["railway", "pune jn", "pune station", "train"],
  railway: ["station", "pune junction"],
  swargate: ["swar gate", "st stand"],
  hadpsar: ["hadapsar", "magarpatta"],
  hadapsar: ["magarpatta", "gadital", "amanora"],
  marketcity: ["phoenix", "viman nagar"],
  phoenix: ["marketcity", "wakad millennium"],
  eon: ["kharadi", "tech park", "wtc"],
  wtc: ["world trade center", "kharadi"],
  bhs: ["balewadi high street", "balewadi"],
  coep: ["shivajinagar", "engineering"],
  sppu: ["pune university", "ganeshkhind"],
  fergusson: ["fc road", "deccan"],
  mit: ["mit wpu", "kothrud", "paud road"],
  shiwaji: ["shivaji", "shivajinagar"],
  shivajinagar: ["shivaji nagar", "st stand"],
  chandan: ["chandan nagar", "kharadi bypass"],
};

/**
 * Calculates Damerau-Levenshtein distance between two strings,
 * which accounts for insertions, deletions, substitutions, and transpositions (e.g. "pimpir" -> "pimpri").
 */
export function damerauLevenshtein(a: string, b: string): number {
  const al = a.length;
  const bl = b.length;
  if (al === 0) return bl;
  if (bl === 0) return al;

  const d: number[][] = [];
  for (let i = 0; i <= al; i++) {
    d[i] = [];
    d[i][0] = i;
  }
  for (let j = 0; j <= bl; j++) {
    d[0][j] = j;
  }

  for (let i = 1; i <= al; i++) {
    for (let j = 1; j <= bl; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(
        d[i - 1][j] + 1, // deletion
        d[i][j - 1] + 1, // insertion
        d[i - 1][j - 1] + cost // substitution
      );

      // Transposition
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
      }
    }
  }

  return d[al][bl];
}

// Build pre-indexed local catalog
let CATALOG_CACHE: IndexedPlace[] | null = null;

function getCatalog(): IndexedPlace[] {
  if (CATALOG_CACHE) return CATALOG_CACHE;

  const catalog: IndexedPlace[] = [];

  // 1. Metro stations (Top priority transit hubs)
  for (const st of stationsData) {
    const isInterchange = st.isInterchange;
    catalog.push({
      id: st.id,
      title: `${st.name} Metro Station`,
      subtitle: `${st.line} Line ${isInterchange ? "• Interchange Hub" : ""} • Pune Metro`,
      label: `${st.name} Metro Station, Pune`,
      lat: st.lat,
      lng: st.lng,
      placeType: "metro",
      popularity: isInterchange ? 95 : 85,
      tags: ["metro", "station", "transit", st.line.toLowerCase(), st.name.toLowerCase()],
      aliases: [
        `${st.name.toLowerCase()} metro`,
        st.name.toLowerCase(),
        `${st.name.toLowerCase()} station`,
        `${st.line.toLowerCase()} line`,
      ],
    });
  }

  // 2. Curated Pune Landmarks, Tech Parks, Malls, Hospitals, Terminals
  for (const lm of (landmarksData as any[])) {
    let placeType: "metro" | "bus" | "auto" | "landmark" | "area" = "landmark";
    let pop = 70;

    if (lm.category === "Airport" || lm.category === "Transit Hub") {
      pop = 90;
      if (lm.category === "Transit Hub" && lm.name.toLowerCase().includes("bus")) {
        placeType = "bus";
      }
    } else if (lm.category === "Tech Park") {
      pop = 80;
    } else if (lm.category === "Mall & Entertainment") {
      pop = 75;
    }

    catalog.push({
      id: lm.id,
      title: lm.name,
      subtitle: `${lm.area}, Pune • ${lm.category}`,
      label: `${lm.name}, ${lm.area}, Pune`,
      lat: lm.lat,
      lng: lm.lng,
      placeType,
      popularity: pop,
      tags: [
        lm.area.toLowerCase(),
        lm.category.toLowerCase(),
        ...(lm.tags || []).map((t: string) => t.toLowerCase()),
      ],
      aliases: (lm.aliases || []).map((a: string) => a.toLowerCase()),
    });
  }

  // 3. PMPML Bus Stops & Auto Stands
  for (const s of stopsData) {
    const isBus = s.type === "bus_stop";
    catalog.push({
      id: s.id,
      title: s.name,
      subtitle: isBus ? "PMPML Bus Stop • Pune" : "Official Auto Rickshaw Stand • RTO Tariff",
      label: `${s.name}, Pune`,
      lat: s.lat,
      lng: s.lng,
      placeType: isBus ? "bus" : "auto",
      popularity: 60,
      tags: [isBus ? "bus" : "auto", "stop", "stand", s.name.toLowerCase()],
      aliases: [s.name.toLowerCase()],
    });
  }

  CATALOG_CACHE = catalog;
  return catalog;
}

/**
 * Computes match score for a given catalog item against search tokens.
 * Higher score = better match. Returns 0 if it doesn't qualify.
 */
function scoreItem(
  item: IndexedPlace,
  cleanQuery: string,
  queryTokens: string[]
): number {
  const titleLower = item.title.toLowerCase();
  const subtitleLower = item.subtitle.toLowerCase();
  const labelLower = item.label.toLowerCase();

  // Exact phrase match
  if (titleLower === cleanQuery || item.aliases.includes(cleanQuery)) {
    return 1000 + item.popularity;
  }

  // Title starts with exact query
  if (titleLower.startsWith(cleanQuery)) {
    return 800 + item.popularity;
  }

  // Title contains exact query as substring
  if (titleLower.includes(cleanQuery)) {
    return 600 + item.popularity;
  }

  // Check alias exact/prefix match
  for (const alias of item.aliases) {
    if (alias === cleanQuery) return 900 + item.popularity;
    if (alias.startsWith(cleanQuery)) return 750 + item.popularity;
    if (alias.includes(cleanQuery)) return 550 + item.popularity;
  }

  // Multi-token evaluation with typo tolerance and synonym expansion
  let tokenMatchScore = 0;
  let allTokensMatched = true;

  for (const qTok of queryTokens) {
    if (qTok.length < 2) continue;

    // Check if token matches directly in title, subtitle, label, tags, or aliases
    let matchedThisToken = false;
    let bestTokenScore = 0;

    // 1. Direct word starts-with or contains
    const words = titleLower.split(/[\s,./()-]+/).filter(Boolean);
    for (const w of words) {
      if (w === qTok) {
        bestTokenScore = Math.max(bestTokenScore, 100);
        matchedThisToken = true;
      } else if (w.startsWith(qTok)) {
        bestTokenScore = Math.max(bestTokenScore, 70);
        matchedThisToken = true;
      }
    }

    // 2. Check tags & aliases
    if (!matchedThisToken) {
      for (const t of item.tags) {
        if (t === qTok || t.startsWith(qTok)) {
          bestTokenScore = Math.max(bestTokenScore, 50);
          matchedThisToken = true;
          break;
        }
      }
    }

    // 3. Synonym matching
    if (!matchedThisToken && PUN_SYNONYMS[qTok]) {
      const syns = PUN_SYNONYMS[qTok];
      for (const s of syns) {
        if (titleLower.includes(s) || item.aliases.some((a) => a.includes(s))) {
          bestTokenScore = Math.max(bestTokenScore, 65);
          matchedThisToken = true;
          break;
        }
      }
    }

    // 4. Typo tolerance: Damerau-Levenshtein edit distance for tokens >= 3 chars
    if (!matchedThisToken && qTok.length >= 3) {
      const maxAllowedDist = qTok.length >= 6 ? 2 : 1;
      for (const w of words) {
        if (Math.abs(w.length - qTok.length) <= maxAllowedDist) {
          const dist = damerauLevenshtein(qTok, w);
          if (dist <= maxAllowedDist) {
            bestTokenScore = Math.max(bestTokenScore, 45 - dist * 10);
            matchedThisToken = true;
            break;
          }
        }
      }

      // Check aliases with typo tolerance
      if (!matchedThisToken) {
        for (const alias of item.aliases) {
          const aliasWords = alias.split(/[\s,./()-]+/);
          for (const aw of aliasWords) {
            if (Math.abs(aw.length - qTok.length) <= maxAllowedDist) {
              const dist = damerauLevenshtein(qTok, aw);
              if (dist <= maxAllowedDist) {
                bestTokenScore = Math.max(bestTokenScore, 40 - dist * 10);
                matchedThisToken = true;
                break;
              }
            }
          }
          if (matchedThisToken) break;
        }
      }
    }

    // 5. Check subtitle / label fallback
    if (!matchedThisToken && (subtitleLower.includes(qTok) || labelLower.includes(qTok))) {
      bestTokenScore = Math.max(bestTokenScore, 30);
      matchedThisToken = true;
    }

    if (matchedThisToken) {
      tokenMatchScore += bestTokenScore;
    } else {
      allTokensMatched = false;
      break;
    }
  }

  if (allTokensMatched && tokenMatchScore > 0) {
    return tokenMatchScore + item.popularity;
  }

  return 0;
}

/**
 * Searches places across the local curated Pune & PCMC transit dataset with typo-tolerant fuzzy matching,
 * and seamlessly blends live OpenStreetMap Photon / Nominatim geocoding for any street, society, or address.
 */
export async function searchPlaces(query: string): Promise<Place[]> {
  const cleanQuery = query.trim().toLowerCase();
  if (!cleanQuery) return [];

  const catalog = getCatalog();
  const queryTokens = cleanQuery.split(/\s+/).filter(Boolean);

  // Score and rank all local candidates
  const scoredItems: { item: IndexedPlace; score: number }[] = [];
  for (const item of catalog) {
    const score = scoreItem(item, cleanQuery, queryTokens);
    if (score > 0) {
      scoredItems.push({ item, score });
    }
  }

  // Sort by score descending
  scoredItems.sort((a, b) => b.score - a.score);

  const results: Place[] = [];
  const seenKeys = new Set<string>();

  for (const { item } of scoredItems) {
    const key = `${item.title.toLowerCase()}_${item.lat.toFixed(3)}_${item.lng.toFixed(3)}`;
    if (!seenKeys.has(key)) {
      seenKeys.add(key);
      results.push({
        id: item.id,
        title: item.title,
        subtitle: item.subtitle,
        label: item.label,
        lat: item.lat,
        lng: item.lng,
        placeType: item.placeType,
      });
    }
    if (results.length >= 8) break;
  }

  // If local results are ample and high quality, return immediately
  if (results.length >= 5) {
    return results.slice(0, 8);
  }

  // Otherwise, query Live OpenStreetMap Photon API (with Pune centroid bias)
  try {
    const photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(
      query
    )}&lat=${PUNE_LAT}&lon=${PUNE_LNG}&limit=8`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

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
          const title = props.name || props.street || query.trim();
          const district = props.district || props.suburb || props.locality || "";
          const city = props.city || props.town || props.county || "Pune";
          const state = props.state || "Maharashtra";

          const subParts = [district, city, state].filter(Boolean);
          const cleanSubtitle =
            subParts.filter((v, i, a) => a.indexOf(v) === i).join(", ") ||
            "Pune, Maharashtra";

          const lat = f.geometry.coordinates[1];
          const lng = f.geometry.coordinates[0];
          const key = `${title.toLowerCase()}_${lat.toFixed(3)}_${lng.toFixed(3)}`;

          if (!seenKeys.has(key)) {
            seenKeys.add(key);
            let placeType: "metro" | "bus" | "auto" | "landmark" | "area" = "landmark";
            if (props.osm_value === "station" || props.osm_value === "subway") {
              placeType = "metro";
            } else if (props.osm_value === "bus_stop") {
              placeType = "bus";
            } else if (
              props.osm_value === "city" ||
              props.osm_value === "suburb" ||
              props.osm_value === "town"
            ) {
              placeType = "area";
            }

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
          if (results.length >= 8) break;
        }
      }
    }
  } catch {
    // Network timeout or offline - gracefully proceed with local results
  }

  // Fallback to Nominatim if still sparse
  if (results.length < 3) {
    try {
      const nomUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        query
      )}&countrycodes=in&viewbox=73.65,18.75,74.15,18.35&limit=4`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);

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
            const title = rawParts[0] || query.trim();
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
            if (results.length >= 8) break;
          }
        }
      }
    } catch {
      // Offline fallback
    }
  }

  return results.slice(0, 8);
}

/**
 * Reverse geocodes a coordinate (lat, lng) to a friendly street address / landmark name.
 */
export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  // 1. Try local exact match first (within 300 meters of a landmark or station)
  const catalog = getCatalog();
  let closestItem: IndexedPlace | null = null;
  let minDistance = Infinity;

  for (const item of catalog) {
    const dist = haversineDistanceMeters({ lat, lng }, { lat: item.lat, lng: item.lng });
    if (dist < minDistance) {
      minDistance = dist;
      closestItem = item;
    }
  }

  if (closestItem && minDistance <= 350) {
    return `${closestItem.title}, ${closestItem.subtitle.split("•")[0].trim()}`;
  }

  // 2. Try Photon reverse geocoding
  try {
    const url = `https://photon.komoot.io/reverse?lat=${lat}&lon=${lng}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

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

  // 3. Try Nominatim reverse geocoding
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

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

  // 4. Local proximity fallback
  if (closestItem && minDistance <= 1500) {
    return `Near ${closestItem.title} (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
  }

  return `Pinned Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
}
