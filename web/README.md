# parlok/web

Next.js 15 landing page and `/docs` sub-site for parlok.

## Quick start

```bash
cd web
npm install
npm run dev          # http://localhost:3000
```

Copy `.env.example` to `.env.local` and fill in the Resend keys if you
want the waitlist form to actually subscribe emails:

```
RESEND_API_KEY=...
RESEND_AUDIENCE_ID=...
```

## Scripts

| script | what it does |
| --- | --- |
| `npm run dev` | Local dev server at `:3000` |
| `npm run build` | Production build (prerenders all docs) |
| `npm start` | Serve the production build |
| `npm run typecheck` | `tsc --noEmit` over the whole tree |
| `npm run lint` | `next lint` (ESLint config at `.eslintrc.json`) |

If you rename routes or move files between folders while the dev
server is running, the `.next` webpack cache can go stale and throw
`Cannot find module './vendor-chunks/...'`. `rm -rf .next && npm run dev`
clears it.

## Layout

```
app/
  page.tsx                landing page
  docs/
    page.tsx              redirects to the first doc
    layout.tsx            sidebar + NavBar + Footer shell
    [...slug]/page.tsx    catch-all for nested markdown routes
  api/waitlist/route.ts   Resend + rate-limited email capture
  layout.tsx              root layout + fonts + metadata
  globals.css             design tokens, keyframes, docs-prose rules
components/               UI components (see below)
content/
  docs/                   markdown content (see "Adding docs")
lib/
  docs.ts                 markdown pipeline + sidebar grouping
public/                   static assets (favicon, etc.)
```

### Component map

Landing sections, top to bottom:

- `NavBar` — sticky header (parlok logo left, nav centre, github button right)
- `Hero` — two-column hero: headline + `WaitlistForm` + `TypingCycle`
  description on the left, live `HeroDemo` on the right
- `StatsStrip` — thin four-metric strip below the hero
- `UseCases` — 2x2 grid of YAML rule panels
  (`scenarios` anchor, rendered via `shiki`)
- `CodeSnippet` — the "How it works" section, delegates to
  `HowItWorksSteps` for the timeline render
- `InstallSection` — "Install in under a minute" panel, delegates to
  `InstallSectionView` for the tabbed install snippet
- `Footer` — four-column bottom (parlok + Product / Docs / Company)

Supporting pieces:

- `LanguageProvider` — React context storing the selected SDK
  (`python` | `typescript`)
- `HeroLanguageBadge` — pill dropdown in the hero
- `InlineLanguageToggle` — smaller dropdown used inside code panels
- `LogoMark` — the parlok diode SVG, used in the nav and footer
- `TypingCycle` — typewriter animation used for the hero description
- `HeroDemo` — live-cycling firewall demo (4 scenarios × 4 decisions)

### Design tokens

Defined in `app/globals.css` under `@theme`:

- `--color-ink` — body / headline text
- `--color-muted` — secondary text
- `--color-hairline` — all divider borders
- `--color-surface` — off-white page background + panel chrome fill
- `--color-accent` — editorial navy highlight (scenario names,
  headline emphasis, focus rings)
- `--font-sans`, `--font-mono`, `--font-serif` — Inter system fallback,
  JetBrains Mono system fallback, Instrument Serif (loaded via
  `next/font` in `app/layout.tsx`)

Keyframes in `globals.css`: `parlok-pulse`, `parlok-flow-dot`,
`parlok-ring`, `parlok-caret`, `parlok-float`.

## Adding docs

Everything in `content/docs/` renders at `/docs/<slug>`.

### A top-level doc

Create `content/docs/NN-my-doc.md`. The numeric prefix drives order.

```markdown
---
title: "My doc"
slug: "my-doc"
order: 5
summary: "One-line description for metadata + header."
---

## First heading

Body text. **Bold**, _italic_, [links](/docs/reference/rules), lists,
tables, and fenced code blocks all render with the
`.docs-prose` styles. Code is highlighted by shiki using the
`github-light` theme.
```

Required frontmatter: `title`, `slug`. Recommended: `order`, `summary`.

### A nested (sectioned) doc

Put files under a folder. The folder name becomes the sidebar section
title, its numeric prefix drives section order.

```
content/docs/
├── 00-introduction.md              (top-level, no section)
├── 02-reference/                   (section "Reference")
│   ├── 01-rules.md
│   └── 02-adapters.md
└── 03-guides/
    └── 01-my-guide.md
```

The file's `slug` is the leaf component only (e.g. `rules`); the full
URL is built as `/docs/<section-slug>/<leaf-slug>`.

## Adding a demo scenario

`components/HeroDemo.tsx` cycles through a `SCENARIOS` array. Each
scenario is:

```ts
{
  tab: "...",                  // tab label at the bottom of the panel
  decision: "ALLOW" | ...,     // drives badge + banner + status colour
  rule: "my_rule_name",        // shown in `rule: my_rule_name`
  call: <JSX>,                 // the code inside the "intercepted call" pre
  headline: "short verdict.",
  detail: "longer context.",
}
```

Adding a new scenario auto-renders a new bottom tab in the demo panel.

## Adding a new language to the SDK toggle

SDK language options live in one place:
`components/LanguageProvider.tsx` (`Language` type) and the `OPTIONS`
arrays in `HeroLanguageBadge.tsx` + `InlineLanguageToggle.tsx`. Any
code panel reading `useLanguage()` will pick up new options, but each
panel needs to provide a snippet for every language (see how
`CodeSnippet.tsx` precomputes python/typescript via shiki).
