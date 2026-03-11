import { NextResponse } from "next/server";
import { getSessions } from "@/lib/data";

export async function GET() {
  return NextResponse.json({ sessions: await getSessions() });
}
