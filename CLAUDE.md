# parlok — Claude Code Guidance

Parlok is an agent runtime firewall SDK. The repo contains two sibling sub-projects:

- `sdk/python/` — Python SDK. Currently skeleton only (abstract interfaces + stubs).
- `web/` — Next.js 15 landing page + `/docs` sub-site. Resend-backed waitlist form.

## Working in `sdk/python/`

```bash
cd sdk/python
pip install -e ".[dev]"
pytest
```

## Working in `web/`

```bash
cd web
npm install
npm run dev          # http://localhost:3000
npm run build        # prerenders landing + every doc
npm run typecheck    # tsc --noEmit
```

Copy `.env.example` to `.env.local` and fill `RESEND_API_KEY` +
`RESEND_AUDIENCE_ID` to exercise the waitlist route end-to-end.

See `web/README.md` for a full map of landing components, design
tokens, keyframes, and instructions for adding docs / demo scenarios /
SDK languages.

## Key web conventions

- **Design tokens** live in `web/app/globals.css` under `@theme`
  (`--color-ink`, `--color-muted`, `--color-hairline`, `--color-surface`,
  `--color-accent`, plus `--font-sans/mono/serif`). Always reference
  them via Tailwind arbitrary values (e.g.
  `text-[var(--color-muted)]`), not hardcoded hex.
- **SDK language selection** is global React context
  (`components/LanguageProvider.tsx`). Any code panel that shows
  Python/TypeScript reads `useLanguage()`; precompute both variants
  with shiki on the server and pick at render time in a client view.
- **Docs** are plain markdown under `web/content/docs/`. Top-level
  files render ungrouped; folders become sidebar sections. Numeric
  filename/folder prefixes (`01-foo`) drive order. See
  `web/lib/docs.ts` for the remark → rehype → shiki pipeline.
- **Keyframe animations** are named `parlok-*` and defined in
  `globals.css`. Reuse existing ones before inventing new ones.

## Design docs

Local specs and plans live under `docs/superpowers/` (gitignored).
Check the latest spec before making architectural changes.
