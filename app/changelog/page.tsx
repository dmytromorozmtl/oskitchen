import type { Metadata } from "next";
import { format } from "date-fns";

import { PublicChangelogEntries } from "@/components/marketing/public-changelog-entries";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import type { ReleaseNote } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { APP_NAME } from "@/lib/constants";
import { PUBLIC_CHANGELOG_P3_87_POLICY_ID } from "@/lib/marketing/public-changelog-p3-87-policy";

export const metadata: Metadata = {
  title: "Changelog",
  description: `Product updates for ${APP_NAME} — LIVE, BETA, and PREVIEW maturity labels.`,
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

  const hasDbNotes = notes.length > 0;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main
        className="mx-auto max-w-2xl px-4 py-16 sm:px-6"
        data-policy={PUBLIC_CHANGELOG_P3_87_POLICY_ID}
      >
        <h1 className="text-3xl font-semibold tracking-tight">Changelog</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Published release notes with honest <strong>LIVE</strong>, <strong>BETA</strong>, and{" "}
          <strong>PREVIEW</strong> labels. Draft entries are managed under Developer → Releases
          (owner only).
        </p>

        {hasDbNotes ? (
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
        ) : null}

        {loadError ? (
          <p className="mt-10 text-sm text-muted-foreground">
            Database release notes unavailable — showing curated public changelog below.
          </p>
        ) : null}

        {!hasDbNotes ? (
          <div className="mt-10">
            <PublicChangelogEntries />
          </div>
        ) : null}

        {!hasDbNotes && !loadError ? (
          <p className="mt-8 text-xs text-muted-foreground">
            Curated changelog ({PUBLIC_CHANGELOG_P3_87_POLICY_ID}). Owners can publish richer DB
            entries under Developer → Releases when the <code className="rounded bg-muted px-1">ReleaseNote</code>{" "}
            table is connected.
          </p>
        ) : null}
      </main>
      <SiteFooter />
    </div>
  );
}
