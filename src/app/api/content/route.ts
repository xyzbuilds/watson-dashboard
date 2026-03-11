import { NextResponse } from "next/server";
import { getContentItems } from "@/lib/data";

export async function GET() {
  return NextResponse.json({ items: await getContentItems() });
}
