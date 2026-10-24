import { describe, it, expect } from "vitest";
import {
  haversineDistanceMeters,
  estimateWalkTime,
  estimateDriveTime,
  estimateBusTime,
  estimateMetroTime,
  estimateAutoWait,
} from "../lib/estimate";

describe("estimate.ts - Transit Time, Distance & Wait Heuristics", () => {
  it("calculates accurate Haversine distance", () => {
    // Ramwadi Metro (18.5524, 73.9189) to Phoenix Marketcity (18.5601, 73.9168)
    const dist = haversineDistanceMeters(
      { lat: 18.5524, lng: 73.9189 },
      { lat: 18.5601, lng: 73.9168 }
    );
    // Real straight-line distance is ~880m
    expect(dist).toBeGreaterThan(800);
    expect(dist).toBeLessThan(950);
  });

  it("estimates walking time correctly at 4.5 km/h (75 m/min)", () => {
    // 750 meters should take 10 minutes
    const res = estimateWalkTime(750);
    expect(res.minutes).toBe(10);
  });

  it("estimates road driving time accounting for peak vs normal hours", () => {
    // 5 km = 5000 m
    const normalDrive = estimateDriveTime(5000, 14); // 20 km/h -> 15 min
    const peakDrive = estimateDriveTime(5000, 9); // 16 km/h -> ~19 min
    expect(peakDrive.minutes).toBeGreaterThan(normalDrive.minutes);
  });

  it("estimates metro travel and wait times", () => {
    // 5 stations, no interchange
    const res = estimateMetroTime(5, false, 14);
    expect(res.minutes).toBe(10); // 5 * 2 min
    expect(res.waitMinutes).toBeGreaterThanOrEqual(5);

    // With interchange
    const resInterchange = estimateMetroTime(5, true, 14);
    expect(resInterchange.minutes).toBe(15); // 10 + 5 min interchange
  });

  it("estimates lower auto wait times near stands", () => {
    const nearStandWait = estimateAutoWait(true, 14);
    const regularWait = estimateAutoWait(false, 14);
    expect(nearStandWait).toBeLessThan(regularWait);
  });
});
