import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

// Solution is only fetched after the game ends (won or given up)
// Not cached so it stays current, but this endpoint gets minimal traffic
export async function GET() {
  const today = new Date().toISOString().split("T")[0];
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("puzzles")
    .select("solution, par")
    .eq("date", today)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    solution: (data.solution as string[]).map((w) => w.toUpperCase()),
    par: data.par,
  });
}
