export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://parlok.ai";

export const SITE_NAME = "parlok";

export const SITE_TAGLINE = "Agent firewall & tool-call guardrails";

export const SITE_DESCRIPTION =
  "Parlok is an open-source firewall for AI agent tool calls. Allow, rewrite, approve, or deny every call before it reaches Slack, Stripe, your DB, or any other tool.";

export const GITHUB_URL = "https://github.com/Brandon-Hale/parlok";

export const LINKEDIN_URL = "https://www.linkedin.com/company/parlok";

export const SOCIAL_URLS = [GITHUB_URL, LINKEDIN_URL];
