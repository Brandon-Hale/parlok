type Decision = "ALLOW" | "REWRITE" | "APPROVE" | "DENY";

type Policy = {
  ruleName: string;
  decision: Decision;
  description: string;
};

const POLICIES: Policy[] = [
  {
    ruleName: "redact-pii",
    decision: "REWRITE",
    description: "strip emails, phones, SSNs from outbound text.",
  },
  {
    ruleName: "redact-secrets",
    decision: "REWRITE",
    description: "mask AWS / GitHub / Slack / Stripe tokens.",
  },
  {
    ruleName: "block-prod-drops",
    decision: "DENY",
    description: "DROP TABLE refused before it reaches the DB.",
  },
  {
    ruleName: "approve-external",
    decision: "APPROVE",
    description: "external recipients need a human.",
  },
  {
    ruleName: "approve-vip",
    decision: "APPROVE",
    description: "messages to the VIP list need a human.",
  },
  {
    ruleName: "approve-financial",
    decision: "APPROVE",
    description: "currency amounts in body park for review.",
  },
  {
    ruleName: "after-hours",
    decision: "APPROVE",
    description: "outbound outside business hours needs a human.",
  },
  {
    ruleName: "bulk-send",
    decision: "APPROVE",
    description: "more than 25 recipients needs a human.",
  },
  {
    ruleName: "first-time-recipient",
    decision: "APPROVE",
    description: "first contact with a new recipient needs a human.",
  },
  {
    ruleName: "clamp-outbound",
    decision: "REWRITE",
    description: "cap outbound messages at 2000 chars.",
  },
  {
    ruleName: "strip-urls",
    decision: "REWRITE",
    description: "remove links from outbound text.",
  },
  {
    ruleName: "tone-check",
    decision: "REWRITE",
    description: "downgrade ALLCAPS runs and mask profanity.",
  },
];

const DOT: Record<Decision, string> = {
  ALLOW: "bg-emerald-500",
  REWRITE: "bg-amber-500",
  APPROVE: "bg-indigo-500",
  DENY: "bg-red-500",
};

const LABEL: Record<Decision, string> = {
  ALLOW: "text-emerald-700",
  REWRITE: "text-amber-700",
  APPROVE: "text-indigo-700",
  DENY: "text-red-800",
};

export function ScenariosTicker() {
  const doubled = [...POLICIES, ...POLICIES];

  return (
    <div
      className="relative overflow-hidden"
      style={{
        maskImage:
          "linear-gradient(to right, transparent 0, black 6%, black 94%, transparent 100%)",
        WebkitMaskImage:
          "linear-gradient(to right, transparent 0, black 6%, black 94%, transparent 100%)",
      }}
    >
      <div className="flex gap-4 w-max parlok-ticker py-2">
        {doubled.map((p, i) => (
          <article
            key={`${p.ruleName}-${i}`}
            aria-hidden={i >= POLICIES.length ? "true" : undefined}
            className="shrink-0 w-[280px] rounded-lg border border-[var(--color-hairline)] bg-white px-5 py-4"
          >
            <div className="flex items-center gap-2">
              <span
                className={`w-1.5 h-1.5 rounded-full ${DOT[p.decision]}`}
                aria-hidden="true"
              />
              <span
                className={`font-mono text-[10px] uppercase tracking-[0.2em] ${LABEL[p.decision]}`}
              >
                {p.decision.toLowerCase()}
              </span>
            </div>
            <div className="mt-3 font-mono text-sm text-[var(--color-ink)]">
              {p.ruleName}
            </div>
            <p className="mt-2 font-mono text-xs text-[var(--color-muted)] leading-relaxed">
              {p.description}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}
