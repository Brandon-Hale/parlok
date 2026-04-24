const STATS = [
  { value: "2", label: "Lines to install" },
  { value: "<1ms", label: "Eval overhead" },
  { value: "0", label: "New infra" },
  { value: "100%", label: "Audit trail" },
];

export function StatsStrip() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-5 border-y border-[var(--color-hairline)]">
      <ul className="grid grid-cols-2 md:grid-cols-4 gap-y-5">
        {STATS.map((s, i) => (
          <li key={s.label} className="relative px-6 text-center">
            {i > 0 && (
              <span
                aria-hidden="true"
                className={`absolute left-0 top-1/2 -translate-y-1/2 h-8 w-px bg-[var(--color-hairline)] ${
                  i === 2 ? "hidden md:block" : ""
                }`}
              />
            )}
            <div className="font-serif text-[2.25rem] leading-none text-[var(--color-ink)]">
              {s.value}
            </div>
            <div className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--color-muted)]">
              {s.label}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
