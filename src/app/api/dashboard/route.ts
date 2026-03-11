import { NextResponse } from "next/server";
import { getDashboardSnapshot } from "@/lib/data";

export async function GET() {
  return NextResponse.json(await getDashboardSnapshot());
}
