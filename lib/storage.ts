import type { GameState } from "@/types";

const key = (date: string) => `threadle_${date}`;

export function getGameState(date: string): GameState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(key(date));
    return raw ? (JSON.parse(raw) as GameState) : null;
  } catch {
    return null;
  }
}

export function saveGameState(state: GameState): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(key(state.date), JSON.stringify(state));
}

// chain = [startWord, ...guesses] — endWord stored separately and shown as target
export function initGameState(date: string, startWord: string): GameState {
  const existing = getGameState(date);
  if (existing) return existing;
  return { date, chain: [startWord], status: "playing" };
}
