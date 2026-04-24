"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type Decision = "ALLOW" | "REWRITE" | "APPROVE" | "DENY";

type Scenario = {
  tab: string;
  decision: Decision;
  rule: string;
  call: ReactNode;
  headline: string;
  detail: string;
};

type DecisionStyle = {
  badge: string;
  banner: string;
  statusDot: string;
  statusLabel: string;
};

const STYLES: Record<Decision, DecisionStyle> = {
  ALLOW: {
    badge: "bg-emerald-700",
    banner: "border-emerald-200/80 bg-emerald-50/80",
    statusDot: "bg-emerald-500",
    statusLabel: "allowed",
  },
  REWRITE: {
    badge: "bg-amber-700",
    banner: "border-amber-200/80 bg-amber-50/70",
    statusDot: "bg-amber-500",
    statusLabel: "rewritten",
  },
  APPROVE: {
    badge: "bg-indigo-700",
    banner: "border-indigo-200/80 bg-indigo-50/80",
    statusDot: "bg-indigo-500",
    statusLabel: "pending",
  },
  DENY: {
    badge: "bg-red-900",
    banner: "border-red-200/80 bg-red-50/80",
    statusDot: "bg-red-500",
    statusLabel: "blocked",
  },
};

const K = ({ children }: { children: ReactNode }) => (
  <span className="text-[var(--color-accent)]">{children}</span>
);
const A = ({ children }: { children: ReactNode }) => (
  <span className="text-[var(--color-ink)]/70">{children}</span>
);
const S = ({ children }: { children: ReactNode }) => (
  <span className="text-emerald-700">{children}</span>
);
const N = ({ children }: { children: ReactNode }) => (
  <span className="text-amber-700">{children}</span>
);

const SCENARIOS: Scenario[] = [
  {
    tab: "messaging",
    decision: "ALLOW",
    rule: "safe_channels",
    call: (
      <>
        <K>slack</K>.<K>chat_postMessage</K>(
        {"\n  "}
        <A>channel</A>=<S>&quot;#eng-standup&quot;</S>,
        {"\n  "}
        <A>text</A>=<S>&quot;daily sync in 5&quot;</S>,
        {"\n"})
      </>
    ),
    headline: "passed.",
    detail: "#eng-standup is on the allowlist.",
  },
  {
    tab: "refunds",
    decision: "APPROVE",
    rule: "high_value_refunds",
    call: (
      <>
        <K>stripe</K>.<K>refunds</K>.<K>create</K>(
        {"\n  "}
        <A>charge</A>=<S>&quot;ch_8xk2ab&quot;</S>,
        {"\n  "}
        <A>amount</A>=<N>52_000</N>,
        {"\n"})
      </>
    ),
    headline: "parked for review.",
    detail: "$52k over the $10k threshold. waiting on @brandon.",
  },
  {
    tab: "db writes",
    decision: "DENY",
    rule: "no_schema_drops",
    call: (
      <>
        <K>db</K>.<K>execute</K>(
        {"\n  "}
        <A>sql</A>=<S>&quot;DROP TABLE users;&quot;</S>,
        {"\n  "}
        <A>env</A>=<S>&quot;prod&quot;</S>,
        {"\n"})
      </>
    ),
    headline: "blocked.",
    detail: "DROP statements are forbidden in prod.",
  },
  {
    tab: "secrets leak",
    decision: "REWRITE",
    rule: "redact_secrets",
    call: (
      <>
        <K>support</K>.<K>reply</K>(
        {"\n  "}
        <A>text</A>=<S>&quot;key is sk_live_9a2...fx&quot;</S>,
        {"\n  "}
        <A>to</A>=<S>&quot;cust_341&quot;</S>,
        {"\n"})
      </>
    ),
    headline: "redacted.",
    detail: "sent as sk_live_*** instead.",
  },
];

const CYCLE_MS = 5800;
const FADE_MS = 500;

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
            ? "border-[var(--color-ink)] bg-white text-[var(--color-ink)] parlok-ring"
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

function Dots({ delayOffset = 0 }: { delayOffset?: number }) {
  return (
    <div className="flex items-center gap-1.5 text-[var(--color-muted)]">
      {[0, 0.2, 0.4].map((d, i) => (
        <span
          key={i}
          className="w-1 h-1 rounded-full bg-current parlok-flow-dot"
          style={{ animationDelay: `${d + delayOffset}s` }}
        />
      ))}
    </div>
  );
}

