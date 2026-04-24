"use client";

import { useLanguage } from "./LanguageProvider";
import { InlineLanguageToggle } from "./InlineLanguageToggle";

export type Step =
  | {
      number: string;
      title: string;
      caption: string;
      kind: "sdk";
      python: string;
      typescript: string;
    }
  | {
      number: string;
      title: string;
      caption: string;
      kind: "yaml";
      yaml: string;
    };

export function HowItWorksSteps({ steps }: { steps: Step[] }) {
  const { lang } = useLanguage();

  return (
    <ol className="relative border-l border-[var(--color-hairline)] pl-0">
      {steps.map((s, i) => {
        const code =
          s.kind === "yaml" ? s.yaml : lang === "python" ? s.python : s.typescript;
        const last = i === steps.length - 1;
        return (
          <li
            key={s.number}
            className={`relative grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6 md:gap-14 pl-8 pr-0 ${
              last ? "pt-10" : "pt-10 pb-10"
            }`}
          >
            <span
              aria-hidden="true"
              className="absolute left-0 top-[2.9rem] -translate-x-1/2 w-2 h-2 rounded-full bg-[var(--color-ink)]"
            />
            <div>
              <div className="flex items-baseline gap-3 font-mono text-sm">
                <span className="text-[var(--color-muted)]">{s.number}</span>
                <span className="text-[var(--color-accent)]">
                  {s.title.toLowerCase()}
                </span>
              </div>
              <p className="mt-3 font-mono text-xs text-[var(--color-muted)] leading-relaxed">
                {s.caption}
              </p>
            </div>
            <div className="rounded-lg border border-[var(--color-hairline)] bg-white overflow-hidden">
              <div className="flex items-center justify-end border-b border-[var(--color-hairline)] bg-[var(--color-surface)] px-4 py-2">
                {s.kind === "sdk" ? (
                  <InlineLanguageToggle />
                ) : (
                  <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--color-muted)]">
                    yaml
                  </span>
                )}
              </div>
              <div
                className="px-5 py-4 font-mono text-[12.5px] leading-relaxed overflow-x-auto [&_pre]:!bg-transparent [&_pre]:!m-0"
                dangerouslySetInnerHTML={{ __html: code }}
              />
            </div>
          </li>
        );
      })}
    </ol>
  );
}
