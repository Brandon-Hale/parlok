"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { SidebarSection } from "@/lib/docs";

export function DocsSidebar({ sections }: { sections: SidebarSection[] }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Docs" className="font-mono text-sm space-y-6">
      {sections.map((section, i) => (
        <div key={section.slug ?? `__root__-${i}`}>
          <div className="mb-3 text-[10px] uppercase tracking-[0.2em] text-[var(--color-muted)]">
            {section.title ?? "Docs"}
          </div>
          <ul className="space-y-1.5">
            {section.docs.map((d) => {
              const href = `/docs/${d.slug}`;
              const active = pathname === href;
              return (
                <li key={d.slug}>
                  <Link
                    href={href}
                    className={`block py-1 transition ${
                      active
                        ? "text-[var(--color-ink)]"
                        : "text-[var(--color-muted)] hover:text-[var(--color-ink)]"
                    }`}
                  >
                    {d.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