function ScenarioBody({
  scenario,
  style,
}: {
  scenario: Scenario;
  style: DecisionStyle;
}) {
  return (
    <div className="flex flex-col h-full">
      <div className="px-8 pt-8 pb-4">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-muted)]">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-muted)]" />
          intercepted call
        </div>
        <pre className="mt-5 font-mono text-sm leading-relaxed text-[var(--color-ink)]">
          {scenario.call}
        </pre>
      </div>

      <div
        className={`mx-8 mt-auto mb-6 rounded-md border px-4 py-3 ${style.banner}`}
      >
        <div className="flex items-start gap-3">
          <span
            className={`shrink-0 rounded ${style.badge} text-white px-2 py-0.5 font-mono text-[10px] tracking-widest uppercase`}
          >
            {scenario.decision.toLowerCase()}
          </span>
          <p className="flex-1 font-mono text-xs leading-relaxed text-[var(--color-ink)] min-h-[2.5em]">
            <span className="font-semibold">{scenario.headline}</span>{" "}
            <span className="text-[var(--color-muted)]">{scenario.detail}</span>
          </p>
          <span className="shrink-0 font-mono text-[10px] text-[var(--color-muted)] whitespace-nowrap">
            rule: {scenario.rule}
          </span>
        </div>
      </div>
    </div>
  );
}

export function HeroDemo() {
  const [idx, setIdx] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  function stop() {
    if (timer.current) {
      clearInterval(timer.current);
      timer.current = null;
    }
  }

  function start() {
    stop();
    timer.current = setInterval(() => {
      setIdx((i) => (i + 1) % SCENARIOS.length);
    }, CYCLE_MS);
  }

  useEffect(() => {
    start();
    return stop;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function jump(i: number) {
    setIdx(i);
    start();
  }

  const fadeStyle = { transitionDuration: `${FADE_MS}ms` };

  return (
    <div
      onMouseEnter={stop}
      onMouseLeave={start}
      className="rounded-xl border border-[var(--color-hairline)] bg-white overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.04),0_20px_40px_-24px_rgba(0,0,0,0.12)]"
    >
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
        <div className="ml-auto grid">
          {SCENARIOS.map((s, i) => {
            const sStyle = STYLES[s.decision];
            const active = i === idx;
            return (
              <div
                key={s.tab}
                aria-hidden={!active}
                style={fadeStyle}
                className={`[grid-area:1/1] transition-opacity ease-out flex items-center gap-1.5 font-mono text-xs text-[var(--color-muted)] ${
                  active ? "opacity-100" : "opacity-0"
                }`}
              >
                <span className="relative inline-flex w-1.5 h-1.5">
                  <span
                    className={`absolute inset-0 rounded-full ${sStyle.statusDot} parlok-pulse opacity-60`}
                    aria-hidden="true"
                  />
                  <span
                    className={`relative rounded-full w-1.5 h-1.5 ${sStyle.statusDot}`}
                  />
                </span>
                {sStyle.statusLabel}
              </div>
            );
          })}
        </div>
      </div>

      {/* pipeline */}
      <div className="px-8 pt-8 pb-2 flex items-center justify-between gap-3">
        <PipelineNode label="agent" sublabel="calls tool" />
        <Dots />
        <PipelineNode label="parlok" sublabel="evaluates" active />
        <Dots delayOffset={0.6} />
        <PipelineNode label="tool" sublabel="executes" />
      </div>

      {/* body (crossfade via grid stack) */}
      <div className="grid">
        {SCENARIOS.map((s, i) => {
          const active = i === idx;
          return (
            <div
              key={s.tab}
              aria-hidden={!active}
              style={fadeStyle}
              className={`[grid-area:1/1] transition-opacity ease-out ${
                active ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
            >
              <ScenarioBody scenario={s} style={STYLES[s.decision]} />
            </div>
          );
        })}
      </div>

      {/* tabs */}
      <div
        role="tablist"
        className="border-t border-[var(--color-hairline)] bg-[var(--color-surface)] grid grid-cols-4"
      >
        {SCENARIOS.map((s, i) => {
          const active = i === idx;
          return (
            <button
              key={s.tab}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => jump(i)}
              className={`py-3 text-center font-mono text-xs transition-colors duration-300 ${
                active
                  ? "bg-white text-[var(--color-ink)] -mb-px border-b border-white"
                  : "text-[var(--color-muted)] hover:text-[var(--color-ink)]"
              }`}
            >
              {s.tab}
            </button>
          );
        })}
      </div>
    </div>
  );
}
