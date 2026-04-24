import { WaitlistForm } from "./WaitlistForm";

export function Hero() {
  return (
    <section className="mx-auto max-w-5xl px-6 pt-10 pb-32">
      <nav className="flex items-center justify-between mb-32">
        <span className="font-mono text-sm">parlok</span>
        <a
          href="https://github.com/Brandon-Hale/parlok"
          className="text-sm text-[var(--color-muted)] hover:text-[var(--color-ink)] transition inline-flex items-center gap-1.5"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.2 11.38.6.11.82-.26.82-.58v-2.17c-3.34.72-4.04-1.61-4.04-1.61-.54-1.38-1.33-1.75-1.33-1.75-1.09-.75.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.83 2.8 1.3 3.49.99.11-.77.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.13-.3-.54-1.52.11-3.17 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 016 0c2.29-1.55 3.3-1.23 3.3-1.23.65 1.65.24 2.87.12 3.17.77.84 1.23 1.91 1.23 3.22 0 4.61-2.8 5.63-5.47 5.92.43.37.82 1.1.82 2.22v3.29c0 .32.22.7.83.58C20.57 21.8 24 17.3 24 12c0-6.63-5.37-12-12-12z" />
          </svg>
          GitHub
        </a>
      </nav>

      <div className="flex flex-col items-start">
        <span className="font-mono text-xs tracking-widest uppercase text-[var(--color-muted)] mb-6">
          Python SDK · v0
        </span>
        <h1 className="text-5xl sm:text-6xl font-semibold tracking-tight leading-[1.05] max-w-3xl">
          Guardrails for agents.
        </h1>
        <p className="mt-5 text-lg text-[var(--color-muted)] max-w-xl leading-relaxed">
          Stop bad tool calls before they happen. A lightweight firewall for agent tools — allow,
          rewrite, approve, or deny every call.
        </p>
        <div className="mt-10">
          <WaitlistForm />
        </div>
        <a
          href="https://github.com/Brandon-Hale/parlok"
          className="mt-6 text-sm text-[var(--color-muted)] hover:text-[var(--color-ink)] transition"
        >
          Star on GitHub →
        </a>
      </div>
    </section>
  );
}
