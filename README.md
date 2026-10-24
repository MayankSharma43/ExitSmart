# ExitSmart: Smart Last-Mile Connectivity & Transit Optimizer (Pune)

> **Door-to-door transit intelligence for Pune commuters.** ExitSmart compares Pune Metro, PMPML feeder buses, metered auto rickshaws, shared autos, app cabs, and walking to recommend where to **enter** the transit network and where to **exit** it for the **Cheapest**, **Fastest**, and **Most Convenient** journey.

---

## The Problem

Commuters travelling in Pune (e.g. from Ramwadi Metro to Kharadi EON IT Park, Viman Nagar, or Baner) face severe last-mile friction:
- **Uncertain auto fares** and frequent meter refusal.
- **Invisible waiting times** and fragmented transit info across Maha Metro, PMPML, and cab apps.
- **Defaulting to the nearest stop:** Standard navigation apps blindly route to the closest stop even when an adjacent stop offers a frequent direct bus, an active auto stand, or avoids major traffic bottle-necks (such as the Nagar Road junction).

**ExitSmart's Core Insight:** The nearest stop to you or to your destination is not always the best. A stop one station earlier or later can make the entire journey faster, cheaper, and more convenient.

---

## Journey Structure

```
Start Point (Home) ──[first mile]──> ENTRY Stop ──[trunk: Metro / Bus]──> EXIT Stop ──[last mile]──> Destination
```

- **Universal Entry & Exit:** Stops can be Pune Metro stations (Aqua & Purple Lines), PMPML bus stops, or auto stands.
- **App Suggests, User Can Override:** The recommendation engine suggests the optimal entry and exit stops; commuters can override either on the map, and results recompute instantaneously.
- **Fair Fare Meter:** Calculates official Maharashtra RTO Pune auto rickshaw meter fares with negotiation ceilings and night surcharges.
- **Confidence Badges:** Every metric shown carries an explicit confidence badge: `Real`, `Formula`, `Estimated`, or `Hardcoded`. Never guessing or presenting estimates as live feeds.
- **100% Offline Reference Routes:** Precomputed responses for the 4 hackathon reference journeys are cached locally and guaranteed to work with zero network connectivity.

---

## Tech Stack & Adapters

- **Framework:** Next.js 14 (App Router) + TypeScript
- **Styling:** Tailwind CSS (Mobile-first, responsive down to 360px viewport)
- **Maps:** Leaflet with standard OpenStreetMap (OSM) tiles (optional MapTiler support)
- **Geocoding:** Geoapify Geocoding API bounded to the Pune metropolitan bounding box (`[18.35, 73.65, 18.70, 74.10]`) with local landmark fallback
- **Routing:** OpenRouteService (ORS) server-side client with in-memory + disk cache (`/data/cache`), falling back to straight-line distance with urban detour multipliers
- **Testing:** Vitest

### Swappable Provider Adapters

```
/lib/providers/geocode.ts      -> searchPlaces(query): Place[]
/lib/providers/routing.ts      -> getLegDistanceAndTime(from, to, mode): { meters, minutes, polyline, confidence }
/lib/providers/map-config.ts   -> Pune center, bounds, OSM/MapTiler tile layers
```

