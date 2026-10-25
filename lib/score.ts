import { Option, TravelMode } from "./types";

export interface OptionMetrics {
  id: string;
  time: number;
  cost: number;
  wait: number;
  transfers: number;
  walking: number;
  reliability: number;
}

export interface NormalizedMetrics {
  id: string;
  normTime: number;
  normCost: number;
  normWait: number;
  normTransfers: number;
  normWalking: number;
  normReliability: number;
  reliabilityScore: number;
  option: Option;
}

export const WEIGHT_PROFILES = {
  cheapest: { time: 0.1, cost: 0.7, wait: 0.05, transfers: 0.05, walking: 0.1 },
  fastest: { time: 0.7, cost: 0.05, wait: 0.15, transfers: 0.05, walking: 0.05 },
  reliable: { time: 0.15, cost: 0.05, wait: 0.1, transfers: 0.2, walking: 0.1, reliability: 0.4 },
};

/**
 * Calculates a dedicated 0-100 reliability score for an option.
 *
 * Urban Transit Reliability Principles:
 * 1. Fixed-rail transit (Pune Metro) runs on dedicated grade-separated viaducts with 98%+ on-time rate,
 *    unaffected by road congestion, monsoons, or signal bottlenecks.
 * 2. Surface road transport (App Cabs, Auto Rickshaws, Buses) is subject to high variance
 *    due to Pune road traffic, junction jams (Nagar Road, Chandani Chowk, Hinjewadi), and weather.
 * 3. In Rain Mode, road delays spike (+35-50%) and cab cancellations increase, while Metro remains sheltered.
 * 4. In Night Mode, public transit frequency reduces, but safety and predictable direct routes become critical.
 * 5. Modal transfers introduce connection risk (~5-8% variance per transfer).
 */
export function calculateReliabilityScore(
  option: Option,
  mode: TravelMode = "balanced"
): number {
  let score = 70; // Baseline reliability

  const hasMetro = option.segments.some((s) => s.type === "metro");
  const hasBus = option.segments.some((s) => s.type === "bus");
  const hasSharedAuto = option.segments.some((s) => s.type === "shared_auto");
  const isDirectCab = option.id === "direct_cab";
  const isDirectAuto = option.id === "direct_auto";
  const isDirectWalk = option.id === "direct_walk";

  // 1. Grade-separated rail bonus
  if (hasMetro) {
    score += 22; // Metro viaduct is immune to road traffic
  }

  // 2. Road congestion penalty
  if (isDirectCab) {
    // Cab surge/cancellation risk in Pune
    score -= mode === "rain" ? 18 : 6;
  }
  if (isDirectAuto) {
    // Meter auto availability & driver refusal risk
    score -= mode === "rain" ? 14 : 4;
  }

  // 3. Shared auto variance
  if (hasSharedAuto) {
    score -= 12; // Irregular departure until seats fill up
  }

  // 4. Bus frequency variance
  if (hasBus) {
    score -= 5; // Mixed traffic road bus
  }

  // 5. Transfer risk: Each interchange adds potential delay
  score -= option.transfers * 4;

  // 6. Excessive wait penalty
  if (option.waitMin > 8) {
    score -= (option.waitMin - 8) * 1.5;
  }

  // 7. Walking exposure & weather penalties
  if (mode === "rain") {
    if (option.walkM > 600) {
      score -= Math.min(25, (option.walkM - 600) / 40);
    }
  } else if (mode === "night") {
    if (option.walkM > 800) {
      score -= Math.min(20, (option.walkM - 800) / 50);
    }
    if (hasSharedAuto) {
      score -= 15;
    }
  } else if (mode === "safety") {
    if (option.walkM > 500) {
      score -= Math.min(20, (option.walkM - 500) / 40);
    }
    if (option.transfers > 1) {
      score -= 10;
    }
  }

  // 8. Direct short walk is 100% predictable
  if (isDirectWalk && option.walkM < 1500 && mode !== "rain") {
    score = 95;
  }

  // Clamp score to 15-99
  return Math.min(99, Math.max(15, Math.round(score)));
}

/**
 * Normalizes an array of values between 0 and 1.
 */
function normalize(val: number, min: number, max: number): number {
  if (max <= min) return 0;
  return (val - min) / (max - min);
}

/**
 * Normalizes all options across the candidate set.
 */
export function normalizeOptions(
  options: Option[],
  mode: TravelMode = "balanced"
): NormalizedMetrics[] {
  if (options.length === 0) return [];

  const times = options.map((o) => o.totalMin);
  const costs = options.map((o) => (o.totalInrMin + o.totalInrMax) / 2);
  const waits = options.map((o) => o.waitMin);
  const transfers = options.map((o) => o.transfers);

  const walks = options.map((o) => {
    let m = o.walkM;
    if (mode === "rain") m *= 2.5;
    if (mode === "safety" && m > 500) m += (m - 500) * 1.5;
    return m;
  });

  const reliabilities = options.map((o) => calculateReliabilityScore(o, mode));

  const minTime = Math.min(...times);
  const maxTime = Math.max(...times);
  const minCost = Math.min(...costs);
  const maxCost = Math.max(...costs);
  const minWait = Math.min(...waits);
  const maxWait = Math.max(...waits);
  const minTransfers = Math.min(...transfers);
  const maxTransfers = Math.max(...transfers);
  const minWalk = Math.min(...walks);
  const maxWalk = Math.max(...walks);
  const minRel = Math.min(...reliabilities);
  const maxRel = Math.max(...reliabilities);

  return options.map((option, idx) => ({
    id: option.id,
    normTime: normalize(times[idx], minTime, maxTime),
    normCost: normalize(costs[idx], minCost, maxCost),
    normWait: normalize(waits[idx], minWait, maxWait),
    normTransfers: normalize(transfers[idx], minTransfers, maxTransfers),
    normWalking: normalize(walks[idx], minWalk, maxWalk),
    normReliability: 1 - normalize(reliabilities[idx], minRel, maxRel), // Lower normalized value = more reliable
    reliabilityScore: reliabilities[idx],
    option: {
      ...option,
      reliabilityScore: reliabilities[idx],
    },
  }));
}

