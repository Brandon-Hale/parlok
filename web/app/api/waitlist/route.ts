import { NextResponse } from "next/server";
import { z } from "zod";

const BodySchema = z.object({
  email: z.string().email(),
});

export async function POST(req: Request) {
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

  // Resend integration lands in Task 17
  console.log("[waitlist] would subscribe:", parsed.data.email);
  return NextResponse.json({ ok: true });
}
