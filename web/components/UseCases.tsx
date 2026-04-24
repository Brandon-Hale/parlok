import { codeToHtml } from "shiki";

type Decision = "REWRITE" | "APPROVE" | "DENY";

const cases: Array<{
  name: string;
  decision: Decision;
  scenario: string;
  rule: string;
}> = [
  {
    name: "safe_channels",
    decision: "REWRITE",
    scenario: "Accidental blast to the wrong channel.",
    rule: `match:
  adapter: slack
  args.channel: "#announce-*"
decision: rewrite
rewrite:
  args.channel: "#eng-test"`,
  },
  {
    name: "high_value_refunds",
    decision: "APPROVE",
    scenario: "A $50k refund from a hallucinated ticket.",
    rule: `match:
  adapter: stripe.refunds
  args.amount: ">= 10000"
decision: approve
approve:
  reviewers: [brandon]`,
  },
  {
    name: "no_schema_drops",
    decision: "DENY",
    scenario: "DROP TABLE from a sloppy SQL tool call.",
    rule: `match:
  adapter: postgres
  args.sql: "*DROP*"
  args.env: prod
decision: deny
reason: "DROP forbidden in prod"`,
  },
  {
    name: "redact_secrets",
    decision: "REWRITE",
    scenario: "API keys echoed back to the customer.",
    rule: `match:
  adapter: support
  args.text: "*sk_live_*"
decision: rewrite
rewrite:
  args.text: redact(args.text)`,
  },
];

const BADGE: Record<Decision, string> = {
  REWRITE: "bg-amber-700",
  APPROVE: "bg-indigo-700",
  DENY: "bg-red-900",
};

const DOT: Record<Decision, string> = {
  REWRITE: "bg-amber-500",
  APPROVE: "bg-indigo-500",
  DENY: "bg-red-500",
};

export async function UseCases() {
  const snippets = await Promise.all(
    cases.map((c) =>
      codeToHtml(c.rule, { lang: "yaml", theme: "github-light" }),
    ),
  );

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {cases.map((c, i) => (
          <div
            key={c.name}
            className="rounded-lg border border-[var(--color-hairline)] bg-white overflow-hidden"
          >
            <div className="flex items-center justify-between border-b border-[var(--color-hairline)] bg-[var(--color-surface)] px-4 py-2.5">
              <div className="flex items-center gap-2 font-mono text-xs text-[var(--color-muted)]">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${DOT[c.decision]}`}
                  aria-hidden="true"
                />
                <span className="text-[var(--color-ink)]">{c.name}</span>
                <span>.yaml</span>
              </div>
              <span
                className={`rounded ${BADGE[c.decision]} text-white px-2 py-0.5 font-mono text-[10px] tracking-widest uppercase`}
              >
                {c.decision.toLowerCase()}
              </span>
            </div>
            <div className="px-5 pt-4 pb-5">
              <p className="font-mono text-xs text-[var(--color-muted)] mb-4">
                {c.scenario}
              </p>
              <div
                className="font-mono text-[12.5px] leading-relaxed overflow-x-auto [&_pre]:!bg-transparent [&_pre]:!m-0"
                dangerouslySetInnerHTML={{ __html: snippets[i] }}
              />
            </div>
          </div>
        ))}
      </div>

      <p className="mt-6 font-mono text-xs text-[var(--color-muted)]">
        More scenarios ship as we go.
      </p>
    </section>
  );
}
