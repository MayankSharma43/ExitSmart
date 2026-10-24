# ExitSmart: Architecture & Design Decisions

This document records architectural, algorithmic, and data decisions made during development according to Rule 7.

---

## 1. Maps & Tile Provider
- **Decision:** Use Leaflet with OpenStreetMap (OSM) standard tiles by default.
- **Rationale:** Free, open, zero configuration required. Allows optional swap to MapTiler via `NEXT_PUBLIC_MAPTILER_KEY` if provided.
- **Provider boundary:** All map configurations are kept in `/lib/providers/map-config.ts`.

## 2. Geocoding & Autocomplete
- **Decision:** Use Geoapify Geocoding API bounded to the Pune metropolitan area `[18.35, 73.65, 18.70, 74.10]`. If `NEXT_PUBLIC_GEOAPIFY_KEY` is absent or the API fails/is offline, fall back to searching local curated landmarks in `landmarks.json` and stations in `stations.json`.
- **Rationale:** Ensures reliable search even during network disruption or without an API key.

## 3. Routing Provider & Detour Factor Fallback
- **Decision:** Use OpenRouteService (server-side only) with in-memory caching and persistent JSON cache in `/data/cache/`. When offline, rate-limited, or key is missing, fall back to Haversine distance with standard urban detour multipliers:
  - Walk: 1.25x straight-line distance, speed 4.5 km/h.
  - Road (Auto / Cab / Bus): 1.35x straight-line distance, speed 20 km/h (day) or 25 km/h (night/off-peak).
- **Labeling:** Mark distances calculated via straight-line fallback as `Estimated (offline)`.

## 4. Maharashtra RTO Pune Auto Fare Tariff
- **Decision:** Pune RTO formula:
  - Base minimum fare: ₹25 for the first 1.5 km.
  - Subsequent rate: ₹17.00 per km (₹1.70 per 100 meters).
  - Night surcharge: 25% extra between 00:00 (midnight) and 05:00.
  - "Negotiate up to" ceiling: Base fare + 20% buffer (reflects realistic traffic / driver negotiation tolerance).
- **Confidence:** `Formula` (RTO standard).

## 5. Transit Fare Slabs
- **Pune Metro:**
  - Official fare stages: 0-2 km: ₹10, 2-4 km: ₹15, 4-8 km: ₹20, 8-12 km: ₹25, 12-16 km: ₹30, >16 km: ₹35.
  - Confidence: `Real` (verified Maha Metro tariff card).
- **PMPML Bus:**
  - Stage-based fare structure: Stage 1 (0-2 km): ₹5, Stage 2 (2-4 km): ₹10, Stage 3 (4-8 km): ₹15, Stage 4 (8-12 km): ₹20, Stage 5 (12-16 km): ₹25, >16 km: ₹30.
  - Confidence: `Real` (PMPML official tariff).

## 6. Cab Model (Estimates)
- **Cab fares:** ₹50 base fare (includes 2 km) + ₹18/km + ₹2/min in-vehicle time.
- **Label:** `Estimated` everywhere. No Uber/Ola/Rapido fare scraping used.

## 7. Deep Link Format
- **Uber:** Universal link `https://m.uber.com/ul/?action=setPickup&pickup[latitude]=...&pickup[longitude]=...&dropoff[latitude]=...&dropoff[longitude]=...`
- **Ola:** `https://book.olacabs.com/?lat=...&lng=...&drop_lat=...&drop_lng=...`
- **Rapido:** Rapido does not provide a reliable public URL schema for deep prefilling coords; link opens Rapido web/app landing page (`https://www.rapido.bike/`).

## 8. Distinctness Rule
- If one option ranks #1 in multiple scoring profiles (e.g. Cheapest and Most Convenient), the second profile displays the next-best distinct option and tags it "Next best".

## 9. Transfer Buffer
- 5 minutes buffer added per modal transfer to account for walking between platforms/stops and ticketing/waiting.
