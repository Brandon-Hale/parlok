import { codeToHtml } from "shiki";
import { HowItWorksSteps, type Step } from "./HowItWorksSteps";

const PY_WRAP = `from parlok import Firewall
from parlok.adapters.slack import SlackAdapter

fw = Firewall.from_file("parlok.yaml")
slack = fw.wrap(SlackAdapter())`;

const TS_WRAP = `import { Firewall } from "parlok";
import { SlackAdapter } from "parlok/adapters/slack";

const fw = await Firewall.fromFile("parlok.yaml");
const slack = fw.wrap(new SlackAdapter());`;

const YAML_MATCH = `match:
  adapter: slack
  args.channel: "#announce-*"
decision: rewrite
rewrite:
  args.channel: "#eng-test"`;

const PY_RUN = `await slack.chat_postMessage(
    channel="#announce-all",
    text="closed a deal",
)
# → rewritten to #eng-test`;

const TS_RUN = `await slack.chatPostMessage({
  channel: "#announce-all",
  text: "closed a deal",
});
// → rewritten to #eng-test`;

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
      caption: "Rules live in YAML, versioned in your repo, reviewed like code.",
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
            between the agent and its tools, reading rules that live in your
            repo.
          </p>
        </div>
      </div>

      <HowItWorksSteps steps={steps} />
    </section>
  );
}
