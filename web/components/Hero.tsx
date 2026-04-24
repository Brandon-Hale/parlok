import { WaitlistForm } from "./WaitlistForm";
import { HeroLanguageBadge } from "./HeroLanguageBadge";
import { HeroDemo } from "./HeroDemo";
import { TypingCycle } from "./TypingCycle";

const FEATURES = ["2-line install", "framework-agnostic", "MIT licensed"];

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" aria-hidden="true">
      <rect
        x="1.5"
        y="1.5"
        width="13"
        height="13"
        rx="2"
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.5"
      />
      <path
        d="M4.5 8.5l2.2 2.2 4.8-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Hero() {
  return (
    <section className="mx-auto max-w-6xl px-6 pt-20 pb-24">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-center">
        <div className="flex flex-col items-start">
          <HeroLanguageBadge />
          <h1 className="font-serif text-6xl sm:text-7xl lg:text-8xl leading-[0.95] tracking-tight text-[var(--color-ink)]">
            Guardrails
            <br />
            for <em className="italic">agents.</em>
          </h1>
          <p className="mt-8 text-lg text-[var(--color-muted)] max-w-xl leading-relaxed min-h-[4.5em]">
            <TypingCycle
              words={[
                "Stop bad tool calls before they happen.",
                "Catch the wrong-channel blast at 3am.",
                "Block DROP TABLE before it reaches prod.",
                "Gate $50k refunds behind a human review.",
                "Redact API keys before they leave the wire.",
                "Rewrite the bad call, not the whole agent.",
                "Every tool call, logged and auditable.",
                "Ship agents you can actually sleep on.",
              ]}
              typeMs={32}
              deleteMs={18}
              holdMs={3800}
              pauseMs={320}
            />
          </p>
          <div className="mt-10 w-full max-w-lg">
            <WaitlistForm />
          </div>
          <a
            href="https://github.com/Brandon-Hale/parlok"
            target="_blank"
            rel="noreferrer noopener"
            className="mt-5 font-mono text-sm text-[var(--color-muted)] hover:text-[var(--color-ink)] transition"
          >
            star on github →
          </a>
          <ul className="mt-4 flex flex-wrap items-center gap-x-8 gap-y-3 font-mono text-xs text-[var(--color-muted)]/80">
            {FEATURES.map((f) => (
              <li key={f} className="inline-flex items-center gap-2">
                <CheckIcon />
                {f}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <HeroDemo />
        </div>
      </div>
    </section>
  );
}
