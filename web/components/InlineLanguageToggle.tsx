"use client";

import { useEffect, useRef, useState } from "react";
import { useLanguage, type Language } from "./LanguageProvider";

const OPTIONS: { value: Language; label: string }[] = [
  { value: "python", label: "python" },
  { value: "typescript", label: "typescript" },
];

export function InlineLanguageToggle() {
  const { lang, setLang } = useLanguage();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const active = OPTIONS.find((o) => o.value === lang) ?? OPTIONS[0];

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 rounded-md border border-[var(--color-hairline)] bg-white px-2.5 py-1 font-mono text-[11px] hover:border-[var(--color-ink)]/30 transition"
      >
        <span className="text-[var(--color-ink)]">{active.label}</span>
        <svg
          width="8"
          height="8"
          viewBox="0 0 10 10"
          aria-hidden="true"
          className={`text-[var(--color-muted)] transition ${open ? "rotate-180" : ""}`}
        >
          <path
            d="M2 4l3 3 3-3"
            stroke="currentColor"
            strokeWidth="1.25"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {open && (
        <ul
          role="listbox"
          className="absolute right-0 mt-1 z-20 min-w-[140px] rounded-lg border border-[var(--color-hairline)] bg-white shadow-sm py-1"
        >
          {OPTIONS.map((o) => {
            const selected = o.value === lang;
            return (
              <li key={o.value} role="option" aria-selected={selected}>
                <button
                  type="button"
                  onClick={() => {
                    setLang(o.value);
                    setOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 font-mono text-xs hover:bg-[var(--color-surface)] transition ${
                    selected ? "text-[var(--color-ink)]" : "text-[var(--color-muted)]"
                  }`}
                >
                  {o.label}
                  {selected && <span className="ml-2 text-[var(--color-accent)]">✓</span>}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
