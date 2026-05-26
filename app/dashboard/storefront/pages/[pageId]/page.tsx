import Link from "next/link";
import { notFound } from "next/navigation";
import { StorefrontSectionType } from "@prisma/client";

import {
  addStorefrontSectionFormAction,
  deleteStorefrontSectionFormAction,
  moveStorefrontSectionFormAction,
  updateStorefrontPageDetailsFormAction,
  updateStorefrontSectionJsonFormAction,
} from "@/actions/storefront-pages";
import { PageSettingsLocaleForm } from "@/components/storefront-builder/page-settings-locale-form";
import { SectionPackInsertForm } from "@/components/storefront-builder/section-library-toolbar";
import { SectionLibraryToolbar } from "@/components/storefront-builder/section-library-toolbar";
import { SectionEditorPanel } from "@/components/storefront-builder/section-editors/section-editor-panel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SITE_URL } from "@/lib/constants";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { allEditorLocalesForStorefront } from "@/lib/storefront/localized-content";
import { prisma } from "@/lib/prisma";
import { listStorefrontMediaForOwner } from "@/services/storefront-builder/media-service";

const sectionTypes = Object.values(StorefrontSectionType);

export default async function StorefrontPageEditorPage({
  params,
  searchParams,
}: {
  params: Promise<{ pageId: string }>;
  searchParams: Promise<{ sectionError?: string }>;
}) {
  const { pageId } = await params;
  const sp = await searchParams;
  const sectionErr = sp.sectionError;
  if (!/^[0-9a-f-]{36}$/i.test(pageId)) notFound();

  const { sessionUser: user, dataUserId } = await getTenantActor();
  const page = await prisma.storefrontPage.findFirst({
    where: { id: pageId, userId: dataUserId },
    include: {
      sections: { orderBy: { sortOrder: "asc" } },
      storefront: { select: { storeSlug: true, locale: true } },
    },
  });
  if (!page) notFound();

  const editorLocales = allEditorLocalesForStorefront(page.storefront.locale ?? "en");
  const defaultLocale = editorLocales[0] ?? "en";

  const mediaAssets = (
    await listStorefrontMediaForOwner(dataUserId, page.storefrontId)
  ).map((a) => ({ id: a.id, url: a.url, label: a.label, altText: a.altText }));

  const forms = await prisma.storefrontForm.findMany({
    where: { storefrontId: page.storefrontId, archived: false },
    orderBy: { title: "asc" },
    select: { id: true, title: true, slug: true },
  });

  const origin = SITE_URL.replace(/\/$/, "");
  const publicUrl = `${origin}/s/${page.storefront.storeSlug}/p/${page.slug}`;
  const content = page.contentJson as { body?: string; html?: string };
  const pageBody =
    typeof content.body === "string" ? content.body : typeof content.html === "string" ? content.html : "";

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          {sectionErr === "json" ? (
            <p className="mb-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">
              Content must be valid JSON.
            </p>
          ) : null}
          {sectionErr === "schema" ? (
            <p className="mb-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">
              JSON does not match this section type (check required fields like <code className="font-mono">body</code> for text blocks).
            </p>
          ) : null}
          <p className="text-xs text-muted-foreground">
            <Link href="/dashboard/storefront/pages" className="text-primary underline-offset-4 hover:underline">
              ← All pages
            </Link>
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Edit page</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Fine-tune SEO, publishing, and section JSON. Invalid section JSON is rejected with a clear error on save.
          </p>
        </div>
        <Button asChild variant="outline" className="rounded-full">
          <Link href={publicUrl} target="_blank" rel="noreferrer">
            Open public URL
          </Link>
        </Button>
      </div>

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle>Page settings</CardTitle>
          <CardDescription>Slug changes update the live URL immediately after save.</CardDescription>
        </CardHeader>
        <CardContent>
          <PageSettingsLocaleForm
            pageId={page.id}
            pageType={page.pageType}
            slug={page.slug}
            published={page.published}
            publishAt={page.publishAt?.toISOString() ?? null}
            robotsNoindex={page.robotsNoindex}
            linkedFormId={page.linkedFormId}
            pageBody={pageBody}
            contentJson={page.contentJson}
            editorLocales={editorLocales}
            defaultLocale={defaultLocale}
            rowTitle={page.title}
            rowSeoTitle={page.seoTitle}
            rowSeoDescription={page.seoDescription}
            forms={forms}
            mediaAssets={mediaAssets}
          />
        </CardContent>
      </Card>

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle>Sections</CardTitle>
          <CardDescription>
            Reorder with arrows. JSON is validated per section type (hero, text, FAQ, etc.).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form action={addStorefrontSectionFormAction} className="flex flex-wrap items-end gap-3 rounded-xl border border-dashed border-border/80 p-4">
            <input type="hidden" name="pageId" value={page.id} />
            <div className="space-y-2">
              <Label htmlFor="sectionType">Add section</Label>
              <select id="sectionType" name="sectionType" className="flex h-10 min-w-[200px] rounded-xl border border-input bg-background px-3 py-2 text-sm" defaultValue="TEXT_BLOCK">
                {sectionTypes.map((t) => (
                  <option key={t} value={t}>
                    {t.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </div>
            <Button type="submit" variant="secondary" className="rounded-full">
              Add
            </Button>
            <SectionPackInsertForm pageId={page.id} />
          </form>

          {page.sections.length === 0 ? (
            <p className="text-sm text-muted-foreground">No sections — add one above.</p>
          ) : (
            page.sections.map((s, idx) => (
              <div key={s.id} className="rounded-xl border border-border/80 bg-muted/20 p-4">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium">
                    {s.type.replace(/_/g, " ")}
                    <span className="ml-2 font-mono text-xs font-normal text-muted-foreground">#{idx + 1}</span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <form action={moveStorefrontSectionFormAction} className="inline">
                      <input type="hidden" name="sectionId" value={s.id} />
                      <input type="hidden" name="direction" value="up" />
                      <Button type="submit" size="sm" variant="outline" className="rounded-full" disabled={idx === 0}>
                        Up
                      </Button>
                    </form>
                    <form action={moveStorefrontSectionFormAction} className="inline">
                      <input type="hidden" name="sectionId" value={s.id} />
                      <input type="hidden" name="direction" value="down" />
                      <Button type="submit" size="sm" variant="outline" className="rounded-full" disabled={idx === page.sections.length - 1}>
                        Down
                      </Button>
                    </form>
                    <form action={deleteStorefrontSectionFormAction} className="inline">
                      <input type="hidden" name="sectionId" value={s.id} />
                      <Button type="submit" size="sm" variant="ghost" className="rounded-full text-destructive">
                        Remove
                      </Button>
                    </form>
                    <SectionLibraryToolbar sectionId={s.id} />
                  </div>
                </div>
                <SectionEditorPanel
                  sectionId={s.id}
                  type={s.type}
                  contentJson={s.contentJson}
                  editorLocales={editorLocales}
                  defaultLocale={defaultLocale}
                  mediaAssets={mediaAssets}
                />
                <form action={updateStorefrontSectionJsonFormAction} className="space-y-2">
                  <input type="hidden" name="sectionId" value={s.id} />
                  <Label className="text-xs text-muted-foreground">contentJson</Label>
                  <Textarea
                    name="contentJson"
                    rows={10}
                    defaultValue={JSON.stringify(s.contentJson, null, 2)}
                    className="font-mono text-xs leading-relaxed"
                    spellCheck={false}
                  />
                  <Button type="submit" size="sm" className="rounded-full">
                    Save section JSON
                  </Button>
                </form>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
