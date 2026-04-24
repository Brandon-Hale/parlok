function PipelineNode({
  label,
  sublabel,
  active,
}: {
  label: string;
  sublabel: string;
  active?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={`rounded-md border px-5 py-2 font-mono text-sm ${
          active
            ? "border-[var(--color-ink)] bg-white text-[var(--color-ink)]"
            : "border-dashed border-[var(--color-hairline)] text-[var(--color-muted)]"
        }`}
      >
        {label}
      </div>
      <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-muted)]">
        {sublabel}
      </div>
    </div>
  );
}

function Dots() {
  return (
    <div className="flex items-center gap-1 text-[var(--color-muted)]">
      <span className="w-1 h-1 rounded-full bg-current" />
      <span className="w-1 h-1 rounded-full bg-current" />
      <span className="w-1 h-1 rounded-full bg-current" />
    </div>
  );
}

const TABS = ["messaging", "refunds", "db writes", "secrets leak"];
const ACTIVE_TAB = "db writes";

export function HeroDemo() {
  return (
    <div className="rounded-xl border border-[var(--color-hairline)] bg-white overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.04),0_20px_40px_-24px_rgba(0,0,0,0.12)]">
      {/* chrome */}
      <div className="relative flex items-center border-b border-[var(--color-hairline)] bg-[var(--color-surface)] px-4 py-3">
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-hairline)]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-hairline)]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-hairline)]" />
        </div>
        <div className="absolute left-1/2 -translate-x-1/2 font-mono text-xs text-[var(--color-muted)]">
          <span className="text-[var(--color-ink)]">parlok</span> · live
        </div>
        <div className="ml-auto flex items-center gap-1.5 font-mono text-xs text-[var(--color-muted)]">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500" aria-hidden="true" />
          blocked
        </div>
      </div>

      {/* pipeline */}
      <div className="px-8 pt-8 pb-2 flex items-center justify-between gap-3">
        <PipelineNode label="agent" sublabel="calls tool" />
        <Dots />
        <PipelineNode label="parlok" sublabel="evaluates" active />
        <Dots />
        <PipelineNode label="tool" sublabel="executes" />
      </div>

      {/* intercepted call */}
      <div className="px-8 pt-8 pb-4">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-muted)]">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-muted)]" />
          intercepted call
        </div>
        <pre className="mt-5 font-mono text-sm leading-relaxed text-[var(--color-ink)]">
          <span className="text-[var(--color-accent)]">db</span>
          <span>.</span>
          <span className="text-[var(--color-accent)]">execute</span>
          <span>{"("}</span>
          {"\n  "}
          <span className="text-[var(--color-ink)]/70">sql</span>
          <span>=</span>
          <span className="text-emerald-700">&quot;DROP TABLE users;&quot;</span>
          <span>,</span>
          {"\n  "}
          <span className="text-[var(--color-ink)]/70">env</span>
          <span>=</span>
          <span className="text-emerald-700">&quot;prod&quot;</span>
          <span>,</span>
          {"\n"}
          <span>{")"}</span>
        </pre>
      </div>

      {/* deny banner */}
      <div className="mx-8 mb-6 rounded-md border border-red-200/80 bg-red-50/80 px-4 py-3">
        <div className="flex items-start gap-3">
          <span className="shrink-0 rounded bg-red-900/90 text-white px-2 py-0.5 font-mono text-[10px] tracking-widest uppercase">
            deny
          </span>
          <p className="flex-1 font-mono text-xs leading-relaxed text-[var(--color-ink)]">
            <span className="font-semibold">blocked.</span>{" "}
            <span className="text-[var(--color-muted)]">
              DROP statements are forbidden in prod.
            </span>
          </p>
          <span className="shrink-0 font-mono text-[10px] text-[var(--color-muted)] whitespace-nowrap">
            rule: no_schema_drops
          </span>
        </div>
      </div>

      {/* tabs */}
      <div className="border-t border-[var(--color-hairline)] bg-[var(--color-surface)] grid grid-cols-4">
        {TABS.map((t) => {
          const active = t === ACTIVE_TAB;
          return (
            <div
              key={t}
              className={`py-3 text-center font-mono text-xs transition ${
                active
                  ? "bg-white text-[var(--color-ink)] -mb-px border-b border-white"
                  : "text-[var(--color-muted)]"
              }`}
            >
              {t}
            </div>
          );
        })}
      </div>
    </div>
  );
}
