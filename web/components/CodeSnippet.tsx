import { codeToHtml } from "shiki";
import { HowItWorksSteps, type Step } from "./HowItWorksSteps";

const PY_WRAP = `from parlok import Firewall
from parlok.adapters.slack import SlackAdapter

fw = Firewall.from_file("parlok.yaml")
slack = fw.wrap(SlackAdapter(token=SLACK_TOKEN))`;

const TS_WRAP = `// TypeScript SDK is on the roadmap.
// The Python SDK is shipping in v0.1 — switch to the Python tab
// to see working code.`;

const YAML_MATCH = `version: 1
allowed_domains: [acme.com]

policies:
  - name: redact-outbound
    match: { adapter: [slack, email] }
    decision: rewrite
    transforms: [redact_pii, redact_secrets]

  - name: approve-external
    match: { adapter: [slack, email] }
    when: recipient.is_external
    decision: approve
    via: slack_card

  - name: allow-internal
    match: { adapter: [slack, email] }
    decision: allow`;

const PY_RUN = `await slack.chat_postMessage(
    channel="#eng",
    text="leaked key: ghp_abcdef... — rotate it",
)
# → 'ghp_abcdef...' is redacted before Slack ever sees it`;

const TS_RUN = `// TypeScript SDK is on the roadmap.
// Switch to the Python tab for working code.`;

export async function CodeSnippet() {
  const [pyWrap, tsWrap, yamlMatch, pyRun, tsRun] = await Promise.all([
    codeToHtml(PY_WRAP, { lang: "python", theme: "github-light" }),
    codeToHtml(TS_WRAP, { lang: "typescript", theme: "github-light" }),
    codeToHtml(YAML_MATCH, { lang: "yaml", theme: "github-light" }),
    codeToHtml(PY_RUN, { lang: "python", theme: "github-light" }),
    codeToHtml(TS_RUN, { lang: "typescript", theme: "github-light" }),
  ]);

  const steps: Step[] = [
    {
      number: "01",
      title: "Wrap",
      caption: "Wrap each adapter once. No framework swap, no new runtime.",
      kind: "sdk",
      python: pyWrap,
      typescript: tsWrap,
    },
    {
      number: "02",
      title: "Match",
      caption: "Policies live in YAML, versioned in your repo, reviewed like code.",
      kind: "yaml",
      yaml: yamlMatch,
    },
    {
      number: "03",
      title: "Decide",
      caption: "Allow, rewrite, approve, or deny. Your agent code keeps running.",
      kind: "sdk",
      python: pyRun,
      typescript: tsRun,
    },
  ];

  return (
    <section
      id="how-it-works"
      className="mx-auto max-w-6xl px-6 py-28 scroll-mt-16"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 mb-14">
        <div>
          <span className="font-mono text-xs tracking-widest uppercase text-[var(--color-muted)]">
            How it works
          </span>
          <h2 className="mt-4 font-serif text-4xl sm:text-5xl leading-[1.05] tracking-tight text-[var(--color-ink)]">
            Wrap, match, decide.
          </h2>
        </div>
        <div className="flex md:items-end">
          <p className="font-mono text-sm text-[var(--color-muted)] leading-relaxed max-w-md">
            You keep writing agent code the way you already do. Parlok sits
            between the agent and its tools, reading policies that live in your
            repo.
          </p>
        </div>
      </div>

      <HowItWorksSteps steps={steps} />
    </section>
  );
}
