import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { waitlistSignups } from "@/db/schema";
import { asc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");

  if (!token || token !== process.env.ADMIN_TOKEN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const signups = await db
    .select()
    .from(waitlistSignups)
    .orderBy(asc(waitlistSignups.id));

  return NextResponse.json({ count: signups.length, signups });
}
