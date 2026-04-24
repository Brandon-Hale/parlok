const STATS = [
  { value: "2", label: "Lines to install" },
  { value: "<1ms", label: "Eval overhead" },
  { value: "0", label: "New infra" },
  { value: "100%", label: "Audit trail" },
];

export function StatsStrip() {
  return (
    <section className="border-y border-[var(--color-hairline)]">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-2 md:grid-cols-4">
          {STATS.map((s, i) => (
            <div
              key={s.label}
              className={[
                "px-6 py-6 md:py-8",
                i === 1 && "border-l border-[var(--color-hairline)]",
                i === 2 && "border-t md:border-t-0 md:border-l border-[var(--color-hairline)]",
                i === 3 && "border-t border-l md:border-t-0 border-[var(--color-hairline)]",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <div className="font-serif text-4xl md:text-5xl leading-none text-[var(--color-ink)]">
                {s.value}
              </div>
              <div className="mt-3 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--color-muted)]">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
