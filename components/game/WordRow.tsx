"use client";

import { cn } from "@/lib/utils";

interface WordRowProps {
  word: string;
  variant: "anchor" | "entered" | "target" | "solution";
  label?: string;
  highlight?: boolean;
}

export function WordRow({ word, variant, label, highlight }: WordRowProps) {
  const letters = word.toUpperCase().split("");

  return (
    <div className="flex flex-col items-center gap-1.5">
      {label && (
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-tile select-none">
          {label}
        </span>
      )}
      <div className="flex gap-1.5">
        {letters.map((letter, i) => (
          <div
            key={i}
            className={cn(
              "flex h-12 w-12 items-center justify-center text-lg font-semibold font-tile select-none transition-colors",
              "border rounded-sm",
              variant === "anchor" &&
                "bg-foreground text-background border-foreground",
              variant === "entered" &&
                !highlight &&
                "bg-card text-foreground border-border",
              variant === "entered" &&
                highlight &&
                "bg-card text-foreground border-foreground",
              variant === "target" &&
                "bg-transparent text-muted-foreground border-dashed border-border",
              variant === "solution" &&
                "bg-transparent text-foreground border-border"
            )}
          >
            {letter}
          </div>
        ))}
      </div>
    </div>
  );
}
