"use client";

import * as React from "react";

import { copyStorefrontPageLocalesFormAction, updateStorefrontPageDetailsFormAction } from "@/actions/storefront-pages";
import { resolvePageMetaForLocale } from "@/lib/storefront/localized-page-meta";
import { MediaUrlField } from "@/components/storefront/media/media-url-field";
import type { MediaPickerAsset } from "@/components/storefront/media/media-picker-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function PageSettingsLocaleForm({
  pageId,
  pageType,
  slug,
  published,
  publishAt,
  robotsNoindex,
  linkedFormId,
  pageBody,
  contentJson,
  editorLocales,
  defaultLocale,
  rowTitle,
  rowSeoTitle,
  rowSeoDescription,
  forms,
  mediaAssets = [],
}: {
  pageId: string;
  pageType: string;
  slug: string;
  published: boolean;
  publishAt: string | null;
  robotsNoindex: boolean;
  linkedFormId: string | null;
  pageBody: string;
  contentJson: unknown;
  editorLocales: string[];
  defaultLocale: string;
  rowTitle: string;
  rowSeoTitle: string | null;
  rowSeoDescription: string | null;
  forms: { id: string; title: string; slug: string }[];
  mediaAssets?: MediaPickerAsset[];
}) {
  const [activeLocale, setActiveLocale] = React.useState(defaultLocale);
  const meta = resolvePageMetaForLocale(contentJson, activeLocale, defaultLocale, {
    title: rowTitle,
    seoTitle: rowSeoTitle,
    seoDescription: rowSeoDescription,
    seoOgImageUrl: null,
  });

  return (
    <div className="space-y-4">
      {editorLocales.length > 1 ? (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1">
            {editorLocales.map((loc) => (
              <button
                key={loc}
                type="button"
                onClick={() => setActiveLocale(loc)}
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  activeLocale === loc ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                {loc.toUpperCase()}
              </button>
            ))}
          </div>
          {activeLocale === defaultLocale ? (
            <form action={copyStorefrontPageLocalesFormAction}>
              <input type="hidden" name="pageId" value={pageId} />
              <input type="hidden" name="sourceLocale" value={defaultLocale} />
              <Button type="submit" size="sm" variant="outline" className="rounded-full">
                Copy {defaultLocale.toUpperCase()} → all locales
              </Button>
            </form>
          ) : null}
        </div>
      ) : null}

      <form action={updateStorefrontPageDetailsFormAction} className="space-y-4">
        <input type="hidden" name="pageId" value={pageId} />
        <input type="hidden" name="editLocale" value={activeLocale} />
        <input type="hidden" name="defaultLocale" value={defaultLocale} />
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="title">Title ({activeLocale.toUpperCase()})</Label>
            <Input id="title" name="title" required defaultValue={meta.title ?? rowTitle} className="rounded-xl" />
          </div>
          {pageType !== "HOME" ? (
            <div className="space-y-2">
              <Label htmlFor="slug">URL slug</Label>
              <Input id="slug" name="slug" required defaultValue={slug} className="rounded-xl font-mono text-sm" />
            </div>
          ) : (
            <input type="hidden" name="slug" value={slug} />
          )}
          <div className="flex flex-col gap-2 pb-2">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="published" value="on" defaultChecked={published} className="h-4 w-4 rounded border-input" />
              Published
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="robotsNoindex" value="on" defaultChecked={robotsNoindex} className="h-4 w-4 rounded border-input" />
              Hide from search (noindex)
            </label>
          </div>
          <div className="space-y-2">
            <Label htmlFor="publishAt">Schedule publish (optional)</Label>
            <Input
              id="publishAt"
              name="publishAt"
              type="datetime-local"
              defaultValue={publishAt ? publishAt.slice(0, 16) : ""}
              className="rounded-xl text-sm"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="seoTitle">SEO title ({activeLocale.toUpperCase()})</Label>
            <Input id="seoTitle" name="seoTitle" defaultValue={meta.seoTitle ?? ""} className="rounded-xl" />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="seoDescription">SEO description</Label>
            <Textarea id="seoDescription" name="seoDescription" rows={2} defaultValue={meta.seoDescription ?? ""} className="rounded-xl" />
          </div>
          <MediaUrlField
            id="seoOgImageUrl"
            name="seoOgImageUrl"
            label={`OG image (${activeLocale.toUpperCase()})`}
            defaultValue={meta.seoOgImageUrl ?? ""}
            assets={mediaAssets}
            placeholder="https://… or pick from library"
          />
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="linkedFormId">Linked form (optional)</Label>
            <select
              id="linkedFormId"
              name="linkedFormId"
              defaultValue={linkedFormId ?? ""}
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">None</option>
              {forms.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.title} ({f.slug})
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="pageBody">Legacy plain body (optional)</Label>
            <Textarea id="pageBody" name="pageBody" rows={4} defaultValue={pageBody} className="rounded-xl" />
          </div>
        </div>
        <Button type="submit" className="rounded-full">
          Save page ({activeLocale.toUpperCase()})
        </Button>
      </form>
    </div>
  );
}
