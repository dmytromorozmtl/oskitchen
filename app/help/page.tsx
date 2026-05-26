"use client";

import * as React from "react";
import Link from "next/link";

const LINKS = [
  {
    href: "/help/getting-started",
    title: "Getting started",
    desc: "First menu, orders, production.",
  },
  {
    href: "/help/order-hub",
    title: "Order Hub",
    desc: "Unified queue across channels.",
  },
  {
    href: "/help/integrations",
    title: "Connecting WooCommerce",
    desc: "REST keys, webhooks, troubleshooting.",
  },
  {
    href: "/integrations/woocommerce/extension",
    title: "WooCommerce extension overview",
    desc: "Listing readiness for WordPress admins.",
  },
  {
    href: "/integrations/shopify/app",
    title: "Shopify custom app overview",
    desc: "OAuth scopes and review checklist (no approval claimed).",
  },
  {
    href: "/help/integrations",
    title: "Connecting Shopify",
    desc: "Admin token + webhook signing.",
  },
  {
    href: "/help/production",
    title: "Production board",
    desc: "Throughput and tasks.",
  },
  {
    href: "/help/packing",
    title: "Printing labels",
    desc: "Labels, verification, delivery.",
  },
  {
    href: "/help/import-export",
    title: "Importing orders",
    desc: "CSV exports and channel ingest.",
  },
  {
    href: "/help/products-skus",
    title: "Products & unmatched SKUs",
    desc: "Aligning menu items with channel payloads.",
  },
  {
    href: "/help/uber-eats",
    title: "Understanding Uber Eats access",
    desc: "Partner credentials — never marketed as live without keys.",
  },
  {
    href: "/help/billing",
    title: "Billing and plans",
    desc: "Trials, Stripe checkout, limits.",
  },
  {
    href: "/help/data-export",
    title: "Exporting data",
    desc: "Workspace CSV backups.",
  },
  {
    href: "/help/faq",
    title: "FAQ",
    desc: "Short answers.",
  },
] as const;

export default function HelpHomePage() {
  const [q, setQ] = React.useState("");
  const filtered = LINKS.filter(
    (l) =>
      !q.trim() ||
      `${l.title} ${l.desc}`.toLowerCase().includes(q.trim().toLowerCase()),
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Help center</h1>
        <p className="mt-2 text-muted-foreground">
          Practical guides for weekly food operations — filter titles & descriptions below.
        </p>
        <label className="mt-4 block text-sm font-medium text-foreground">
          Search articles
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="menu, webhook, billing…"
            className="mt-2 flex h-10 w-full max-w-md rounded-xl border border-input bg-background px-3 text-sm"
          />
        </label>
      </div>
      <ul className="space-y-3">
        {filtered.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="block rounded-2xl border border-border/80 bg-card px-5 py-4 shadow-sm transition-colors hover:bg-muted/40"
            >
              <p className="font-medium">{l.title}</p>
              <p className="text-sm text-muted-foreground">{l.desc}</p>
            </Link>
          </li>
        ))}
        {!filtered.length ? (
          <li className="text-sm text-muted-foreground">No matches — try another keyword.</li>
        ) : null}
      </ul>
      <div className="rounded-2xl border border-dashed border-border/80 bg-muted/20 p-5 text-sm text-muted-foreground">
        <p>
          <strong className="text-foreground">Still need help?</strong> Book an onboarding session at{" "}
          <Link href="/book-demo" className="text-primary underline">
            /book-demo
          </Link>{" "}
          or use the in-app <strong className="text-foreground">Feedback</strong> button.
        </p>
      </div>
    </div>
  );
}
