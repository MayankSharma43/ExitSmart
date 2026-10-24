import tariffs from "@/data/tariffs.json";
import metroData from "@/data/metro_timetable.json";

export interface AutoFareResult {
  minFare: number;
  maxFare: number;
  ceilingFare: number; // "Negotiate up to" ceiling
  nightSurchargeApplied: boolean;
  baseFare: number;
  distanceFare: number;
  nightSurchargeAmount: number;
  breakdown: string;
}

export interface CabFareResult {
  minFare: number;
  maxFare: number;
  baseFare: number;
  distanceFare: number;
  timeFare: number;
  nightMultiplierApplied: boolean;
  breakdown: string;
}

/**
 * Calculates Pune Metro fare using Maha Metro official fare slabs.
 * Confidence: Real
 */
export function calculateMetroFare(distanceKm: number): number {
  const km = Math.max(0, distanceKm);
  for (const slab of metroData.fareSlabs) {
    if (km >= slab.minKm && km <= slab.maxKm) {
      return slab.fare;
    }
  }
  return 35; // Default max slab
}

/**
 * Calculates PMPML bus fare based on official stage distance slabs.
 * Confidence: Real
 */
export function calculatePMPMLFare(distanceKm: number): number {
  const km = Math.max(0, distanceKm);
  if (km <= 2) return 5;
  if (km <= 4) return 10;
  if (km <= 8) return 15;
  if (km <= 12) return 20;
  if (km <= 16) return 25;
  return 30;
}

/**
 * Checks if the given departure hour falls within night hours (00:00 to 05:00).
 */
export function isNightHour(hour?: number): boolean {
  if (hour === undefined || isNaN(hour)) return false;
  return hour >= tariffs.auto.nightStartHour && hour < tariffs.auto.nightEndHour;
}

/**
 * Calculates official metered auto rickshaw fare per Maharashtra RTO Pune tariff rules.
 * Confidence: Formula
 * 
 * Rules:
 * - Base fare: ₹25 for the first 1.5 km
 * - Per km rate thereafter: ₹17.00
 * - Night surcharge: 25% extra between 00:00 and 05:00
 * - Negotiate ceiling: 20% over standard fare
 */
export function calculateAutoFare(distanceKm: number, departureHour?: number): AutoFareResult {
  const km = Math.max(0, distanceKm);
  const baseFare = tariffs.auto.baseFareInr;
  const firstKm = tariffs.auto.firstKmIncluded;
  const perKm = tariffs.auto.perKmRateInr;

  let distanceFare = 0;
  if (km > firstKm) {
    distanceFare = (km - firstKm) * perKm;
  }

  let subtotal = baseFare + distanceFare;
  const nightApplied = isNightHour(departureHour);
  const nightSurchargeAmount = nightApplied
    ? (subtotal * tariffs.auto.nightSurchargePercent) / 100
    : 0;

  const standardFare = Math.round(subtotal + nightSurchargeAmount);
  // Max expected meter drift or slow moving traffic buffer (+10%)
  const maxFare = Math.round(standardFare * 1.1);
  // "Negotiate up to" ceiling (+20% of standard fare)
  const ceilingFare = Math.round(standardFare * (1 + tariffs.auto.negotiateBufferPercent / 100));

  const breakdown = `RTO Base ₹${baseFare} (first ${firstKm} km) + ₹${perKm}/km (${(
    Math.max(0, km - firstKm)
  ).toFixed(1)} km: ₹${Math.round(distanceFare)})${
    nightApplied ? ` + ${tariffs.auto.nightSurchargePercent}% night surcharge` : ""
  }`;

  return {
    minFare: standardFare,
    maxFare,
    ceilingFare,
    nightSurchargeApplied: nightApplied,
    baseFare,
    distanceFare: Math.round(distanceFare),
    nightSurchargeAmount: Math.round(nightSurchargeAmount),
    breakdown,
  };
}

/**
 * Calculates shared auto fare (per seat estimate on common corridors).
 * Confidence: Estimated
 */
export function calculateSharedAutoFare(distanceKm: number): number {
  const km = Math.max(0, distanceKm);
  const base = tariffs.sharedAuto.baseSeatFareInr;
  const perKm = tariffs.sharedAuto.perKmRateInr;
  if (km <= 3) return base;
  return Math.round(base + (km - 3) * perKm);
}

/**
 * Calculates estimated app cab fare (Uber/Ola non-surge estimate model).
 * Confidence: Estimated
 */
export function calculateCabFare(
  distanceKm: number,
  minutes: number,
  departureHour?: number
): CabFareResult {
  const km = Math.max(0, distanceKm);
  const mins = Math.max(0, minutes);
  const baseFare = tariffs.cab.baseFareInr;
  const baseKm = tariffs.cab.baseKmIncluded;
  const perKm = tariffs.cab.perKmRateInr;
  const perMin = tariffs.cab.perMinuteRateInr;

  const extraKm = Math.max(0, km - baseKm);
  const distanceFare = extraKm * perKm;
  const timeFare = mins * perMin;

  let subtotal = baseFare + distanceFare + timeFare;
  const nightApplied = isNightHour(departureHour);
  if (nightApplied) {
    subtotal *= tariffs.cab.nightMultiplier;
  }

  const minFare = Math.round(subtotal * 0.95);
  const maxFare = Math.round(subtotal * 1.15);

  const breakdown = `Base ₹${baseFare} + ₹${perKm}/km (${extraKm.toFixed(1)} km) + ₹${perMin}/min (${Math.round(
    mins
  )} min)${nightApplied ? " + 25% night rate" : ""}`;

  return {
    minFare,
    maxFare,
    baseFare,
    distanceFare: Math.round(distanceFare),
    timeFare: Math.round(timeFare),
    nightMultiplierApplied: nightApplied,
    breakdown,
  };
}
