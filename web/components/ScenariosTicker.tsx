type Decision = "ALLOW" | "REWRITE" | "APPROVE" | "DENY";

type Policy = {
  ruleName: string;
  decision: Decision;
  description: string;
};

const POLICIES: Policy[] = [
  {
    ruleName: "safe_channels",
    decision: "REWRITE",
    description: "#announce-* routed to #eng-test.",
  },
  {
    ruleName: "no_schema_drops",
    decision: "DENY",
    description: "DROP / TRUNCATE forbidden in prod.",
  },
  {
    ruleName: "high_value_refunds",
    decision: "APPROVE",
    description: "refunds over $10k park for review.",
  },
  {
    ruleName: "redact_secrets",
    decision: "REWRITE",
    description: "mask sk_live_* tokens in outbound text.",
  },
  {
    ruleName: "sms_otp_allowed",
    decision: "ALLOW",
    description: "OTP messages always pass through.",
  },
  {
    ruleName: "external_channel_posts",
    decision: "APPROVE",
    description: "posts to external Slacks need a human.",
  },
  {
    ruleName: "financial_emails",
    decision: "APPROVE",
    description: "subject matches refund / wire / invoice.",
  },
  {
    ruleName: "clamp_email_length",
    decision: "REWRITE",
    description: "cap outbound emails at 2000 chars.",
  },
  {
    ruleName: "dev_writes_allow",
    decision: "ALLOW",
    description: "env=dev writes pass unchecked.",
  },
  {
    ruleName: "no_pii_in_urls",
    decision: "DENY",
    description: "block SSN / card numbers in query strings.",
  },
  {
    ruleName: "rate_limit_posts",
    decision: "DENY",
    description: "more than 10 posts/min per channel.",
  },
  {
    ruleName: "audit_all_db",
    decision: "ALLOW",
    description: "every query logged for review.",
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
