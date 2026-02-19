export interface Puzzle {
  id: string;
  date: string;
  wordLength: number;
  startWord: string;
  endWord: string;
  par: number;
}

export interface PuzzleFull extends Puzzle {
  solution: string[];
}

export type GameStatus = "playing" | "won" | "given_up";

export interface GameState {
  date: string;
  chain: string[]; // full chain including start and end words
  status: GameStatus;
}

export type Rating = "gold" | "silver" | "bronze" | null;
