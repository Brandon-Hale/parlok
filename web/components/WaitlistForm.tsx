"use client";

import { useState } from "react";

type Status = "idle" | "loading" | "success" | "error";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateEmail(raw: string): string | null {
  const value = raw.trim();
  if (!value) return "Enter your email to join the waitlist.";
  if (value.length > 254) return "That email is too long to be valid.";
  if (!EMAIL_RE.test(value)) return "That doesn't look like a valid email address.";
  return null;
}

export function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    const validationError = validateEmail(email);
    if (validationError) {
      setStatus("error");
      setError(validationError);
      return;
    }

    setStatus("loading");
    setError(null);

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.ok) {
        setStatus("error");
        if (res.status === 429) {
          setError("Too many attempts. Wait a minute and try again.");
        } else if (res.status === 503) {
          setError("Waitlist is temporarily unavailable. Try again shortly.");
        } else if (res.status >= 500) {
          setError("Our end is having a moment. Try again.");
        } else {
          setError(data.error ?? "Something went wrong. Try again.");
        }
        return;
      }

      setStatus("success");
    } catch {
      setStatus("error");
      setError("Couldn't reach the server. Check your connection and retry.");
    }
  }

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    setEmail(e.target.value);
    if (status === "error") {
      setStatus("idle");
      setError(null);
    }
  }

  if (status === "success") {
    return (
      <p className="font-mono text-sm text-[var(--color-muted)]">
        thanks, you&apos;re in. we&apos;ll be in touch.
      </p>
    );
  }

  const hasError = status === "error";

  return (
    <div className="w-full">
      <form
        onSubmit={onSubmit}
        noValidate
        className={`flex items-center w-full rounded-lg border bg-white p-2 transition ${
          hasError
            ? "border-red-400 focus-within:border-red-500"
            : "border-[var(--color-hairline)] focus-within:border-[var(--color-ink)]/30"
        }`}
      >
        <input
          type="email"
          value={email}
          onChange={onChange}
          placeholder="you@company.com"
          disabled={status === "loading"}
          autoComplete="email"
          aria-invalid={hasError}
          aria-describedby={hasError ? "waitlist-error" : undefined}
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
        <p
          id="waitlist-error"
          role="alert"
          className="mt-2 font-mono text-xs text-red-600"
        >
          {error}
        </p>
      )}
    </div>
  );
}
