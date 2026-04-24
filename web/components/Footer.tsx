export function Footer() {
  return (
    <footer className="border-t border-[var(--color-hairline)] py-8 mt-24">
      <div className="mx-auto max-w-5xl px-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-sm text-[var(--color-muted)]">
        <div className="flex items-center gap-4">
          <span className="font-mono text-[var(--color-ink)]">parlok</span>
          <a
            href="https://github.com/Brandon-Hale/parlok"
            className="hover:text-[var(--color-ink)] transition"
          >
            GitHub
          </a>
        </div>
        <div>© 2026 parlok · built by Brandon Hale</div>
      </div>
    </footer>
  );
}
