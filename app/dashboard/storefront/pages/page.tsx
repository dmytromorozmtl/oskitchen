import Link from "next/link";
import { ExternalLink } from "lucide-react";

import { deleteStorefrontPageFormAction } from "@/actions/storefront-pages";
import { CreateStorefrontPageForm } from "@/components/storefront/create-storefront-page-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SITE_URL } from "@/lib/constants";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { requireStorefrontManagePage } from "@/lib/storefront/storefront-page-access";
import { findAdminStorefront } from "@/lib/storefront/load-admin-storefront";
import { allEditorLocalesForStorefront, pageTranslationSummary } from "@/lib/storefront/localized-content";
import { adminPagination, parseAdminPageParam } from "@/lib/storefront/pagination";
import { prisma } from "@/lib/prisma";
import { PaginationBar } from "@/components/dashboard/pagination-bar";

export default async function StorefrontPagesAdminPage({
  searchParams,
}: {
  searchParams?: Promise<{ page?: string }>;
}) {
  const manageAccess = await requireStorefrontManagePage();
  if (!manageAccess.ok) {
    return manageAccess.deny;
  }

  const { sessionUser: user, dataUserId } = await getTenantActor();
  const sp = searchParams ? await searchParams : {};
  const pageNum = parseAdminPageParam(sp.page);
  const settings = await findAdminStorefront(user.id);
  const where = { userId: dataUserId };
  const total = await prisma.storefrontPage.count({ where });
  const { skip, take, page, totalPages } = adminPagination(total, pageNum);
  const pages = await prisma.storefrontPage.findMany({
    where,
    orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }],
    take,
    skip,
    include: {
      _count: { select: { sections: true } },
      sections: { select: { type: true, contentJson: true } },
    },
  });

  const origin = SITE_URL.replace(/\/$/, "");
  const storeBase = settings ? `${origin}/s/${settings.storeSlug}` : null;
  const editorLocales = settings ? allEditorLocalesForStorefront(settings.locale) : [];

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Pages &amp; sections</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Custom pages are served at{" "}
          <span className="font-mono text-sm">
            /s/<span className="text-foreground">your-slug</span>/p/
            <span className="text-foreground">your-page</span>
          </span>{" "}
          when published. Add sections, validate JSON, and reorder blocks like in a modern online store
          builder.
        </p>
      </div>

      {!settings ? (
        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle>Set up storefront first</CardTitle>
            <CardDescription>Create your store row on Overview, then return here to add pages.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="rounded-full">
              <Link href="/dashboard/storefront">Open overview</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <CreateStorefrontPageForm />

          <Card className="border-border/80 shadow-sm">
            <CardHeader>
              <CardTitle>Your pages</CardTitle>
              <CardDescription>
                Public URLs resolve under{" "}
                <span className="font-mono text-xs break-all">{storeBase}</span>.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pages.length === 0 ? (
                <p className="text-sm text-muted-foreground">No custom pages yet — create one above.</p>
              ) : (
                <ul className="divide-y divide-border/80 rounded-xl border border-border/80">
                  {pages.map((p) => {
                    const liveUrl = `${storeBase}/p/${p.slug}`;
                    const translationSummary =
                      editorLocales.length > 1
                        ? pageTranslationSummary(p.sections, editorLocales).filter((t) => t.missingCount > 0)
                        : [];
                    return (
                      <li key={p.id} className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0 space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-medium">{p.title}</p>
                            <span
                              className={
                                p.published
                                  ? "rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-800 dark:text-emerald-200"
                                  : "rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground"
                              }
                            >
                              {p.published ? "Published" : "Draft"}
                            </span>
                            <span className="rounded-full bg-muted/80 px-2 py-0.5 text-xs text-muted-foreground">
                              {p.pageType.replace(/_/g, " ")}
                            </span>
                          </div>
                          <p className="font-mono text-xs text-muted-foreground">
                            /p/{p.slug} · {p._count.sections} sections
                          </p>
                          {translationSummary.length > 0 ? (
                            <div className="flex flex-wrap gap-1 pt-1">
                              {translationSummary.map((t) => (
                                <span
                                  key={t.locale}
                                  className="rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-medium text-amber-900 dark:text-amber-100"
                                  title={`${t.missingCount} section(s) missing ${t.locale.toUpperCase()} copy`}
                                >
                                  Missing {t.locale.toUpperCase()} ({t.missingCount})
                                </span>
                              ))}
                            </div>
                          ) : null}
                        </div>
                        <div className="flex shrink-0 flex-wrap gap-2">
                          <Button asChild size="sm" variant="secondary" className="rounded-full">
                            <Link href={`/dashboard/storefront/pages/${p.id}`}>Edit</Link>
                          </Button>
                          {p.published ? (
                            <Button asChild size="sm" variant="outline" className="rounded-full gap-1">
                              <a href={liveUrl} target="_blank" rel="noreferrer">
                                <ExternalLink className="h-3.5 w-3.5" />
                                View
                              </a>
                            </Button>
                          ) : null}
                          <form action={deleteStorefrontPageFormAction} className="inline">
                            <input type="hidden" name="pageId" value={p.id} />
                            <Button type="submit" size="sm" variant="ghost" className="rounded-full text-destructive">
                              Delete
                            </Button>
                          </form>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
              <PaginationBar
                basePath="/dashboard/storefront/pages"
                page={page}
                totalPages={totalPages}
              />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
