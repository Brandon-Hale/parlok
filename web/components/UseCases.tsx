import { ScenariosTicker } from "./ScenariosTicker";

export function UseCases() {
  return (
    <section
      id="scenarios"
      className="mx-auto max-w-6xl px-6 py-28 scroll-mt-16"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 mb-14">
        <div>
          <span className="font-mono text-xs tracking-widest uppercase text-[var(--color-muted)]">
            Real failure modes
          </span>
          <h2 className="mt-4 font-serif text-4xl sm:text-5xl leading-[1.05] tracking-tight text-[var(--color-ink)]">
            The things that go wrong at 3am.
          </h2>
        </div>
        <div className="flex md:items-end">
          <p className="font-mono text-sm text-[var(--color-muted)] leading-relaxed max-w-md">
            Every rule is a few lines of YAML. No custom DSL, no control plane,
            no vendor lock-in.
          </p>
        </div>
      </div>

      <ScenariosTicker />

      <p className="mt-6 font-mono text-xs text-[var(--color-muted)]">
        More scenarios ship as we go. Hover to pause.
      </p>
    </section>
  );
}
