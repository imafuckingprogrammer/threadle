import type { Rating } from "@/types";

export function editDistance(a: string, b: string): number {
  if (a.length !== b.length) return Infinity;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) diff++;
  }
  return diff;
}

export function isValidStep(from: string, to: string): boolean {
  return editDistance(from, to) === 1;
}

// Number of intermediate steps (not counting start and end)
export function countSteps(chain: string[]): number {
  return chain.length - 2;
}

export function getRating(steps: number, par: number): Rating {
  if (steps <= par) return "gold";
  if (steps === par + 1) return "silver";
  return "bronze";
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}
