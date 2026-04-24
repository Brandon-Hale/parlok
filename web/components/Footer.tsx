import { LogoMark } from "./LogoMark";

const COLUMNS = [
  {
    title: "Product",
    links: [
      { label: "how it works", href: "#" },
      { label: "scenarios", href: "#" },
      { label: "pricing", href: "#" },
      { label: "changelog", href: "#" },
    ],
  },
  {
    title: "Docs",
    links: [
      { label: "quickstart", href: "#" },
      { label: "rules api", href: "#" },
      { label: "integrations", href: "#" },
      { label: "recipes", href: "#" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "about", href: "#" },
      { label: "security", href: "#" },
      { label: "contact", href: "#" },
      { label: "github", href: "https://github.com/Brandon-Hale/parlok" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-[var(--color-hairline)] mt-24">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-10">
          <div className="md:col-span-3">
            <div className="font-mono text-sm text-[var(--color-ink)] inline-flex items-center gap-2">
              <LogoMark size={14} />
              parlok
            </div>
            <p className="mt-4 font-mono text-xs leading-relaxed text-[var(--color-muted)] max-w-[32ch]">
              A firewall for agent tool calls. Built for teams shipping agents to production.
            </p>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--color-muted)]">
                {col.title}
              </div>
              <ul className="mt-4 space-y-1.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      className="font-mono text-sm text-[var(--color-ink)] hover:text-[var(--color-accent)] transition"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-[var(--color-hairline)]">
        <div className="mx-auto max-w-6xl px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 font-mono text-xs text-[var(--color-muted)]">
          <div>© 2026 parlok · MIT</div>
          <div aria-hidden="true">· · ·</div>
          <div>made for the 3am on-call</div>
        </div>
      </div>
    </footer>
  );
}
