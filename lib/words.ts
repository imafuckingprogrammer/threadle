import fs from "fs";
import path from "path";

let _allWords: Set<string> | null = null;

function getAllWords(): Set<string> {
  if (_allWords) return _allWords;
  const filePath = path.join(process.cwd(), "data", "enable1.txt");
  const raw = fs.readFileSync(filePath, "utf-8");
  _allWords = new Set(raw.split("\n").map((w) => w.trim().toLowerCase()).filter(Boolean));
  return _allWords;
}

export function isValidWord(word: string): boolean {
  return getAllWords().has(word.toLowerCase());
}

export function getWordsByLength(length: number): string[] {
  const all = getAllWords();
  return Array.from(all).filter((w) => w.length === length);
}
