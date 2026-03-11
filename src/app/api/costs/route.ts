import { NextResponse } from "next/server";
import { getCostSummary } from "@/lib/data";

export async function GET() {
  return NextResponse.json(await getCostSummary());
}
