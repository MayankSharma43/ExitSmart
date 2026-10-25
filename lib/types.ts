export type ConfidenceLabel = "Real" | "Formula" | "Estimated" | "Hardcoded";

export type SegmentType = "walk" | "bus" | "metro" | "auto" | "shared_auto" | "cab";

export type TravelMode = "balanced" | "rain" | "night" | "safety";

export interface LatLng {
  lat: number;
  lng: number;
}

export interface Place extends LatLng {
  label: string;
  id?: string;
  title?: string;
  subtitle?: string;
  placeType?: "metro" | "bus" | "auto" | "landmark" | "area";
}

export interface StopCandidate {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: "metro_station" | "bus_stop" | "auto_stand";
  line?: "Purple" | "Aqua";
  order?: number;
  isInterchange?: boolean;
  distanceMeters: number;
}

export interface Segment {
  type: SegmentType;
  from: string;
  to: string;
  fromCoords: LatLng;
  toCoords: LatLng;
  minutes: number;
  inrMin: number;
  inrMax: number;
  meters: number;
  route?: string;
  confidence: ConfidenceLabel;
  fareConfidence?: ConfidenceLabel;
  timeConfidence?: ConfidenceLabel;
  polyline?: [number, number][];
  details?: string;
}

export interface Option {
  id: string;
  label: "Cheapest" | "Fastest" | "Most Reliable" | "Most Convenient";
  tag: "Next best" | null;
  entryStopId: string;
  entryStopName: string;
  exitStopId: string;
  exitStopName: string;
  segments: Segment[];
  totalMin: number;
  totalInrMin: number;
  totalInrMax: number;
  waitMin: number;
  transfers: number;
  walkM: number;
  confidence: "High" | "Medium" | "Low";
  reliabilityScore?: number; // 0 to 100 percentage
  scores?: {
    cheapestScore: number;
    fastestScore: number;
    reliableScore: number;
    convenientScore?: number;
  };
}

export interface ExitSmartBannerInfo {
  entryStopId: string;
  entryStopName: string;
  exitStopId: string;
  exitStopName: string;
  nearestEntryStopId: string;
  nearestEntryStopName: string;
  nearestExitStopId: string;
  nearestExitStopName: string;
  savingMin: number;
  savingInr: number;
  summary: string;
}

export interface AssumptionItem {
  item: string;
  formula: string;
  source: string;
  confidence: ConfidenceLabel;
}

export interface RecommendRequest {
  origin: Place;
  destination: Place;
  departureTime?: string; // ISO string
  mode?: TravelMode;
  overrides?: {
    entryStopId?: string;
    exitStopId?: string;
  };
}

export interface CabDirectEstimate {
  minInr: number;
  maxInr: number;
  minutes: number;
  meters: number;
}

export interface RecommendResponse {
  exitSmart: ExitSmartBannerInfo | null;
  options: Option[];
  assumptions: AssumptionItem[];
  cabDirectEstimate?: CabDirectEstimate;
  baseline?: Option | null;
}

export interface MetroStation {
  id: string;
  name: string;
  line: "Purple" | "Aqua";
  lat: number;
  lng: number;
  order: number;
  isInterchange: boolean;
  interchangeWith?: string[];
}

export interface PMPMLRoute {
  id: string;
  routeNumber: string;
  name: string;
  headwayMin: number;
  firstBus: string;
  lastBus: string;
  stops: string[];
  fareSlabs: { minKm: number; maxKm: number; fare: number }[];
}

export interface TransitStop {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: "bus_stop" | "auto_stand";
}

export interface Landmark {
  id: string;
  name: string;
  lat: number;
  lng: number;
  area: string;
  category: string;
}
