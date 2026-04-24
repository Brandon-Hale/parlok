"use client";

import { useLanguage } from "./LanguageProvider";

type Props = {
  python: string;
  typescript: string;
};

export function CodeSnippetView({ python, typescript }: Props) {
  const { lang } = useLanguage();
  const html = lang === "python" ? python : typescript;

  return (
    <div
      className="rounded-lg border border-[var(--color-hairline)] bg-white p-6 overflow-x-auto text-sm [&_pre]:!bg-transparent [&_pre]:!m-0"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
