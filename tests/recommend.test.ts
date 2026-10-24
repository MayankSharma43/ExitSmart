import { describe, it, expect } from "vitest";
import { getRecommendations } from "../lib/recommend";
import { RecommendRequest } from "../lib/types";

describe("recommend.ts - Full Recommendation Pipeline", () => {
  const ramwadiToKharadi: RecommendRequest = {
    origin: {
      lat: 18.5524,
      lng: 73.9189,
      label: "Ramwadi Metro Station",
    },
    destination: {
      lat: 18.5516,
      lng: 73.9515,
      label: "EON IT Park, Kharadi",
    },
    mode: "balanced",
  };

  it("returns exactly three distinct options with complete metrics", async () => {
    const res = await getRecommendations(ramwadiToKharadi);
    expect(res.options.length).toBe(3);

    const labels = res.options.map((o) => o.label);
    expect(labels).toContain("Cheapest");
    expect(labels).toContain("Fastest");
    expect(labels).toContain("Most Convenient");

    for (const opt of res.options) {
      expect(opt.totalMin).toBeGreaterThan(0);
      expect(opt.totalInrMin).toBeGreaterThanOrEqual(0);
      expect(opt.segments.length).toBeGreaterThanOrEqual(1);
      expect(opt.confidence).toBeDefined();
    }
  });

  it("provides cabDirectEstimate savings benchmark", async () => {
    const res = await getRecommendations(ramwadiToKharadi);
    expect(res.cabDirectEstimate).toBeDefined();
    expect(res.cabDirectEstimate?.minInr).toBeGreaterThan(50);
  });

  it("applies user override when specified", async () => {
    const reqWithOverride: RecommendRequest = {
      ...ramwadiToKharadi,
      overrides: {
        entryStopId: "stop_ramwadi_metro",
      },
    };
    const res = await getRecommendations(reqWithOverride);
    expect(res.options.length).toBe(3);
    const hasOverride = res.options.some((o) => o.entryStopId === "stop_ramwadi_metro");
    expect(hasOverride).toBe(true);
  });

  it("returns assumptions with confidence labels", async () => {
    const res = await getRecommendations(ramwadiToKharadi);
    expect(res.assumptions.length).toBeGreaterThan(0);
    const hasReal = res.assumptions.some((a) => a.confidence === "Real");
    const hasFormula = res.assumptions.some((a) => a.confidence === "Formula");
    expect(hasReal).toBe(true);
    expect(hasFormula).toBe(true);
  });
});
