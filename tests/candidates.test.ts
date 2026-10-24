import { describe, it, expect } from "vitest";
import { findNearbyStops, findValidTrunkPairs } from "../lib/candidates";

describe("candidates.ts - Stop discovery & Trunk leg validation", () => {
  it("finds nearby metro stations and bus stops around Ramwadi", () => {
    // Ramwadi Metro area (18.5524, 73.9189)
    const nearby = findNearbyStops({ lat: 18.5524, lng: 73.9189 }, 1500, 5);
    expect(nearby.length).toBeGreaterThan(0);
    const names = nearby.map((s) => s.name);
    expect(names.some((n) => n.includes("Ramwadi"))).toBe(true);
  });

  it("finds valid metro-to-metro trunk pairs", () => {
    // Ramwadi (Aqua) to Nal Stop (Aqua)
    const entries = findNearbyStops({ lat: 18.5524, lng: 73.9189 }, 1000, 3);
    const exits = findNearbyStops({ lat: 18.5058, lng: 73.8277 }, 1000, 3);

    const pairs = findValidTrunkPairs(entries, exits);
    expect(pairs.length).toBeGreaterThan(0);
    const metroPair = pairs.find((p) => p.trunkType === "metro");
    expect(metroPair).toBeDefined();
    expect(metroPair?.fareInr).toBeGreaterThanOrEqual(15);
  });

  it("finds valid PMPML bus route from Ramwadi to Kharadi EON IT Park", () => {
    // Ramwadi to EON IT Park
    const entries = findNearbyStops({ lat: 18.5524, lng: 73.9189 }, 1000, 5);
    const exits = findNearbyStops({ lat: 18.5516, lng: 73.9515 }, 1000, 5);

    const pairs = findValidTrunkPairs(entries, exits);
    const busPair = pairs.find((p) => p.trunkType === "bus");
    expect(busPair).toBeDefined();
    expect(busPair?.routeName).toContain("165");
  });
});
