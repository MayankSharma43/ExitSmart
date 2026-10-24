import { Option, TravelMode } from "./types";

export interface OptionMetrics {
  id: string;
  time: number;
  cost: number;
  wait: number;
  transfers: number;
  walking: number;
  hasLowFrequencyBus?: boolean;
  hasSharedAuto?: boolean;
}

export interface NormalizedMetrics {
  id: string;
  normTime: number;
  normCost: number;
  normWait: number;
  normTransfers: number;
  normWalking: number;
  option: Option;
}

export const WEIGHT_PROFILES = {
  cheapest: { time: 0.1, cost: 0.6, wait: 0.1, transfers: 0.1, walking: 0.1 },
  fastest: { time: 0.6, cost: 0.1, wait: 0.2, transfers: 0.05, walking: 0.05 },
  convenient: { time: 0.2, cost: 0.1, wait: 0.2, transfers: 0.3, walking: 0.2 },
};

/**
 * Normalizes an array of values between 0 and 1.
 * If all values are identical, returns 0.
 */
function normalize(val: number, min: number, max: number): number {
  if (max <= min) return 0;
  return (val - min) / (max - min);
}

/**
 * Normalizes all options across the candidate set.
 */
export function normalizeOptions(options: Option[], mode: TravelMode = "balanced"): NormalizedMetrics[] {
  if (options.length === 0) return [];

  const times = options.map((o) => o.totalMin);
  const costs = options.map((o) => (o.totalInrMin + o.totalInrMax) / 2);
  const waits = options.map((o) => o.waitMin);
  const transfers = options.map((o) => o.transfers);
  
  // In Rain mode, walk meters are penalized heavily
  const walks = options.map((o) => {
    let m = o.walkM;
    if (mode === "rain") {
      m *= 2.5; // Rain mode walking penalty
    }
    if (mode === "safety" && m > 500) {
      m += (m - 500) * 1.5; // Safety-first penalty for long walks
    }
    return m;
  });

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

  return options.map((option, idx) => ({
    id: option.id,
    normTime: normalize(times[idx], minTime, maxTime),
    normCost: normalize(costs[idx], minCost, maxCost),
    normWait: normalize(waits[idx], minWait, maxWait),
    normTransfers: normalize(transfers[idx], minTransfers, maxTransfers),
    normWalking: normalize(walks[idx], minWalk, maxWalk),
    option,
  }));
}

/**
 * Computes a weighted score for a normalized option given a weight profile and travel mode.
 * Lower score is better.
 */
export function calculateWeightedScore(
  norm: NormalizedMetrics,
  weights: { time: number; cost: number; wait: number; transfers: number; walking: number },
  mode: TravelMode = "balanced"
): number {
  let score =
    weights.time * norm.normTime +
    weights.cost * norm.normCost +
    weights.wait * norm.normWait +
    weights.transfers * norm.normTransfers +
    weights.walking * norm.normWalking;

  // Context mode adjustments
  if (mode === "night") {
    // Penalize options containing shared auto or high walking
    const hasShared = norm.option.segments.some((s) => s.type === "shared_auto");
    if (hasShared) score += 0.3;
    if (norm.option.walkM > 600) score += 0.25;
  }

  if (mode === "safety") {
    // Penalize long walks & transfers
    if (norm.option.walkM > 500) score += 0.2;
    if (norm.option.transfers > 1) score += 0.15;
  }

  return score;
}

/**
 * Selects the top 3 distinct options: Cheapest, Fastest, Most Convenient.
 * Enforces the Distinctness Rule:
 * "The three cards must be different options. If one option wins several profiles,
 * take the next best for the other card and tag it 'Next best'."
 */
export function selectTopThreeOptions(
  options: Option[],
  mode: TravelMode = "balanced"
): Option[] {
  if (options.length === 0) return [];
  if (options.length <= 3) {
    // Assign labels directly if 3 or fewer
    const labels: Array<"Cheapest" | "Fastest" | "Most Convenient"> = [
      "Cheapest",
      "Fastest",
      "Most Convenient",
    ];
    return options.map((opt, i) => ({
      ...opt,
      label: labels[i] || "Cheapest",
      tag: null,
    }));
  }

  const normalized = normalizeOptions(options, mode);

  // Score all options for each profile
  const scoredCheapest = normalized
    .map((n) => ({
      ...n,
      score: calculateWeightedScore(n, WEIGHT_PROFILES.cheapest, mode),
    }))
    .sort((a, b) => a.score - b.score);

  const scoredFastest = normalized
    .map((n) => ({
      ...n,
      score: calculateWeightedScore(n, WEIGHT_PROFILES.fastest, mode),
    }))
    .sort((a, b) => a.score - b.score);

  const scoredConvenient = normalized
    .map((n) => ({
      ...n,
      score: calculateWeightedScore(n, WEIGHT_PROFILES.convenient, mode),
    }))
    .sort((a, b) => a.score - b.score);

  const chosenIds = new Set<string>();
  const results: Option[] = [];

  // 1. Pick Cheapest
  const bestCheapest = scoredCheapest[0];
  chosenIds.add(bestCheapest.id);
  results.push({
    ...bestCheapest.option,
    label: "Cheapest",
    tag: null,
  });

  // 2. Pick Fastest (distinct from Cheapest)
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

  // 3. Pick Most Convenient (distinct from Cheapest and Fastest)
  let bestConvenient = scoredConvenient.find((item) => !chosenIds.has(item.id));
  let convenientTag: "Next best" | null = null;
  if (!bestConvenient) {
    bestConvenient = scoredConvenient[0];
  } else if (bestConvenient.id !== scoredConvenient[0].id) {
    convenientTag = "Next best";
  }
  results.push({
    ...bestConvenient.option,
    label: "Most Convenient",
    tag: convenientTag,
  });

  return results;
}
