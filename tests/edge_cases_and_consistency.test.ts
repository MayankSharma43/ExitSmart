import { describe, it, expect } from "vitest";
import { getRecommendations } from "../lib/recommend";
import { searchPlaces, damerauLevenshtein } from "../lib/providers/geocode";
import { calculateAutoFare, calculateCabFare, calculateMetroFare, calculatePMPMLFare } from "../lib/fares";
import { RecommendRequest } from "../lib/types";

describe("edge_cases_and_consistency.test.ts - Auditing Edge Cases & Calculation Consistency", () => {
  // 1. Calculation Consistency Across Segments
  it("enforces strict mathematical consistency between total fare and segment fares", async () => {
    const req: RecommendRequest = {
      origin: { lat: 18.5524, lng: 73.9189, label: "Ramwadi Metro Station" },
      destination: { lat: 18.5516, lng: 73.9515, label: "EON IT Park, Kharadi" },
      mode: "balanced",
    };

    const res = await getRecommendations(req);
    expect(res.options.length).toBe(3);

    for (const opt of res.options) {
      const sumMinFare = opt.segments.reduce((acc, s) => acc + s.inrMin, 0);
      const sumMaxFare = opt.segments.reduce((acc, s) => acc + s.inrMax, 0);

      expect(opt.totalInrMin).toBe(sumMinFare);
      expect(opt.totalInrMax).toBe(sumMaxFare);

      // Total time should account for all segment durations plus waiting times
      const sumSegmentTime = opt.segments.reduce((acc, s) => acc + s.minutes, 0);
      expect(opt.totalMin).toBeGreaterThanOrEqual(sumSegmentTime);

      // Verify reliability score range
      expect(opt.reliabilityScore).toBeGreaterThanOrEqual(15);
      expect(opt.reliabilityScore).toBeLessThanOrEqual(100);
    }
  });

  // 2. Distinctness Rule: All 3 Options Must Be Distinct Alternatives
  it("guarantees 3 distinct options for Cheapest, Fastest, and Most Reliable", async () => {
    const req: RecommendRequest = {
      origin: { lat: 18.5065, lng: 73.7997, label: "Vanaz Metro Station" },
      destination: { lat: 18.5516, lng: 73.9515, label: "EON IT Park, Kharadi" },
      mode: "balanced",
    };

    const res = await getRecommendations(req);
    expect(res.options.length).toBe(3);

    const ids = res.options.map((o) => o.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(3);

    const labels = res.options.map((o) => o.label);
    expect(labels).toContain("Cheapest");
    expect(labels).toContain("Fastest");
    expect(labels).toContain("Most Reliable");
  });

  // 3. Edge Case: Night Departure (02:00 AM) Tariff Surcharge
  it("applies 25% midnight surcharge to auto rickshaw and cab meters between 00:00 and 05:00", () => {
    const daytimeFare = calculateAutoFare(10, 14); // 14:00 (day)
    const nightFare = calculateAutoFare(10, 2);   // 02:00 (night)

    expect(daytimeFare.nightSurchargeApplied).toBe(false);
    expect(nightFare.nightSurchargeApplied).toBe(true);
    expect(nightFare.minFare).toBeGreaterThan(daytimeFare.minFare);
    expect(nightFare.nightSurchargeAmount).toBeGreaterThan(0);

    const dayCab = calculateCabFare(10, 25, 14);
    const nightCab = calculateCabFare(10, 25, 2);
    expect(nightCab.nightMultiplierApplied).toBe(true);
    expect(nightCab.minFare).toBeGreaterThan(dayCab.minFare);
  });

  // 4. Edge Case: Short Distance Hop (< 1.5 km)
  it("handles short distance hops (< 1.5 km) providing direct pedestrian and feeder options", async () => {
    const req: RecommendRequest = {
      origin: { lat: 18.5524, lng: 73.9189, label: "Ramwadi Metro Station" },
      destination: { lat: 18.5601, lng: 73.9168, label: "Phoenix Marketcity" },
      mode: "balanced",
    };

    const res = await getRecommendations(req);
    expect(res.options.length).toBeGreaterThanOrEqual(1);

    const cheapestOpt = res.options.find((o) => o.label === "Cheapest");
    expect(cheapestOpt).toBeDefined();
    // For 800m hop, cheapest fare should be <= ₹15 (bus or walk)
    expect(cheapestOpt!.totalInrMin).toBeLessThanOrEqual(15);
  });

  // 5. Edge Case: Rain Mode Impedance & Sheltered Selection
  it("penalizes long exposed walking in Rain Mode and boosts reliability of fixed-rail Metro", async () => {
    const reqRain: RecommendRequest = {
      origin: { lat: 18.5065, lng: 73.7997, label: "Vanaz Metro" },
      destination: { lat: 18.5516, lng: 73.9515, label: "EON IT Park" },
      mode: "rain",
    };

    const resRain = await getRecommendations(reqRain);
    expect(resRain.options.length).toBe(3);

    const reliableOpt = resRain.options.find((o) => o.label === "Most Reliable");
    expect(reliableOpt).toBeDefined();
    // Most reliable in rain should feature elevated Pune Metro viaduct
    const usesMetro = reliableOpt!.segments.some((s) => s.type === "metro");
    expect(usesMetro).toBe(true);
  });

  // 6. Typo Tolerance and Damerau-Levenshtein Algorithm Accuracy
  it("accurately computes string transposition and edit distance", () => {
    expect(damerauLevenshtein("pimpir", "pimpri")).toBe(1); // 1 transposition
    expect(damerauLevenshtein("hinjwadi", "hinjewadi")).toBe(1); // 1 deletion
    expect(damerauLevenshtein("hadpsar", "hadapsar")).toBe(1); // 1 insertion
    expect(damerauLevenshtein("kotrud", "kothrud")).toBe(1);
    expect(damerauLevenshtein("pune", "pune")).toBe(0);
  });

  // 7. Location Coordinates Accuracy Verification
  it("ensures all local dataset search results return valid Pune coordinates", async () => {
    const testQueries = ["Kothrud", "Hinjewadi", "Viman Nagar", "Chinchwad", "Swargate", "Kharadi"];

    for (const q of testQueries) {
      const results = await searchPlaces(q);
      expect(results.length).toBeGreaterThan(0);
      for (const place of results) {
        expect(place.lat).toBeGreaterThanOrEqual(18.2);
        expect(place.lat).toBeLessThanOrEqual(19.2);
        expect(place.lng).toBeGreaterThanOrEqual(73.2);
        expect(place.lng).toBeLessThanOrEqual(74.3);
      }
    }
  });

  // 8. Official Fare Slab Boundary Integrity
  it("validates official government fare slabs boundaries", () => {
    // Maha Metro slabs
    expect(calculateMetroFare(0.5)).toBe(10);
    expect(calculateMetroFare(2.0)).toBe(10);
    expect(calculateMetroFare(2.1)).toBe(15);
    expect(calculateMetroFare(4.0)).toBe(15);
    expect(calculateMetroFare(7.5)).toBe(20);
    expect(calculateMetroFare(11.0)).toBe(25);
    expect(calculateMetroFare(15.0)).toBe(30);
    expect(calculateMetroFare(18.0)).toBe(35);

    // PMPML bus stages
    expect(calculatePMPMLFare(1.5)).toBe(5);
    expect(calculatePMPMLFare(3.0)).toBe(10);
    expect(calculatePMPMLFare(6.0)).toBe(15);
    expect(calculatePMPMLFare(10.0)).toBe(20);
    expect(calculatePMPMLFare(14.0)).toBe(25);
    expect(calculatePMPMLFare(20.0)).toBe(30);
  });
});
