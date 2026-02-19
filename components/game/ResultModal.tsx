"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { WordRow } from "./WordRow";
import { getRating, countSteps, formatDate } from "@/lib/game";
import type { Puzzle } from "@/types";
import { toast } from "sonner";

const RATING_LABEL: Record<string, string> = {
  gold: "Gold Thread",
  silver: "Silver Thread",
  bronze: "Bronze Thread",
};

const RATING_COLOR: Record<string, string> = {
  gold: "text-amber-600",
  silver: "text-zinc-400",
  bronze: "text-amber-800",
};

interface ResultModalProps {
  open: boolean;
  puzzle: Puzzle;
  chain: string[];
  solution: string[];
  status: "won" | "given_up";
  onClose: () => void;
}

export function ResultModal({
  open,
  puzzle,
  chain,
  solution,
  status,
  onClose,
}: ResultModalProps) {
  const steps = countSteps(chain);
  const rating = status === "won" ? getRating(steps, puzzle.par) : null;

  function buildShareText(): string {
    const date = formatDate(puzzle.date);
    const ratingLine =
      status === "won" && rating
        ? `${RATING_LABEL[rating]} — ${steps} step${steps !== 1 ? "s" : ""} (par ${puzzle.par})`
        : `Didn't finish — par was ${puzzle.par}`;

    return [
      `THREADLE — ${date}`,
      `${puzzle.startWord.toUpperCase()} → ${puzzle.endWord.toUpperCase()}`,
      ratingLine,
      "threadle.com",
    ].join("\n");
  }

  async function handleShare() {
    const text = buildShareText();
    try {
      await navigator.clipboard.writeText(text);
      toast("Copied to clipboard");
    } catch {
      toast("Share text", { description: text });
    }
  }

  const parDiff = status === "won" ? steps - puzzle.par : null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm gap-6 border-border bg-card p-8">
        <DialogHeader>
          <DialogTitle className="text-center font-tile text-base uppercase tracking-widest text-muted-foreground">
            {status === "won" ? "Solved" : "Better luck tomorrow"}
          </DialogTitle>
        </DialogHeader>

        {status === "won" && rating && (
          <div className="text-center">
            <p className={`text-2xl font-semibold ${RATING_COLOR[rating]}`}>
              {RATING_LABEL[rating]}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {steps} step{steps !== 1 ? "s" : ""}
              {parDiff === 0 && " — matched par"}
              {parDiff !== null && parDiff < 0 && ` — ${Math.abs(parDiff)} under par`}
              {parDiff !== null && parDiff > 0 && ` — ${parDiff} over par`}
            </p>
          </div>
        )}

        {/* Show the intended solution */}
        <div className="flex flex-col items-center">
          <p className="mb-3 text-[10px] uppercase tracking-widest text-muted-foreground font-tile">
            {status === "won" ? "Your path" : "Today's solution"}
          </p>
          <div className="flex flex-col items-center gap-1.5">
            {(status === "won" ? chain : solution).map((word, i) => {
              const isFirst = i === 0;
              const isLast =
                i === (status === "won" ? chain : solution).length - 1;
              return (
                <WordRow
                  key={i}
                  word={word}
                  variant={isFirst || isLast ? "anchor" : "solution"}
                />
              );
            })}
          </div>
          {status === "won" && steps > puzzle.par && (
            <p className="mt-3 text-[11px] text-muted-foreground font-tile text-center">
              Par solution was {puzzle.par} step{puzzle.par !== 1 ? "s" : ""}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Button onClick={handleShare} variant="outline" className="w-full font-tile tracking-wide">
            Share result
          </Button>
          <Button onClick={onClose} variant="ghost" className="w-full text-muted-foreground text-xs">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
