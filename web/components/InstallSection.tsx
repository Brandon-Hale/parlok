import { codeToHtml } from "shiki";
import { InstallSectionView } from "./InstallSectionView";

const PYTHON = `$ pip install parlok
# → collecting parlok-0.1.0 …
# → installed parlok-0.1.0
$ parlok init
# → wrote parlok.yaml
$ parlok lint parlok.yaml
# → ok: 3 policy(ies) loaded`;

const TYPESCRIPT = `# TypeScript SDK is on the roadmap.
# The Python SDK is shipping in v0.1.
#
# Switch to the Python tab to see the real install flow.`;

export async function InstallSection() {
  const [python, typescript] = await Promise.all([
    codeToHtml(PYTHON, { lang: "bash", theme: "github-light" }),
    codeToHtml(TYPESCRIPT, { lang: "bash", theme: "github-light" }),
  ]);

  return (
    <section id="install" className="mx-auto max-w-6xl px-6 py-28 scroll-mt-16">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-start">
        <div>
          <span className="font-mono text-xs tracking-widest uppercase text-[var(--color-muted)]">
            Install
          </span>
          <h2 className="mt-4 font-serif text-4xl sm:text-5xl leading-[1.05] tracking-tight text-[var(--color-ink)]">
            Install in under a minute.
          </h2>
          <p className="mt-5 text-base text-[var(--color-muted)] leading-relaxed max-w-md">
            Wrap your SDK, point at a policy file, ship. Built-in transforms
            for PII and secret redaction, pluggable approvers for
            human-in-the-loop, SQLite audit log out of the box.
          </p>
          <div className="mt-8 flex items-center gap-5">
            <a
              href="/docs/getting-started"
              className="inline-flex items-center rounded-md bg-[var(--color-ink)] px-5 py-2.5 font-mono text-xs text-[var(--color-surface)] hover:opacity-90 transition"
            >
              read the quickstart →
            </a>
            <a
              href="https://github.com/Brandon-Hale/parlok"
              target="_blank"
              rel="noreferrer noopener"
              className="font-mono text-xs text-[var(--color-muted)] hover:text-[var(--color-ink)] transition"
            >
              view on github →
            </a>
          </div>
        </div>
        <InstallSectionView snippets={{ python, typescript }} />
      </div>
    </section>
  );
}
