import { NextResponse } from "next/server";
import { getInfraSummary } from "@/lib/data";

export async function GET() {
  return NextResponse.json(await getInfraSummary());
}
