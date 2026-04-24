import { codeToHtml } from "shiki";
import { InstallSectionView, type InstallTab } from "./InstallSectionView";

type ByLang = {
  python: { code: string; lang: "bash" | "python" };
  typescript: { code: string; lang: "bash" | "typescript" };
};

const SAMPLES: Record<InstallTab, ByLang> = {
  install: {
    python: {
      lang: "bash",
      code: `$ pip install parlok
# → collecting parlok-0.1.0 …
# → installed parlok-0.1.0
$ parlok init
# → created parlok.rules.py
# → ready.`,
    },
    typescript: {
      lang: "bash",
      code: `$ npm install parlok
# → added parlok@0.1.0
$ npx parlok init
# → created parlok.rules.ts
# → ready.`,
    },
  },
  wrap: {
    python: {
      lang: "python",
      code: `from parlok import Firewall
from parlok.adapters.slack import SlackAdapter

fw = Firewall.from_file("parlok.rules.py")
slack = fw.wrap(SlackAdapter(token=os.environ["SLACK_TOKEN"]))`,
    },
    typescript: {
      lang: "typescript",
      code: `import { Firewall } from "parlok";
import { SlackAdapter } from "parlok/adapters/slack";

const fw = await Firewall.fromFile("parlok.rules.ts");
const slack = fw.wrap(new SlackAdapter({ token: process.env.SLACK_TOKEN! }));`,
    },
  },
  run: {
    python: {
      lang: "python",
      code: `# Same API as the Slack SDK. Now policy-checked.
await slack.chat_postMessage(channel="#sales", text="Closed a deal")`,
    },
    typescript: {
      lang: "typescript",
      code: `// Same API as the Slack SDK. Now policy-checked.
await slack.chatPostMessage({ channel: "#sales", text: "Closed a deal" });`,
    },
  },
};

async function renderAll() {
  const tabs: InstallTab[] = ["install", "wrap", "run"];
  const out = {} as Record<InstallTab, { python: string; typescript: string }>;
  for (const t of tabs) {
    const [py, ts] = await Promise.all([
      codeToHtml(SAMPLES[t].python.code, {
        lang: SAMPLES[t].python.lang,
        theme: "github-light",
      }),
      codeToHtml(SAMPLES[t].typescript.code, {
        lang: SAMPLES[t].typescript.lang,
        theme: "github-light",
      }),
    ]);
    out[t] = { python: py, typescript: ts };
  }
  return out;
}

export async function InstallSection() {
  const snippets = await renderAll();

  return (
    <section id="install" className="mx-auto max-w-6xl px-6 py-28 scroll-mt-16">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-start">
        <div>
          <span className="font-mono text-xs tracking-widest uppercase text-[var(--color-muted)]">
            Two lines
          </span>
          <h2 className="mt-4 font-serif text-4xl sm:text-5xl leading-[1.05] tracking-tight text-[var(--color-ink)]">
            Install in under a minute.
          </h2>
          <p className="mt-5 text-base text-[var(--color-muted)] leading-relaxed max-w-md">
            Wrap your tool registry, point at a rules file, ship. Pluggable
            backends for logging and approvals, or stdout if you just want to
            see it work.
          </p>
          <div className="mt-8 flex items-center gap-5">
            <a
              href="#"
              className="inline-flex items-center rounded-md bg-[var(--color-ink)] px-5 py-2.5 font-mono text-xs text-[var(--color-surface)] hover:opacity-90 transition"
            >
              read the quickstart →
            </a>
            <a
              href="https://github.com/Brandon-Hale/parlok"
              className="font-mono text-xs text-[var(--color-muted)] hover:text-[var(--color-ink)] transition"
            >
              view on github →
            </a>
          </div>
        </div>
        <InstallSectionView snippets={snippets} />
      </div>
    </section>
  );
}
