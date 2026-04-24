# parlok — Claude Code Guidance

Parlok is an agent runtime firewall SDK. The repo contains two sibling sub-projects:

- `sdk/python/` — Python SDK. Currently skeleton only (abstract interfaces + stubs).
- `web/` — Next.js 15 landing page with a Resend-backed waitlist form.

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
npm run dev   # http://localhost:3000
```

Copy `.env.example` to `.env.local` and fill in `RESEND_API_KEY` and `RESEND_AUDIENCE_ID` to exercise the waitlist route end-to-end.

## Design docs

Local specs and plans live under `docs/superpowers/` (gitignored). See the latest spec before making architectural changes.
