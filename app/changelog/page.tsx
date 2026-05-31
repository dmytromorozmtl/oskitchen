import type { Metadata } from "next";
import { format } from "date-fns";

import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import type { ReleaseNote } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { APP_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Changelog",
  description: `Product updates for ${APP_NAME}.`,
};

/** Avoid build-time static generation against a DB that may not have migrations yet. */
export const revalidate = 300;

export default async function PublicChangelogPage() {
  let notes: ReleaseNote[] = [];
  let loadError = false;
  try {
    notes = await prisma.releaseNote.findMany({
      where: { published: true },
      orderBy: { publishedAt: "desc" },
      take: 50,
    });
  } catch {
    loadError = true;
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <h1 className="text-3xl font-semibold tracking-tight">Changelog</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Published release notes from the OS Kitchen team. Draft entries are managed under
          Developer → Releases (owner only).
        </p>
        <ul className="mt-10 space-y-8">
          {notes.map((n) => (
            <li key={n.id} className="border-b border-border/60 pb-8 last:border-0">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {n.version}
                {n.publishedAt ? ` · ${format(n.publishedAt, "MMM d, yyyy")}` : ""}
              </p>
              <h2 className="mt-2 text-xl font-semibold">{n.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{n.summary}</p>
              <div className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                {n.content}
              </div>
            </li>
          ))}
        </ul>
        {loadError ? (
          <p className="mt-10 text-sm text-muted-foreground">
            Changelog is temporarily unavailable (database or migration not ready on this
            environment).
          </p>
        ) : notes.length === 0 ? (
          <div className="mt-10 space-y-6 rounded-2xl border border-border/80 bg-muted/20 p-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">OS Kitchen Commercial MVP Foundation</p>
              <h2 className="mt-2 text-xl font-semibold tracking-tight">First public changelog entry</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Published notes will appear here as releases ship. The items below summarize the current foundation — not
                a claim that every enterprise control is complete.
              </p>
            </div>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <span className="font-semibold text-foreground">New</span> — Storefront, sales channels, production, packing,
                routes, CRM, analytics, and platform operations surfaces.
              </li>
              <li>
                <span className="font-semibold text-foreground">Improved</span> — Navigation grouped for operators; setup sidebar
                hints with time estimates; demo storytelling for six verticals.
              </li>
              <li>
                <span className="font-semibold text-foreground">Security</span> — Platform routes remain internal-only; audit
                logging continues to expand coverage.
              </li>
              <li>
                <span className="font-semibold text-foreground">Known limitations</span> — Some approvals and provider
                automations are still policy-first — see trust and enterprise readiness docs.
              </li>
            </ul>
            <p className="text-xs text-muted-foreground">
              Owners can draft richer entries under Developer → Releases when connected to a database with the{" "}
              <code className="rounded bg-muted px-1">ReleaseNote</code> table.
            </p>
          </div>
        ) : null}
      </main>
      <SiteFooter />
    </div>
  );
}
