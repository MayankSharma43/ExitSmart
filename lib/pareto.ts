import { Option } from "./types";

interface ParetoVector {
  time: number;
  cost: number;
  wait: number;
  transfers: number;
  walking: number;
}

function getVector(option: Option): ParetoVector {
  return {
    time: option.totalMin,
    cost: (option.totalInrMin + option.totalInrMax) / 2,
    wait: option.waitMin,
    transfers: option.transfers,
    walking: option.walkM,
  };
}

/**
 * Checks if option A dominates option B.
 * A dominates B if A is <= B on all metrics, and strictly < B on at least one.
 */
export function dominates(a: ParetoVector, b: ParetoVector): boolean {
  const atLeastAsGood =
    a.time <= b.time &&
    a.cost <= b.cost &&
    a.wait <= b.wait &&
    a.transfers <= b.transfers &&
    a.walking <= b.walking;

  const strictlyBetter =
    a.time < b.time ||
    a.cost < b.cost ||
    a.wait < b.wait ||
    a.transfers < b.transfers ||
    a.walking < b.walking;

  return atLeastAsGood && strictlyBetter;
}

/**
 * Filters a list of options down to the non-dominated Pareto frontier.
 * If the frontier contains fewer than 3 items, preserves up to the top diverse options.
 */
export function filterParetoFrontier(options: Option[]): Option[] {
  if (options.length <= 3) return options;

  const vectors = options.map((opt) => ({
    option: opt,
    vector: getVector(opt),
  }));

  const nonDominated: Option[] = [];

  for (let i = 0; i < vectors.length; i++) {
    let isDominated = false;
    for (let j = 0; j < vectors.length; j++) {
      if (i !== j && dominates(vectors[j].vector, vectors[i].vector)) {
        isDominated = true;
        break;
      }
    }
    if (!isDominated) {
      nonDominated.push(vectors[i].option);
    }
  }

  // Guard: If aggressive domination drops options below 3, return the original set
  // so the scoring step still has sufficient candidates to pick 3 distinct cards.
  if (nonDominated.length < 3) {
    return options;
  }

  return nonDominated;
}
