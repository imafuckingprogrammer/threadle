import { GameBoard } from "@/components/game/GameBoard";
import { createServerClient } from "@/lib/supabase";
import type { Puzzle } from "@/types";

export const dynamic = "force-dynamic";

async function getPuzzle(): Promise<Puzzle | null> {
  try {
    const today = new Date().toISOString().split("T")[0];
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("puzzles")
      .select("id, date, word_length, start_word, end_word, par")
      .eq("date", today)
      .single();
    if (error || !data) return null;
    return {
      id: data.id,
      date: data.date,
      wordLength: data.word_length,
      startWord: (data.start_word as string).toUpperCase(),
      endWord: (data.end_word as string).toUpperCase(),
      par: data.par,
    };
  } catch {
    return null;
  }
}

export default async function Home() {
  const puzzle = await getPuzzle();

  return (
    <main className="flex min-h-screen flex-col items-center px-4 pb-16">
      {puzzle ? (
        <GameBoard puzzle={puzzle} />
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
          <p className="font-tile text-xs uppercase tracking-widest text-muted-foreground">
            No puzzle today
          </p>
          <p className="text-sm text-muted-foreground max-w-xs">
            Come back tomorrow — or check the admin panel to add today&apos;s puzzle.
          </p>
        </div>
      )}
    </main>
  );
}
