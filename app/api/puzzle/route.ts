import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  const today = new Date().toISOString().split("T")[0];
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("puzzles")
    .select("id, date, word_length, start_word, end_word, par")
    .eq("date", today)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "No puzzle today" }, { status: 404 });
  }

  return NextResponse.json({
    id: data.id,
    date: data.date,
    wordLength: data.word_length,
    startWord: data.start_word.toUpperCase(),
    endWord: data.end_word.toUpperCase(),
    par: data.par,
  });
}
