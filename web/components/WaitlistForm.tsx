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
      <p className="font-mono text-sm text-[var(--color-muted)]">
        thanks, you&apos;re in. we&apos;ll be in touch.
      </p>
    );
  }

  return (
    <div className="w-full">
      <form
        onSubmit={onSubmit}
        className="flex items-center w-full rounded-lg border border-[var(--color-hairline)] bg-white p-2 focus-within:border-[var(--color-ink)]/30 transition"
      >
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          disabled={status === "loading"}
          className="flex-1 min-w-0 px-4 py-2 bg-transparent font-mono text-sm placeholder:text-[var(--color-muted)] outline-none focus:outline-none focus-visible:outline-none disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="shrink-0 px-4 py-2 rounded-md bg-[var(--color-ink)] text-[var(--color-surface)] font-mono text-sm hover:opacity-90 transition disabled:opacity-60 whitespace-nowrap"
        >
          {status === "loading" ? "joining…" : "join waitlist →"}
        </button>
      </form>
      {error && (
        <p role="alert" className="mt-2 font-mono text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
