# ExitSmart: Data Sources & Provenance

Every number shown to the commuter in ExitSmart carries an explicit confidence label:
- **`Real`**: Verified against official schedules, published transit fares, or official transit maps.
- **`Formula`**: Computed using an official regulatory formula (e.g. Maharashtra RTO auto tariff rules).
- **`Estimated`**: Derived from routing distance calculations, statistical averages, or traffic speed heuristics.
- **`Hardcoded`**: Curated reference data points used for prototyping when live feeds are unavailable.

---

## Datasets

| Dataset | File | Source & Retrieval Date | Confidence | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Pune Metro Stations & Lines** | `/data/stations.json` | Maha Metro Official Network Map (Pune Metro Rail Project), retrieved Oct 2024 / current | `Real` | Line 1 (Purple: PCMC to Swargate) & Line 2 (Aqua: Vanaz to Ramwadi). Interchange at District Court. |
| **Pune Metro Timetable & Fares** | `/data/metro_timetable.json` | Maha Metro Official Fare Chart & Time Table | `Real` | First train 06:00, last train 22:00. Average headway: 10 min peak, 15 min off-peak. Fare slabs: ₹10 (0-2 km) to ₹35 (>16 km). |
| **PMPML Routes & Fare Stages** | `/data/pmpml_routes.json` | PMPML Official Fare Chart (pmpml.org) & Open Transit Data Pune | `Real` (Fares), `Hardcoded` (Corridor routes) | Curated key corridors serving major tech parks and hubs (Ramwadi-Kharadi, Ramwadi-Viman Nagar, Pune Station-Baner, etc.). |
| **Bus Stops & Auto Stands** | `/data/stops.json` | OpenStreetMap + curated field survey points | `Real` (Coordinates), `Hardcoded` (Auto stand presence) | Major auto stands mapped at Metro stations, tech park gates, and transit intersections. |
| **Curated Pune Landmarks** | `/data/landmarks.json` | Curated list of 16 prominent Pune IT parks, transit centers, and commercial hubs | `Hardcoded` | EON IT Park, Phoenix Marketcity, Baner, Hinjewadi Phase 1, Swargate, Pune Station, etc. |
| **Auto Meter Tariff** | `/data/tariffs.json` | Maharashtra Regional Transport Authority (RTA) Pune official revised auto fare | `Formula` | Base fare ₹25 for first 1.5 km, ₹17 per km thereafter. 25% night surcharge (00:00 - 05:00). |
| **Cab Fare Model** | `/data/tariffs.json` | Industry aggregate average for non-surge app cabs in Pune | `Estimated` | Base ₹50 + ₹18/km + ₹2/min. Always labelled as estimate. |
| **Walk Speed & Distance** | `/lib/estimate.ts` | OpenRouteService walking profile + standard pedestrian speed (4.5 km/h) | `Estimated` / `Formula` | 1.25x straight-line detour factor when offline. |
| **Reference Routes Cache** | `/data/cache/` | Precomputed responses for the 4 hackathon reference journeys | `Hardcoded` (Offline Fallback) | Guaranteed to return full results even with zero network connectivity. |
