"use client";

import { useState } from "react";

type Status = "idle" | "loading" | "success" | "error";

export function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setError(null);
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setStatus("error");
        setError(data.error ?? "Something went wrong, try again.");
        return;
      }
      setStatus("success");
    } catch {
      setStatus("error");
      setError("Network error, try again.");
    }
  }

  if (status === "success") {
    return (
      <p className="text-sm text-[var(--color-muted)]">
        Thanks, you&apos;re in. We&apos;ll be in touch.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-2 w-full max-w-md">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@company.com"
        disabled={status === "loading"}
        className="flex-1 px-4 py-2.5 rounded-md border border-[var(--color-hairline)] bg-white text-sm placeholder:text-[var(--color-muted)] focus:border-[var(--color-accent)] focus:outline-none transition disabled:opacity-60"
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className="px-5 py-2.5 rounded-md bg-[var(--color-ink)] text-[var(--color-surface)] text-sm font-medium hover:opacity-90 transition disabled:opacity-60"
      >
        {status === "loading" ? "Joining…" : "Join waitlist"}
      </button>
      {error && (
        <p role="alert" className="text-xs text-red-600 sm:absolute sm:mt-14">
          {error}
        </p>
      )}
    </form>
  );
}