/**
 * Computes a weighted score for a normalized option given a weight profile and travel mode.
 * Lower score is better.
 */
export function calculateWeightedScore(
  norm: NormalizedMetrics,
  weights: {
    time: number;
    cost: number;
    wait: number;
    transfers: number;
    walking: number;
    reliability?: number;
  },
  mode: TravelMode = "balanced"
): number {
  let score =
    weights.time * norm.normTime +
    weights.cost * norm.normCost +
    weights.wait * norm.normWait +
    weights.transfers * norm.normTransfers +
    weights.walking * norm.normWalking;

  if (weights.reliability !== undefined) {
    score += weights.reliability * norm.normReliability;
  }

  // Context mode adjustments
  if (mode === "night") {
    const hasShared = norm.option.segments.some((s) => s.type === "shared_auto");
    if (hasShared) score += 0.3;
    if (norm.option.walkM > 600) score += 0.25;
  }

  if (mode === "safety") {
    if (norm.option.walkM > 500) score += 0.2;
    if (norm.option.transfers > 1) score += 0.15;
  }

  return score;
}

/**
 * Selects and correctly ranks the top 3 distinct options:
 * 1. Cheapest (best on fare)
 * 2. Fastest (lowest total door-to-door journey time)
 * 3. Most Reliable (highest punctuality, lowest variance, sheltered fixed-rail transit)
 *
 * Enforces the Distinctness Rule:
 * "The three cards must be different options. If one option wins several profiles,
 * take the next best for the other card and tag it 'Next best'."
 */
export function selectTopThreeOptions(
  options: Option[],
  mode: TravelMode = "balanced"
): Option[] {
  if (options.length === 0) return [];

  // Compute reliability scores on options
  const optionsWithRel = options.map((opt) => ({
    ...opt,
    reliabilityScore: opt.reliabilityScore ?? calculateReliabilityScore(opt, mode),
  }));

  if (optionsWithRel.length <= 3) {
    const labels: Array<"Cheapest" | "Fastest" | "Most Reliable"> = [
      "Cheapest",
      "Fastest",
      "Most Reliable",
    ];
    return optionsWithRel.map((opt, i) => ({
      ...opt,
      label: labels[i] || "Cheapest",
      tag: null,
    }));
  }

  const normalized = normalizeOptions(optionsWithRel, mode);

  // 1. Cheapest ranking: strictly prioritized by minimum cost, then travel time
  const scoredCheapest = [...normalized].sort((a, b) => {
    const costA = (a.option.totalInrMin + a.option.totalInrMax) / 2;
    const costB = (b.option.totalInrMin + b.option.totalInrMax) / 2;
    if (Math.abs(costA - costB) > 2) return costA - costB;
    return a.option.totalMin - b.option.totalMin;
  });

  // 2. Fastest ranking: strictly prioritized by lowest total door-to-door time, then wait time
  const scoredFastest = [...normalized].sort((a, b) => {
    if (a.option.totalMin !== b.option.totalMin) {
      return a.option.totalMin - b.option.totalMin;
    }
    return a.option.waitMin - b.option.waitMin;
  });

  // 3. Most Reliable ranking: strictly prioritized by reliabilityScore descending, then transfers ascending
  const scoredReliable = [...normalized].sort((a, b) => {
    if (b.reliabilityScore !== a.reliabilityScore) {
      return b.reliabilityScore - a.reliabilityScore;
    }
    return a.option.transfers - b.option.transfers;
  });

  const chosenIds = new Set<string>();
  const results: Option[] = [];

  // Pick Cheapest
  const bestCheapest = scoredCheapest[0];
  chosenIds.add(bestCheapest.id);
  results.push({
    ...bestCheapest.option,
    label: "Cheapest",
    tag: null,
  });

  // Pick Fastest (distinct from Cheapest)
  let bestFastest = scoredFastest.find((item) => !chosenIds.has(item.id));
  let fastestTag: "Next best" | null = null;
  if (!bestFastest) {
    bestFastest = scoredFastest[0];
  } else if (bestFastest.id !== scoredFastest[0].id) {
    fastestTag = "Next best";
  }
  chosenIds.add(bestFastest.id);
  results.push({
    ...bestFastest.option,
    label: "Fastest",
    tag: fastestTag,
  });

  // Pick Most Reliable (distinct from Cheapest and Fastest)
  let bestReliable = scoredReliable.find((item) => !chosenIds.has(item.id));
  let reliableTag: "Next best" | null = null;
  if (!bestReliable) {
    bestReliable = scoredReliable[0];
  } else if (bestReliable.id !== scoredReliable[0].id) {
    reliableTag = "Next best";
  }
  results.push({
    ...bestReliable.option,
    label: "Most Reliable",
    tag: reliableTag,
  });

  return results;
}
