import { LatLng, ConfidenceLabel } from "./types";
import tariffs from "@/data/tariffs.json";
import metroData from "@/data/metro_timetable.json";

/**
 * Calculates Haversine distance between two coordinates in meters.
 */
export function haversineDistanceMeters(p1: LatLng, p2: LatLng): number {
  const R = 6371000; // Earth radius in meters
  const dLat = ((p2.lat - p1.lat) * Math.PI) / 180;
  const dLng = ((p2.lng - p1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((p1.lat * Math.PI) / 180) *
      Math.cos((p2.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Checks if departure hour is during peak traffic hours (08:30-11:00 or 17:30-20:30).
 */
export function isPeakHour(hour?: number): boolean {
  if (hour === undefined || isNaN(hour)) return false;
  return (hour >= 8 && hour <= 11) || (hour >= 17 && hour <= 20);
}

/**
 * Estimates walking time in minutes based on distance in meters.
 * Speed: 4.5 km/h = 75 meters/minute.
 * Confidence: High
 */
export function estimateWalkTime(meters: number): {
  minutes: number;
  confidence: ConfidenceLabel;
} {
  const speedMetersPerMin = (tariffs.walk.speedKmH * 1000) / 60;
  const minutes = Math.ceil(meters / speedMetersPerMin);
  return {
    minutes: Math.max(1, minutes),
    confidence: "Estimated",
  };
}

/**
 * Estimates road driving time in minutes (for Auto, Cab).
 * Speeds: Peak 16 km/h, Day 20 km/h, Night 26 km/h.
 * Confidence: Estimated
 */
export function estimateDriveTime(
  meters: number,
  departureHour?: number
): {
  minutes: number;
  confidence: ConfidenceLabel;
} {
  let speedKmH = 20; // Default daytime urban speed
  if (isPeakHour(departureHour)) {
    speedKmH = 16;
  } else if (departureHour !== undefined && (departureHour >= 22 || departureHour <= 5)) {
    speedKmH = 26;
  }

  const speedMPerMin = (speedKmH * 1000) / 60;
  const minutes = Math.ceil(meters / speedMPerMin);
  return {
    minutes: Math.max(2, minutes),
    confidence: "Estimated",
  };
}

/**
 * Estimates PMPML bus travel time and expected waiting time.
 */
export function estimateBusTime(
  meters: number,
  headwayMin: number = 12,
  departureHour?: number
): {
  minutes: number;
  waitMinutes: number;
  confidence: ConfidenceLabel;
} {
  let speedKmH = tariffs.bus.avgSpeedDayKmH;
  if (isPeakHour(departureHour)) {
    speedKmH = tariffs.bus.avgSpeedPeakKmH;
  } else if (departureHour !== undefined && (departureHour >= 22 || departureHour <= 5)) {
    speedKmH = tariffs.bus.avgSpeedNightKmH;
  }

  const speedMPerMin = (speedKmH * 1000) / 60;
  const travelMin = Math.ceil(meters / speedMPerMin);
  // Commuter expected wait is headway / 2
  const waitMin = Math.ceil(headwayMin / 2);

  return {
    minutes: Math.max(3, travelMin),
    waitMinutes: Math.max(2, waitMin),
    confidence: "Estimated",
  };
}

/**
 * Estimates Metro travel time and wait time.
 * In-vehicle: avg 2 min between stations + 5 min if interchange.
 * Wait: peak 5 min, off-peak 7 min.
 */
export function estimateMetroTime(
  stationsTraversed: number,
  hasInterchange: boolean,
  departureHour?: number
): {
  minutes: number;
  waitMinutes: number;
  confidence: ConfidenceLabel;
} {
  const stationTravel = Math.max(1, stationsTraversed) * metroData.avgInterStationTimeMin;
  const interchangeDelay = hasInterchange ? metroData.interchangeTimeMin : 0;
  const totalMin = Math.ceil(stationTravel + interchangeDelay);

  const waitMin = isPeakHour(departureHour)
    ? Math.ceil(metroData.peakHeadwayMin / 2)
    : Math.ceil(metroData.offPeakHeadwayMin / 2);

  return {
    minutes: totalMin,
    waitMinutes: waitMin,
    confidence: "Real",
  };
}

/**
 * Estimates auto rickshaw wait time.
 * Auto stands near metro have almost immediate availability (~2 min).
 * Regular roadside hailing is ~4-6 min.
 */
export function estimateAutoWait(isNearStand: boolean, departureHour?: number): number {
  if (departureHour !== undefined && (departureHour >= 0 && departureHour <= 5)) {
    return isNearStand ? 4 : 8;
  }
  return isNearStand ? 2 : 5;
}

/**
 * Estimates app cab pickup wait time (Uber/Ola arrival).
 */
export function estimateCabWait(departureHour?: number): number {
  if (isPeakHour(departureHour)) {
    return 7;
  }
  if (departureHour !== undefined && (departureHour >= 0 && departureHour <= 5)) {
    return 8;
  }
  return 5;
}
