"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { WordRow } from "./WordRow";
import { ResultModal } from "./ResultModal";
import { isValidStep, formatDate } from "@/lib/game";
import { getGameState, saveGameState, initGameState } from "@/lib/storage";
import type { GameStatus, Puzzle } from "@/types";

interface GameBoardProps {
  puzzle: Puzzle;
}

export function GameBoard({ puzzle }: GameBoardProps) {
  const { startWord, endWord, wordLength, date, par } = puzzle;

  const [chain, setChain] = useState<string[]>([startWord]);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<GameStatus>("playing");
  const [wordSet, setWordSet] = useState<Set<string>>(new Set());
  const [shake, setShake] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [solution, setSolution] = useState<string[]>([]);
  const [loadingWords, setLoadingWords] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load word list for this puzzle's length
  useEffect(() => {
    fetch(`/api/words/${wordLength}`)
      .then((r) => r.json())
      .then((data) => {
        setWordSet(new Set(data.words as string[]));
        setLoadingWords(false);
      })
      .catch(() => {
        toast.error("Failed to load word list. Check your connection.");
        setLoadingWords(false);
      });
  }, [wordLength]);

  // Restore saved state
  useEffect(() => {
    const saved = getGameState(date);
    if (saved) {
      setChain(saved.chain);
      setStatus(saved.status);
      if (saved.status !== "playing") {
        fetchSolution().then((sol) => {
          if (sol) setSolution(sol);
          setShowResult(true);
        });
      }
    } else {
      initGameState(date, startWord);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, startWord]);

  async function fetchSolution(): Promise<string[] | null> {
    try {
      const r = await fetch("/api/solution");
      const data = await r.json();
      return data.solution as string[];
    } catch {
      return null;
    }
  }

  const triggerShake = useCallback((msg: string) => {
    setErrorMsg(msg);
    setShake(true);
    setTimeout(() => {
      setShake(false);
      setErrorMsg(null);
    }, 600);
  }, []);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value.toUpperCase().replace(/[^A-Z]/g, "");
    if (val.length <= wordLength) setInput(val);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status !== "playing" || loadingWords) return;
    const word = input.toLowerCase();
    const prev = chain[chain.length - 1].toLowerCase();

    if (input.length !== wordLength) {
      triggerShake(`Word must be ${wordLength} letters`);
      return;
    }
    if (!wordSet.has(word)) {
      triggerShake("Not in word list");
      return;
    }
    if (!isValidStep(prev, word)) {
      triggerShake("Must change exactly one letter");
      return;
    }
    if (word === prev) {
      triggerShake("Same word");
      return;
    }

    const newChain = [...chain, input.toUpperCase()];
    setChain(newChain);
    setInput("");

    const isWin = word === endWord.toLowerCase();
    const newStatus: GameStatus = isWin ? "won" : "playing";

    const newState = { date, chain: newChain, status: newStatus };
    saveGameState(newState);

    if (isWin) {
      setStatus("won");
      const sol = await fetchSolution();
      if (sol) setSolution(sol);
      setTimeout(() => setShowResult(true), 400);
    }
  }

  async function handleGiveUp() {
    const newState = { date, chain, status: "given_up" as GameStatus };
    saveGameState(newState);
    setStatus("given_up");
    const sol = await fetchSolution();
    if (sol) setSolution(sol);
    setShowResult(true);
  }

  const intermediates = chain.slice(1); // everything after startWord
  const steps = chain.length - 2; // steps taken so far (won: chain includes endWord)

  return (
    <>
      {/* Header */}
      <header className="flex flex-col items-center gap-1 pb-6 pt-10">
        <h1 className="font-tile text-xl font-semibold tracking-[0.25em] uppercase text-foreground">
          Threadle
        </h1>
        <p className="text-xs text-muted-foreground font-tile tracking-widest uppercase">
          {formatDate(date)}
        </p>
      </header>

      {/* Thin divider */}
      <div className="mx-auto w-full max-w-xs border-t border-border mb-8" />

      {/* Chain */}
      <div className="flex flex-col items-center">
        {/* Start anchor */}
        <WordRow word={startWord} variant="anchor" label="Start" />

        {/* Thread line + entered words */}
        <div className="flex flex-col items-center">
          {intermediates.map((word, i) => (
            <motion.div
              key={`${word}-${i}`}
              className="flex flex-col items-center"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              {/* Thread connector */}
              <div className="h-4 w-px bg-border" />
              <WordRow
                word={word}
                variant={status !== "playing" && word.toLowerCase() === endWord.toLowerCase() ? "anchor" : "entered"}
              />
            </motion.div>
          ))}

          {/* Input row (only when playing and last entered word isn't endWord) */}
          {status === "playing" && (
            <div className="flex flex-col items-center">
              <div className="h-4 w-px bg-border" />
              <form onSubmit={handleSubmit}>
                <div className={shake ? "shake" : ""}>
                  <div className="flex gap-1.5">
                    {Array.from({ length: wordLength }).map((_, i) => (
                      <div
                        key={i}
                        className="flex h-12 w-12 items-center justify-center border border-foreground rounded-sm text-lg font-semibold font-tile text-foreground bg-card cursor-text transition-colors"
                        onClick={() => inputRef.current?.focus()}
                      >
                        {input[i] ?? ""}
                      </div>
                    ))}
                  </div>
                  {/* Hidden real input */}
                  <input
                    ref={inputRef}
                    value={input}
                    onChange={handleInputChange}
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit(e as unknown as React.FormEvent)}
                    className="sr-only"
                    aria-label="Enter your word"
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="characters"
                    spellCheck={false}
                    disabled={loadingWords}
                  />
                </div>
              </form>
              {errorMsg && (
                <p className="mt-2 text-[11px] text-muted-foreground font-tile">
                  {errorMsg}
                </p>
              )}
            </div>
          )}

          {/* Thread to target */}
          <div className="h-4 w-px bg-border" />
        </div>

        {/* End anchor / target */}
        <WordRow
          word={endWord}
          variant={status !== "playing" ? "anchor" : "target"}
          label="End"
        />
      </div>

      {/* Tap to type hint */}
      {status === "playing" && !loadingWords && (
        <button
          onClick={() => inputRef.current?.focus()}
          className="mt-6 text-[11px] uppercase tracking-widest text-muted-foreground font-tile hover:text-foreground transition-colors"
        >
          {steps < 0
            ? `Tap to start`
            : `${chain.length - 1} step${chain.length - 1 !== 1 ? "s" : ""} taken`}
        </button>
      )}

      {loadingWords && (
        <p className="mt-6 text-[11px] uppercase tracking-widest text-muted-foreground font-tile">
          Loading…
        </p>
      )}

      {/* Give up */}
      {status === "playing" && !loadingWords && (
        <button
          onClick={handleGiveUp}
          className="mt-10 text-[11px] text-muted-foreground hover:text-foreground transition-colors font-tile underline underline-offset-4"
        >
          Give up
        </button>
      )}

      <AnimatePresence>
        {showResult && (
          <ResultModal
            open={showResult}
            puzzle={puzzle}
            chain={chain}
            solution={solution}
            status={status as "won" | "given_up"}
            onClose={() => setShowResult(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
