const cases = [
  {
    name: "messaging",
    status: "v0",
    headline: "Accidental blast to the wrong channel.",
    body: "Agents write code, not judgment. Catch the #announce that should've been #internal.",
    policy: `match:\n  adapter: [slack, email]\ndecision: approve`,
  },
  {
    name: "refunds",
    status: "v0.2",
    headline: "A $50k refund from a hallucinated ticket.",
    body: "Require human approval on any amount over a threshold. No more 3am surprises.",
    policy: `when: metadata.amount > 50000\ndecision: approve`,
  },
  {
    name: "db writes",
    status: "v0.3",
    headline: "DROP TABLE from a sloppy SQL tool call.",
    body: "Block destructive schema changes in production. Full stop.",
    policy: `match:\n  adapter: postgres\n  action: execute`,
  },
];

export function UseCases() {
  return (
    <section id="scenarios" className="mx-auto max-w-6xl px-6 py-28 scroll-mt-16">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 mb-12">
        <div>
          <span className="font-mono text-xs tracking-widest uppercase text-[var(--color-muted)]">
            Real failure modes
          </span>
          <h2 className="mt-4 font-serif text-4xl sm:text-5xl leading-[1.05] tracking-tight text-[var(--color-ink)]">
            The things that go wrong at 3am.
          </h2>
        </div>
        <div className="flex md:items-end">
          <p className="text-base text-[var(--color-muted)] leading-relaxed max-w-md">
            Every rule here is three lines of Python. No YAML, no policy
            language, no vendor lock-in.
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {cases.map((c) => (
          <div
            key={c.name}
            className="border border-[var(--color-hairline)] rounded-lg p-6 bg-white flex flex-col"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono text-sm text-[var(--color-accent)]">{c.name}</span>
              <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--color-muted)]">
                {c.status}
              </span>
            </div>
            <h3 className="font-semibold leading-snug mb-2">{c.headline}</h3>
            <p className="text-sm text-[var(--color-muted)] leading-relaxed mb-5">{c.body}</p>
            <pre className="mt-auto font-mono text-[11px] leading-relaxed bg-[var(--color-surface)] border border-[var(--color-hairline)] rounded-md p-3 whitespace-pre overflow-x-auto">
              {c.policy}
            </pre>
          </div>
        ))}
      </div>
      <p className="mt-6 text-xs text-[var(--color-muted)]">
        Messaging ships in v0. Refunds and DB writes follow.
      </p>
    </section>
  );
}
