import { NextRequest, NextResponse } from "next/server";
import { getWordsByLength } from "@/lib/words";

export const revalidate = false; // permanent cache — word list never changes

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ length: string }> }
) {
  const { length } = await params;
  const n = parseInt(length, 10);
  if (isNaN(n) || n < 2 || n > 10) {
    return NextResponse.json({ error: "Invalid length" }, { status: 400 });
  }
  const words = getWordsByLength(n);
  return NextResponse.json({ words });
}
