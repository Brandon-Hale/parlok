export type DecisionKind = "allow" | "rewrite" | "approve" | "deny";

export type Scenario = {
  id: string;
  call: string;             // single-line summary shown in the stream
  callRendered: string;     // multi-line call signature for the inspector
  decision: DecisionKind;
  reason: string;           // short human-readable label
  policyYaml: string;       // 5-8 line YAML excerpt for the inspector
};

export const SCENARIOS: Scenario[] = [
  {
    id: "deploy-ok",
    call: 'slack #engineering "deploy ok"',
    callRendered: 'slack.chat_postMessage(\n  channel="#engineering",\n  text="deploy ok",\n)',
    decision: "allow",
    reason: "internal-channel-default",
    policyYaml: `name: internal-channel-default
match:
  adapter: slack
when: channel.starts_with("#")
        and not channel.is_external
decision: allow`,
  },
  {
    id: "ssn-redact",
    call: "email · contains SSN 4321",
    callRendered: 'email.send(\n  to="finance@acme.com",\n  body="…SSN 123-45-4321…",\n)',
    decision: "rewrite",
    reason: "redact_pii",
    policyYaml: `name: redact-pii
match:
  adapter: [slack, email]
decision: rewrite
transforms:
  - redact_pii`,
  },
  {
    id: "refund-threshold",
    call: "stripe.refund $52,400",
    callRendered: "stripe.refund(\n  amount=52400,\n  reason=\"customer ask\",\n)",
    decision: "approve",
    reason: "refund-threshold",
    policyYaml: `name: refund-threshold
match:
  adapter: stripe
  action: refund
when: amount > 50000
decision: approve
via: slack_card`,
  },
  {
    id: "drop-table",
    call: "postgres DROP TABLE users",
    callRendered: 'postgres.execute(\n  sql="DROP TABLE users;",\n)',
    decision: "deny",
    reason: "block-prod-drops",
    policyYaml: `name: block-prod-drops
match:
  adapter: postgres
  action: execute
when: body.matches("(?i)drop\\s+table")
decision: deny`,
  },
  {
    id: "build-green",
    call: 'slack #internal "build green"',
    callRendered: 'slack.chat_postMessage(\n  channel="#internal",\n  text="build green",\n)',
    decision: "allow",
    reason: "internal-channel-default",
    policyYaml: `name: internal-channel-default
match:
  adapter: slack
when: channel.starts_with("#")
        and not channel.is_external
decision: allow`,
  },
  {
    id: "external-channel",
    call: 'slack #announce "we just shipped"',
    callRendered: 'slack.chat_postMessage(\n  channel="#announce",\n  text="we just shipped",\n)',
    decision: "approve",
    reason: "external-channel",
    policyYaml: `name: external-channel
match:
  adapter: slack
when: channel.is_external
decision: approve
via: slack_card`,
  },
  {
    id: "clamp-length",
    call: "email · 8500 chars long",
    callRendered: 'email.send(\n  to="legal@acme.com",\n  body="<8500 chars…>",\n)',
    decision: "rewrite",
    reason: "clamp_length",
    policyYaml: `name: clamp-length
match:
  adapter: email
when: body.length > 4000
decision: rewrite
transforms:
  - clamp_length(2000)`,
  },
  {
    id: "sms-otp",
    call: 'twilio.sms +1-555 "verify code"',
    callRendered: 'twilio.messages.create(\n  to="+15550123",\n  body="Your code: 482910",\n)',
    decision: "allow",
    reason: "sms-otp-allowed",
    policyYaml: `name: sms-otp-allowed
match:
  adapter: twilio
  action: messages.create
when: body.matches("code")
decision: allow`,
  },
  {
    id: "financial-mention",
    call: "email · subject \"URGENT REFUND\"",
    callRendered: 'email.send(\n  to="ops@acme.com",\n  subject="URGENT REFUND",\n  body="…",\n)',
    decision: "approve",
    reason: "financial_mention",
    policyYaml: `name: financial-mention
match:
  adapter: email
when: subject.contains_any(
        ["refund", "wire", "invoice"])
decision: approve`,
  },
  {
    id: "truncate",
    call: "postgres TRUNCATE orders",
    callRendered: 'postgres.execute(\n  sql="TRUNCATE TABLE orders;",\n)',
    decision: "deny",
    reason: "block-prod-drops",
    policyYaml: `name: block-prod-drops
match:
  adapter: postgres
  action: execute
when: body.matches("(?i)truncate|drop")
decision: deny`,
  },
];
