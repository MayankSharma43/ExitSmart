import { describe, it, expect } from "vitest";
import { dominates, filterParetoFrontier } from "../lib/pareto";
import { Option } from "../lib/types";

describe("pareto.ts - Non-dominated multi-objective filtering", () => {
  it("correctly identifies vector dominance", () => {
    const a = { time: 20, cost: 30, wait: 5, transfers: 0, walking: 300 };
    const b = { time: 25, cost: 40, wait: 5, transfers: 1, walking: 500 };
    // 'a' is strictly better in time, cost, transfers, walking and equal in wait
    expect(dominates(a, b)).toBe(true);
    expect(dominates(b, a)).toBe(false);
  });

  it("does not dominate when trade-offs exist", () => {
    const fastExpensive = { time: 15, cost: 150, wait: 3, transfers: 0, walking: 100 };
    const slowCheap = { time: 40, cost: 20, wait: 10, transfers: 1, walking: 800 };
    // Neither dominates the other because fastExpensive is faster, but slowCheap is cheaper
    expect(dominates(fastExpensive, slowCheap)).toBe(false);
    expect(dominates(slowCheap, fastExpensive)).toBe(false);
  });

  it("filters out strictly dominated options", () => {
    const optA: Option = {
      id: "opt_a",
      label: "Fastest",
      tag: null,
      entryStopId: "s1",
      entryStopName: "Stop 1",
      exitStopId: "s2",
      exitStopName: "Stop 2",
      segments: [],
      totalMin: 20,
      totalInrMin: 30,
      totalInrMax: 30,
      waitMin: 5,
      transfers: 0,
      walkM: 200,
      confidence: "High",
    };

    const optB_dominated: Option = {
      ...optA,
      id: "opt_b",
      totalMin: 25,
      totalInrMin: 40,
      totalInrMax: 40,
      waitMin: 8,
      transfers: 1,
      walkM: 400,
    };

    const optC_cheap: Option = {
      ...optA,
      id: "opt_c",
      totalMin: 35,
      totalInrMin: 15,
      totalInrMax: 15,
      waitMin: 10,
      transfers: 1,
      walkM: 600,
    };

    const optD_balanced: Option = {
      ...optA,
      id: "opt_d",
      totalMin: 22,
      totalInrMin: 25,
      totalInrMax: 25,
      waitMin: 4,
      transfers: 0,
      walkM: 300,
    };

    const result = filterParetoFrontier([optA, optB_dominated, optC_cheap, optD_balanced]);
    const ids = result.map((r) => r.id);
    expect(ids).toContain("opt_a");
    expect(ids).toContain("opt_c");
    expect(ids).not.toContain("opt_b"); // Dominated by opt_a
  });
});
