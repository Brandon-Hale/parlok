import { codeToHtml } from "shiki";
import { InstallSectionView } from "./InstallSectionView";

const PYTHON = `$ pip install parlok
# → collecting parlok-0.1.0 …
# → installed parlok-0.1.0
$ parlok init
# → created parlok.yaml
# → ready.`;

const TYPESCRIPT = `$ npm install parlok
# → added parlok@0.1.0
$ npx parlok init
# → created parlok.yaml
# → ready.`;

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
        <InstallSectionView snippets={{ python, typescript }} />
      </div>
    </section>
  );
}