---

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── places/route.ts      # Pune-bounded autocomplete endpoint
│   │   └── recommend/route.ts   # Core recommendation endpoint (Section 11 contract)
│   ├── globals.css              # Tailwind + Leaflet styles
│   ├── layout.tsx               # Root layout & header
│   ├── page.tsx                 # Homepage: search form & reference corridors
│   └── results/page.tsx         # Results screen: 3 cards, ExitSmart banner, map
├── components/
│   ├── AssumptionsDrawer.tsx    # "How we estimate" drawer with formulas & sources
│   ├── ExitBanner.tsx           # Highlighted entry/exit savings banner
│   ├── Header.tsx               # Top navigation bar
│   ├── MapView.tsx              # Dynamic Leaflet route & stop map
│   ├── ResultCard.tsx           # Cheapest, Fastest, Most Convenient profile cards
│   ├── RouteDetailSheet.tsx     # Leg timeline, Fair Fare Meter, deep links
│   └── SearchForm.tsx           # Search input, landmark chips, mode selector
├── data/
│   ├── cache/                   # Cached routes & precomputed reference routes
│   ├── landmarks.json           # 16 curated Pune hubs & IT parks
│   ├── metro_timetable.json     # Maha Metro operational hours, headways, fare slabs
│   ├── pmpml_routes.json        # Curated key PMPML corridor routes
│   ├── stations.json            # Pune Metro Aqua & Purple line stations & interchange
│   ├── stops.json               # Bus stops and auto stands around transit hubs
│   └── tariffs.json             # Maharashtra RTO auto tariff & cab model constants
├── lib/
│   ├── candidates.ts            # Candidate stop discovery & valid trunk check
│   ├── estimate.ts              # Speed, distance, time, and wait heuristics
│   ├── fares.ts                 # Metro, PMPML, RTO Auto, and Cab fare calculators
│   ├── pareto.ts                # Non-dominated Pareto frontier filter
│   ├── recommend.ts             # Orchestrates the multimodal pipeline
│   ├── score.ts                 # Weighted multi-objective scoring & distinct selection
│   └── types.ts                 # TypeScript types and API interfaces
├── tests/                       # Vitest unit test suites (fares, score, pareto, candidates, recommend)
├── DATA_SOURCES.md              # Provenance and retrieval notes for all datasets
├── DECISIONS.md                 # Design, algorithm, and architecture decisions
├── VALIDATION.md                # Real-world spot checks for reference corridors
├── .env.example
└── README.md
```

---

## Getting Started

### Prerequisites
- Node.js 18+ (tested on Node v24)
- npm

### Installation

1. Clone or open the repository:
   ```bash
   cd ExitSmart
   ```

2. Copy the example environment variables:
   ```bash
   cp .env.example .env.local
   ```
   *(Note: The app runs 100% locally with built-in fallbacks even if keys are left blank!)*

3. Install dependencies:
   ```bash
   npm install
   ```

4. Run unit tests:
   ```bash
   npm test
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

6. Build for production:
   ```bash
   npm run build
   npm start
   ```

---

## 4 Reference Routes (Verified & Cached)

| # | Origin | Destination | Verified Highlight |
| :--- | :--- | :--- | :--- |
| **1** | Ramwadi Metro | Kharadi (EON IT Park) | ExitSmart banner shows how exiting at Chandan Nagar / Kharadi Bypass saves ₹50+ and avoids peak Nagar Road traffic vs direct auto. |
| **2** | Ramwadi Metro | Viman Nagar | Short hop trade-offs: ₹5 PMPML bus / ₹25 minimum RTO auto / Free walk. |
| **3** | Ramwadi Metro | Baner (Balewadi Phata) | Long cross-city transit leg. Rain mode measurably penalizes open-air walking and promotes door-to-door transfers. |
| **4** | Kothrud (Chandani Chowk) | Kharadi (EON IT Park) | Full door-to-door flow: First-mile Auto &rarr; Aqua Line Metro &rarr; Last-mile Bus. |

---

## Documentation

- [DATA_SOURCES.md](file:///d:/Desktop/College%20stuff/Coding/ExitSmart/DATA_SOURCES.md): Complete data provenance, source URLs, and confidence labels (`Real`, `Formula`, `Estimated`, `Hardcoded`).
- [DECISIONS.md](file:///d:/Desktop/College%20stuff/Coding/ExitSmart/DECISIONS.md): Architectural decisions and regulatory formulas.
- [VALIDATION.md](file:///d:/Desktop/College%20stuff/Coding/ExitSmart/VALIDATION.md): Real-world ground truth validation spot checks.
