import Link from "next/link";
import type { Metadata } from "next";
import { getSidebarSections } from "@/lib/docs";

export const metadata: Metadata = {
  title: "Documentation",
  description:
    "Guides and reference docs for parlok — the open-source firewall for AI agent tool calls. Install, write your first policy, and ship.",
  alternates: { canonical: "/docs" },
  openGraph: {
    title: "Documentation | parlok",
    description:
      "Guides and reference docs for parlok — the open-source firewall for AI agent tool calls.",
    url: "/docs",
    type: "website",
  },
};

export default async function DocsIndex() {
  const sections = await getSidebarSections();
  const allDocs = sections.flatMap((s) => s.docs);

  if (allDocs.length === 0) {
    return (
      <p className="font-mono text-sm text-[var(--color-muted)]">
        No docs yet.
      </p>
    );
  }

  return (
    <article className="min-w-0">
      <header className="mb-12">
        <h1 className="font-serif text-5xl leading-[1.05] tracking-tight text-[var(--color-ink)]">
          Documentation
        </h1>
        <p className="mt-4 font-mono text-sm text-[var(--color-muted)] leading-relaxed max-w-2xl">
          Everything you need to install parlok, write your first policy, and
          ship guarded agents to production.
        </p>
      </header>

      <div className="space-y-12">
        {sections.map((section, i) => (
          <section key={section.slug ?? `__root__-${i}`}>
            {section.title && (
              <h2 className="mb-4 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--color-muted)]">
                {section.title}
              </h2>
            )}
            <ul className="grid gap-4">
              {section.docs.map((doc) => (
                <li key={doc.slug}>
                  <Link
                    href={`/docs/${doc.slug}`}
                    className="block rounded-md border border-[var(--color-hairline)] bg-white p-5 transition hover:border-[var(--color-ink)]/30"
                  >
                    <div className="font-serif text-2xl text-[var(--color-ink)]">
                      {doc.title}
                    </div>
                    {doc.summary && (
                      <p className="mt-2 font-mono text-sm leading-relaxed text-[var(--color-muted)]">
                        {doc.summary}
                      </p>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </article>
  );
}
