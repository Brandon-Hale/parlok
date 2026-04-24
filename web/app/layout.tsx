import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "parlok — Guardrails for agents",
  description:
    "Stop bad tool calls before they happen. A lightweight firewall for agent tools — allow, rewrite, approve, or deny every call.",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
