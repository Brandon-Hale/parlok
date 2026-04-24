import { LogoMark } from "./LogoMark";

export function NavBar() {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-hairline)] bg-[var(--color-surface)]/80 backdrop-blur supports-[backdrop-filter]:bg-[var(--color-surface)]/70">
      <nav className="relative mx-auto max-w-6xl px-6 h-14 flex items-center justify-between">
        <a
          href="/"
          className="font-mono text-sm text-[var(--color-ink)] inline-flex items-center gap-2"
        >
          <LogoMark size={14} />
          parlok
        </a>
        <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-7 font-mono text-sm text-[var(--color-muted)] whitespace-nowrap">
          <a href="/#how-it-works" className="hover:text-[var(--color-ink)] transition">
            how it works
          </a>
          <a href="/#scenarios" className="hover:text-[var(--color-ink)] transition">
            scenarios
          </a>
          <a href="/#install" className="hover:text-[var(--color-ink)] transition">
            install
          </a>
          <a href="/docs" className="hover:text-[var(--color-ink)] transition">
            docs
          </a>
        </div>
        <a
          href="https://github.com/Brandon-Hale/parlok"
          target="_blank"
          rel="noreferrer noopener"
          className="font-mono text-sm inline-flex items-center gap-2 rounded-md border border-[var(--color-hairline)] bg-white px-3 py-1.5 text-[var(--color-ink)] hover:border-[var(--color-ink)]/30 transition"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.2 11.38.6.11.82-.26.82-.58v-2.17c-3.34.72-4.04-1.61-4.04-1.61-.54-1.38-1.33-1.75-1.33-1.75-1.09-.75.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.83 2.8 1.3 3.49.99.11-.77.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.13-.3-.54-1.52.11-3.17 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 016 0c2.29-1.55 3.3-1.23 3.3-1.23.65 1.65.24 2.87.12 3.17.77.84 1.23 1.91 1.23 3.22 0 4.61-2.8 5.63-5.47 5.92.43.37.82 1.1.82 2.22v3.29c0 .32.22.7.83.58C20.57 21.8 24 17.3 24 12c0-6.63-5.37-12-12-12z" />
          </svg>
          github
        </a>
      </nav>
    </header>
  );
}
