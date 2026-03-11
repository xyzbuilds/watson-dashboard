import { NextResponse } from "next/server";
import { getEmails } from "@/lib/data";

export async function GET() {
  return NextResponse.json({ emails: await getEmails() });
}
