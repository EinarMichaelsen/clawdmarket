"use server";

import { z } from "zod/v4";
import { db } from "@/db";
import { waitlistSignups } from "@/db/schema";
import { eq, or } from "drizzle-orm";
import { headers } from "next/headers";

const normalizeUsername = (input: string): string => {
  return input
    .replace(/^https?:\/\/(www\.)?moltbook\.com\/u\//, "")
    .replace(/^moltbook\.com\/u\//, "")
    .replace(/^\/u\//, "")
    .trim();
};

const normalizeXHandle = (input: string): string => {
  return input.replace(/^@/, "").trim();
};

const baseSchema = z.object({
  roleInterest: z.enum(["buyer", "seller", "both"]),
  xUsername: z.string().optional(),
});

const agentSchema = baseSchema.extend({
  signupType: z.literal("agent"),
  moltbookUsername: z.string().min(1, "Agent profile URL is required"),
  email: z.email("Invalid email").optional().or(z.literal("")),
});

const humanSchema = baseSchema.extend({
  signupType: z.literal("human"),
  email: z.email("Invalid email address"),
  moltbookUsername: z.string().optional(),
});

const formSchema = z.discriminatedUnion("signupType", [
  agentSchema,
  humanSchema,
]);

export async function joinWaitlist(
  formData: FormData
): Promise<{ success: true; position: number } | { success: false; error: string }> {
  const raw = {
    signupType: formData.get("signupType") as string,
    moltbookUsername: formData.get("moltbookUsername") as string,
    email: formData.get("email") as string,
    roleInterest: formData.get("roleInterest") as string,
    xUsername: formData.get("xUsername") as string,
  };

  const parsed = formSchema.safeParse(raw);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? "Invalid form data";
    return { success: false, error: firstError };
  }

  const data = parsed.data;
  const moltbookUsername = data.moltbookUsername
    ? normalizeUsername(data.moltbookUsername)
    : null;
  const email = data.email || null;
  const xUsername = data.xUsername ? normalizeXHandle(data.xUsername) : null;

  // Duplicate check
  const conditions = [];
  if (moltbookUsername) {
    conditions.push(eq(waitlistSignups.moltbookUsername, moltbookUsername));
  }
  if (email) {
    conditions.push(eq(waitlistSignups.email, email));
  }

  if (conditions.length > 0) {
    const existing = await db
      .select()
      .from(waitlistSignups)
      .where(conditions.length === 1 ? conditions[0] : or(...conditions))
      .limit(1);

    if (existing.length > 0) {
      return { success: false, error: "You're already on the waitlist!" };
    }
  }

  const headerStore = await headers();
  const userAgent = headerStore.get("user-agent") ?? null;

  const [inserted] = await db
    .insert(waitlistSignups)
    .values({
      signupType: data.signupType,
      moltbookUsername,
      email,
      roleInterest: data.roleInterest,
      xUsername,
      userAgent,
    })
    .returning({ id: waitlistSignups.id });

  return { success: true, position: inserted.id };
}
