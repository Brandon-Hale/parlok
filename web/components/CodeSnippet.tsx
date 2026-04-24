import { codeToHtml } from "shiki";

const SAMPLE = `from parlok import Firewall
from parlok.adapters.slack import SlackAdapter

fw = Firewall.from_file("firewall.yaml")
slack = fw.wrap(SlackAdapter(token=os.environ["SLACK_TOKEN"]))

# Same API as the Slack SDK — now policy-checked.
await slack.chat_postMessage(channel="#sales", text="Closed a deal")
`;

export async function CodeSnippet() {
  const html = await codeToHtml(SAMPLE, {
    lang: "python",
    theme: "github-light",
  });

  return (
    <section className="mx-auto max-w-5xl px-6 py-16">
      <div className="mb-8">
        <span className="font-mono text-xs tracking-widest uppercase text-[var(--color-muted)]">
          How it looks
        </span>
      </div>
      <div
        className="rounded-lg border border-[var(--color-hairline)] bg-white p-6 overflow-x-auto text-sm [&_pre]:!bg-transparent [&_pre]:!m-0"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </section>
  );
}
