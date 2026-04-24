"use client";

import { useLanguage } from "./LanguageProvider";
import { InlineLanguageToggle } from "./InlineLanguageToggle";

type Props = {
  snippets: {
    python: string;
    typescript: string;
  };
};

export function InstallSectionView({ snippets }: Props) {
  const { lang } = useLanguage();
  const html = lang === "python" ? snippets.python : snippets.typescript;

  return (
    <div className="rounded-lg border border-[var(--color-hairline)] bg-white overflow-hidden">
      <div className="flex items-center justify-between border-b border-[var(--color-hairline)] bg-[var(--color-surface)] px-4 py-2">
        <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--color-muted)]">
          install
        </span>
        <InlineLanguageToggle />
      </div>
      <div
        className="p-6 overflow-x-auto text-sm [&_pre]:!bg-transparent [&_pre]:!m-0"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
