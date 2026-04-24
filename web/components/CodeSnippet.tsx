import { codeToHtml } from "shiki";
import { CodeSnippetView } from "./CodeSnippetView";

const PYTHON = `from parlok import Firewall
from parlok.adapters.slack import SlackAdapter

fw = Firewall.from_file("parlok.rules.py")
slack = fw.wrap(SlackAdapter(token=os.environ["SLACK_TOKEN"]))

# Same API as the Slack SDK. Now policy-checked.
await slack.chat_postMessage(channel="#sales", text="Closed a deal")
`;

const TYPESCRIPT = `import { Firewall } from "parlok";
import { SlackAdapter } from "parlok/adapters/slack";

const fw = await Firewall.fromFile("parlok.rules.ts");
const slack = fw.wrap(new SlackAdapter({ token: process.env.SLACK_TOKEN! }));

// Same API as the Slack SDK. Now policy-checked.
await slack.chatPostMessage({ channel: "#sales", text: "Closed a deal" });
`;

export async function CodeSnippet() {
  const [python, typescript] = await Promise.all([
    codeToHtml(PYTHON, { lang: "python", theme: "github-light" }),
    codeToHtml(TYPESCRIPT, { lang: "typescript", theme: "github-light" }),
  ]);

  return (
    <section id="how-it-works" className="mx-auto max-w-6xl px-6 py-16 scroll-mt-16">
      <div className="mb-8">
        <span className="font-mono text-xs tracking-widest uppercase text-[var(--color-muted)]">
          How it works
        </span>
      </div>
      <CodeSnippetView python={python} typescript={typescript} />
    </section>
  );
}
