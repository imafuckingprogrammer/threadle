import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { isValidWord } from "@/lib/words";
import { isValidStep } from "@/lib/game";
import { revalidatePath } from "next/cache";

function isAuthorized(req: NextRequest): boolean {
  const password = req.headers.get("x-admin-password");
  return password === process.env.ADMIN_PASSWORD;
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { date, startWord, endWord, solution } = body as {
    date: string;
    startWord: string;
    endWord: string;
    solution: string[];
  };

  if (!date || !startWord || !endWord || !Array.isArray(solution) || solution.length < 1) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const start = startWord.toLowerCase();
  const end = endWord.toLowerCase();
  const steps = solution.map((w: string) => w.toLowerCase());
  const fullChain = [start, ...steps, end];
  const wordLength = start.length;

  // Validate all words are same length
  if (fullChain.some((w) => w.length !== wordLength)) {
    return NextResponse.json(
      { error: "All words must be the same length" },
      { status: 400 }
    );
  }

  // Validate all words exist
  for (const word of fullChain) {
    if (!isValidWord(word)) {
      return NextResponse.json(
        { error: `"${word.toUpperCase()}" is not a valid word` },
        { status: 400 }
      );
    }
  }

  // Validate each step differs by exactly 1 letter
  for (let i = 0; i < fullChain.length - 1; i++) {
    if (!isValidStep(fullChain[i], fullChain[i + 1])) {
      return NextResponse.json(
        {
          error: `"${fullChain[i].toUpperCase()}" → "${fullChain[i + 1].toUpperCase()}" is not a valid step`,
        },
        { status: 400 }
      );
    }
  }

  const par = steps.length; // number of intermediate words in the intended solution

  const supabase = createServerClient();
  const { error } = await supabase.from("puzzles").upsert(
    {
      date,
      word_length: wordLength,
      start_word: start,
      end_word: end,
      solution: fullChain,
      par,
    },
    { onConflict: "date" }
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  revalidatePath("/");
  revalidatePath("/api/puzzle");

  return NextResponse.json({ ok: true, par });
}
