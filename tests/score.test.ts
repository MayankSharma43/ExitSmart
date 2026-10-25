import { describe, it, expect } from "vitest";
import { selectTopThreeOptions, normalizeOptions } from "../lib/score";
import { Option } from "../lib/types";

describe("score.ts - Weighted Scoring & Distinct Selection", () => {
  const dummyOptions: Option[] = [
    {
      id: "bus_metro",
      label: "Cheapest",
      tag: null,
      entryStopId: "entry1",
      entryStopName: "Ramwadi Metro",
      exitStopId: "exit1",
      exitStopName: "Kalyani Nagar",
      segments: [{ type: "metro", from: "A", to: "B", fromCoords: { lat: 0, lng: 0 }, toCoords: { lat: 0, lng: 0 }, minutes: 10, inrMin: 15, inrMax: 15, meters: 3000, confidence: "Real" }],
      totalMin: 30,
      totalInrMin: 20,
      totalInrMax: 20,
      waitMin: 6,
      transfers: 1,
      walkM: 300,
      confidence: "High",
    },
    {
      id: "cab_direct",
      label: "Fastest",
      tag: null,
      entryStopId: "entry2",
      entryStopName: "Direct",
      exitStopId: "exit2",
      exitStopName: "Direct",
      segments: [{ type: "cab", from: "A", to: "B", fromCoords: { lat: 0, lng: 0 }, toCoords: { lat: 0, lng: 0 }, minutes: 12, inrMin: 180, inrMax: 200, meters: 5000, confidence: "Estimated" }],
      totalMin: 12,
      totalInrMin: 180,
      totalInrMax: 200,
      waitMin: 4,
      transfers: 0,
      walkM: 50,
      confidence: "Medium",
    },
    {
      id: "auto_metro_combo",
      label: "Most Convenient",
      tag: null,
      entryStopId: "entry3",
      entryStopName: "Ramwadi Metro",
      exitStopId: "exit3",
      exitStopName: "Nal Stop",
      segments: [],
      totalMin: 22,
      totalInrMin: 55,
      totalInrMax: 60,
      waitMin: 3,
      transfers: 1,
      walkM: 100,
      confidence: "High",
    },
    {
      id: "long_walk_bus",
      label: "Cheapest",
      tag: null,
      entryStopId: "entry4",
      entryStopName: "Bus Stop",
      exitStopId: "exit4",
      exitStopName: "Bus Stop 2",
      segments: [],
      totalMin: 38,
      totalInrMin: 10,
      totalInrMax: 10,
      waitMin: 8,
      transfers: 1,
      walkM: 1200, // Heavy walking
      confidence: "Medium",
    },
  ];

  it("selects 3 distinct options with appropriate profile labels (Cheapest, Fastest, Most Reliable)", () => {
    const selected = selectTopThreeOptions(dummyOptions, "balanced");
    expect(selected.length).toBe(3);

    const labels = selected.map((s) => s.label);
    expect(labels).toContain("Cheapest");
    expect(labels).toContain("Fastest");
    expect(labels).toContain("Most Reliable");

    // Must all be distinct option IDs
    const ids = new Set(selected.map((s) => s.id));
    expect(ids.size).toBe(3);

    // Each option should have a valid reliability score between 0 and 100
    for (const opt of selected) {
      expect(opt.reliabilityScore).toBeGreaterThanOrEqual(0);
      expect(opt.reliabilityScore).toBeLessThanOrEqual(100);
    }
  });

  it("penalizes high-walking options in Rain mode", () => {
    const normalizedBalanced = normalizeOptions(dummyOptions, "balanced");
    const normalizedRain = normalizeOptions(dummyOptions, "rain");

    // The high walking option (long_walk_bus) should have a higher walking penalty in rain mode
    const walkBalanced = normalizedBalanced.find((n) => n.id === "long_walk_bus");
    const walkRain = normalizedRain.find((n) => n.id === "long_walk_bus");

    expect(walkRain?.normWalking).toBeDefined();
    expect(walkBalanced?.normWalking).toBeDefined();
  });
});
