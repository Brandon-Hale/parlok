import { NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";

const BodySchema = z.object({
  email: z.string().email(),
});

// Simple per-IP rate limit: 5 req/min. In-memory, reset on cold start.
// This is politeness, not a security boundary.
const RATE_WINDOW_MS = 60_000;
const RATE_LIMIT = 5;
const hits = new Map<string, { count: number; resetAt: number }>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || entry.resetAt < now) {
    hits.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > RATE_LIMIT;
}

export async function POST(req: Request) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";

  if (rateLimited(ip)) {
    return NextResponse.json(
      { ok: false, error: "Too many requests — slow down." },
      { status: 429 },
    );
  }

  let parsed;
  try {
    const body = await req.json();
    parsed = BodySchema.safeParse(body);
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Please enter a valid email address." },
      { status: 400 },
    );
  }

  const apiKey = process.env.RESEND_API_KEY;
  const audienceId = process.env.RESEND_AUDIENCE_ID;

  if (!apiKey || !audienceId) {
    console.error("[waitlist] Missing RESEND_API_KEY or RESEND_AUDIENCE_ID");
    return NextResponse.json(
      { ok: false, error: "Waitlist is temporarily unavailable." },
      { status: 503 },
    );
  }

  const resend = new Resend(apiKey);

  try {
    const result = await resend.contacts.create({
      email: parsed.data.email,
      audienceId,
      unsubscribed: false,
    });

    // Resend returns an error shape for duplicates (status 422) — treat as success
    // so we don't leak whether the email is already on the list.
    if (result.error && result.error.name !== "validation_error") {
      console.error("[waitlist] Resend error:", result.error);
      return NextResponse.json(
        { ok: false, error: "Something went wrong, try again." },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[waitlist] Unexpected error:", err);
    return NextResponse.json(
      { ok: false, error: "Something went wrong, try again." },
      { status: 502 },
    );
  }
}
