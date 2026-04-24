"use client";

import { useState } from "react";
import { useLanguage } from "./LanguageProvider";

export type InstallTab = "install" | "wrap" | "run";

type ByLang = {
  python: string;
  typescript: string;
};

type Props = {
  snippets: Record<InstallTab, ByLang>;
};

const TABS: { id: InstallTab; label: string }[] = [
  { id: "install", label: "install" },
  { id: "wrap", label: "wrap" },
  { id: "run", label: "run" },
];

export function InstallSectionView({ snippets }: Props) {
  const [tab, setTab] = useState<InstallTab>("install");
  const { lang } = useLanguage();
  const html = snippets[tab][lang];

  return (
    <div className="rounded-lg border border-[var(--color-hairline)] bg-white overflow-hidden">
      <div
        role="tablist"
        className="grid grid-cols-3 border-b border-[var(--color-hairline)] bg-[var(--color-surface)]"
      >
        {TABS.map((t) => {
          const active = t.id === tab;
          return (
            <button
              key={t.id}
              role="tab"
              aria-selected={active}
              onClick={() => setTab(t.id)}
              className={`py-3 font-mono text-xs transition ${
                active
                  ? "bg-white text-[var(--color-ink)] -mb-px border-b border-white"
                  : "text-[var(--color-muted)] hover:text-[var(--color-ink)]"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>
      <div
        className="p-6 overflow-x-auto text-sm [&_pre]:!bg-transparent [&_pre]:!m-0"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
