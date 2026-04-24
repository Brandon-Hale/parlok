"use client";

import { useEffect, useState } from "react";

type Props = {
  words: string[];
  className?: string;
  typeMs?: number;
  deleteMs?: number;
  holdMs?: number;
  pauseMs?: number;
};

export function TypingCycle({
  words,
  className = "",
  typeMs = 70,
  deleteMs = 38,
  holdMs = 2000,
  pauseMs = 280,
}: Props) {
  const [idx, setIdx] = useState(0);
  const [text, setText] = useState(words[0] ?? "");
  const [phase, setPhase] = useState<"typing" | "deleting">("typing");

  useEffect(() => {
    if (words.length === 0) return;
    const word = words[idx];
    let timer: ReturnType<typeof setTimeout>;

    if (phase === "typing") {
      if (text.length < word.length) {
        timer = setTimeout(
          () => setText(word.slice(0, text.length + 1)),
          typeMs,
        );
      } else {
        timer = setTimeout(() => setPhase("deleting"), holdMs);
      }
    } else {
      if (text.length > 0) {
        timer = setTimeout(() => setText(text.slice(0, -1)), deleteMs);
      } else {
        timer = setTimeout(() => {
          setIdx((i) => (i + 1) % words.length);
          setPhase("typing");
        }, pauseMs);
      }
    }

    return () => clearTimeout(timer);
  }, [text, phase, idx, words, typeMs, deleteMs, holdMs, pauseMs]);

  return (
    <span className={className}>
      {text}
      <span
        aria-hidden="true"
        className="parlok-caret ml-0.5 font-light text-[var(--color-ink)]/70"
      >
        |
      </span>
    </span>
  );
}
