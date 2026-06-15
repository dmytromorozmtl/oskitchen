"use client";

import type { ReactNode } from "react";
import * as React from "react";
import { StorefrontSectionType } from "@prisma/client";

import {
  copyStorefrontSectionLocalesFormAction,
  updateStorefrontSectionContentFormAction,
} from "@/actions/storefront-pages";
import {
  ensureLocalizedEditorState,
  sectionTranslationStatus,
} from "@/lib/storefront/localized-content";
import { RichTextBodyField } from "@/components/storefront-builder/rich-text-body-field";
import { SliderSectionEditor, type SliderSlideDraft } from "@/components/storefront-builder/slider-section-editor";
import type { MediaPickerAsset } from "@/components/storefront/media/media-picker-dialog";
import { MediaUrlField } from "@/components/storefront/media/media-url-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Content = Record<string, unknown>;

export function SectionEditorPanel({
  sectionId,
  type,
  contentJson,
  editorLocales,
  defaultLocale,
  mediaAssets = [],
}: {
  sectionId: string;
  type: StorefrontSectionType;
  contentJson: unknown;
  editorLocales: string[];
  defaultLocale: string;
  mediaAssets?: MediaPickerAsset[];
}) {
  const localized = ensureLocalizedEditorState(contentJson, defaultLocale, editorLocales.filter((l) => l !== defaultLocale));
  const statuses = sectionTranslationStatus(type, localized, editorLocales);
  const [activeLocale, setActiveLocale] = React.useState(defaultLocale);
  const content = (localized.byLocale[activeLocale] ?? {}) as Content;
  const activeStatus = statuses.find((s) => s.locale === activeLocale);

  if (type === StorefrontSectionType.HERO) {
    return (
      <LocalizedSectionForm
        sectionId={sectionId}
        type={type}
        activeLocale={activeLocale}
        editorLocales={editorLocales}
        defaultLocale={defaultLocale}
        statuses={statuses}
        onLocaleChange={setActiveLocale}
        missingHint={activeStatus && !activeStatus.complete ? activeStatus.missingFields : []}
      >
        <Field id="headline" label="Headline" defaultValue={str(content.headline)} />
        <Field id="subheadline" label="Subheadline" defaultValue={str(content.subheadline)} />
        <MediaUrlField
          id="imageUrl"
          name="imageUrl"
          label="Hero image"
          defaultValue={str(content.imageUrl)}
          assets={mediaAssets}
        />
        <Field id="imageAlt" label="Hero image alt text" defaultValue={str(content.imageAlt)} />
        <Field id="primaryCtaLabel" label="Primary button label" defaultValue={str(content.primaryCtaLabel)} />
        <Field id="primaryCtaHref" label="Primary button link" defaultValue={str(content.primaryCtaHref)} mono />
        <Field id="secondaryCtaLabel" label="Secondary button label" defaultValue={str(content.secondaryCtaLabel)} />
        <Field id="secondaryCtaHref" label="Secondary button link" defaultValue={str(content.secondaryCtaHref)} mono />
      </LocalizedSectionForm>
    );
  }

  if (type === StorefrontSectionType.TEXT_BLOCK) {
    return (
      <LocalizedSectionForm
        sectionId={sectionId}
        type={type}
        activeLocale={activeLocale}
        editorLocales={editorLocales}
        defaultLocale={defaultLocale}
        statuses={statuses}
        onLocaleChange={setActiveLocale}
        missingHint={activeStatus && !activeStatus.complete ? activeStatus.missingFields : []}
      >
        <Field id="heading" label="Heading" defaultValue={str(content.heading)} />
        {content.bodyFormat === "markdown" || str(content.body).includes("**") || str(content.body).includes("\n- ") ? (
          <RichTextBodyField
            id="body"
            name="body"
            defaultValue={str(content.body)}
            required={activeLocale === defaultLocale}
          />
        ) : (
          <div className="space-y-2">
            <Label htmlFor="body">Body</Label>
            <Textarea id="body" name="body" required={activeLocale === defaultLocale} defaultValue={str(content.body)} rows={6} className="rounded-xl text-sm" />
            <input type="hidden" name="bodyFormat" value="plain" />
          </div>
        )}
      </LocalizedSectionForm>
    );
  }

  if (type === StorefrontSectionType.CTA) {
    return (
      <LocalizedSectionForm
        sectionId={sectionId}
        type={type}
        activeLocale={activeLocale}
        editorLocales={editorLocales}
        defaultLocale={defaultLocale}
        statuses={statuses}
        onLocaleChange={setActiveLocale}
        missingHint={activeStatus && !activeStatus.complete ? activeStatus.missingFields : []}
      >
        <Field id="headline" label="Headline" defaultValue={str(content.headline)} />
        <div className="space-y-2">
          <Label htmlFor="body">Body</Label>
          <Textarea id="body" name="body" defaultValue={str(content.body)} rows={3} className="rounded-xl text-sm" />
        </div>
        <Field id="buttonLabel" label="Button label" defaultValue={str(content.buttonLabel)} />
        <Field id="buttonHref" label="Button link" defaultValue={str(content.buttonHref)} mono />
      </LocalizedSectionForm>
    );
  }

  if (type === StorefrontSectionType.ANNOUNCEMENT) {
    return (
      <LocalizedSectionForm sectionId={sectionId} type={type} activeLocale={activeLocale} editorLocales={editorLocales} defaultLocale={defaultLocale} statuses={statuses} onLocaleChange={setActiveLocale} missingHint={activeStatus && !activeStatus.complete ? activeStatus.missingFields : []}>
        <Field id="message" label="Message" defaultValue={str(content.message)} />
        <div className="space-y-2">
          <Label htmlFor="tone">Tone</Label>
          <select id="tone" name="tone" defaultValue={str(content.tone) || "info"} className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm">
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="success">Success</option>
          </select>
        </div>
      </LocalizedSectionForm>
    );
  }

  if (type === StorefrontSectionType.FAQ) {
    const items = Array.isArray(content.items) ? (content.items as { q?: string; a?: string }[]) : [{ q: "", a: "" }];
    return (
      <LocalizedSectionForm sectionId={sectionId} type={type} activeLocale={activeLocale} editorLocales={editorLocales} defaultLocale={defaultLocale} statuses={statuses} onLocaleChange={setActiveLocale} missingHint={activeStatus && !activeStatus.complete ? activeStatus.missingFields : []}>
        {items.map((item, i) => (
          <div key={i} className="space-y-2 rounded-lg border border-border/50 p-2">
            <Field id={`faq_q_${i}`} label={`Question ${i + 1}`} defaultValue={str(item.q)} />
            <div className="space-y-2">
              <Label htmlFor={`faq_a_${i}`}>Answer</Label>
              <Textarea id={`faq_a_${i}`} name={`faq_a_${i}`} defaultValue={str(item.a)} rows={2} className="rounded-xl text-sm" />
            </div>
          </div>
        ))}
        <input type="hidden" name="faqCount" value={String(items.length)} />
      </LocalizedSectionForm>
    );
  }

  if (type === StorefrontSectionType.SLIDER) {
    const rawSlides = Array.isArray(content.slides) ? (content.slides as Record<string, unknown>[]) : [{}];
    const initialSlides: SliderSlideDraft[] = rawSlides.map((s, i) => ({
      id: `slide-${i}`,
      title: str(s.title),
      subtitle: str(s.subtitle),
      imageUrl: str(s.imageUrl),
      altText: str(s.altText),
      ctaLabel: str(s.ctaLabel),
      ctaHref: str(s.ctaHref),
    }));
    return (
      <LocalizedSectionForm sectionId={sectionId} type={type} activeLocale={activeLocale} editorLocales={editorLocales} defaultLocale={defaultLocale} statuses={statuses} onLocaleChange={setActiveLocale} missingHint={activeStatus && !activeStatus.complete ? activeStatus.missingFields : []}>
        <SliderSectionEditor key={activeLocale} initialSlides={initialSlides} mediaAssets={mediaAssets} />
      </LocalizedSectionForm>
    );
  }

  return null;
}

function str(v: unknown): string {
  return typeof v === "string" ? v : "";
}

function LocalizedSectionForm({
  sectionId,
  type,
  activeLocale,
  editorLocales,
  defaultLocale,
  statuses,
  onLocaleChange,
  missingHint,
  children,
}: {
  sectionId: string;
  type: StorefrontSectionType;
  activeLocale: string;
  editorLocales: string[];
  defaultLocale: string;
  statuses: { locale: string; complete: boolean; missingFields: string[] }[];
  onLocaleChange: (locale: string) => void;
  missingHint: string[];
  children: ReactNode;
}) {
  return (
    <div className="mt-3 space-y-3 rounded-lg border border-border/60 bg-muted/20 p-3">
    <form action={updateStorefrontSectionContentFormAction} className="space-y-3">
      <input type="hidden" name="sectionId" value={sectionId} />
      <input type="hidden" name="sectionType" value={type} />
      <input type="hidden" name="editLocale" value={activeLocale} />
      <input type="hidden" name="defaultLocale" value={defaultLocale} />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-medium text-muted-foreground">Visual editor</p>
        {editorLocales.length > 1 ? (
          <div className="flex flex-wrap gap-1">
            {editorLocales.map((loc) => {
              const st = statuses.find((s) => s.locale === loc);
              const missing = st && !st.complete;
              return (
                <button
                  key={loc}
                  type="button"
                  onClick={() => onLocaleChange(loc)}
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    activeLocale === loc
                      ? "bg-primary text-primary-foreground"
                      : missing
                        ? "bg-amber-500/15 text-amber-900 dark:text-amber-100"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {loc.toUpperCase()}
                  {missing ? " · missing" : ""}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>
      {missingHint.length > 0 ? (
        <p className="text-xs text-amber-800 dark:text-amber-200">
          Missing translation: {missingHint.join(", ")}
        </p>
      ) : null}
      {children}
      <Button type="submit" size="sm" className="rounded-full">
        Save section ({activeLocale.toUpperCase()})
      </Button>
    </form>
    {editorLocales.length > 1 && activeLocale === defaultLocale ? (
      <form action={copyStorefrontSectionLocalesFormAction}>
        <input type="hidden" name="sectionId" value={sectionId} />
        <input type="hidden" name="sourceLocale" value={defaultLocale} />
        <Button type="submit" size="sm" variant="outline" className="rounded-full">
          Copy {defaultLocale.toUpperCase()} → other locales
        </Button>
      </form>
    ) : null}
    </div>
  );
}

function Field({
  id,
  label,
  defaultValue,
  mono,
}: {
  id: string;
  label: string;
  defaultValue: string;
  mono?: boolean;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} name={id} defaultValue={defaultValue} className={mono ? "rounded-xl font-mono text-sm" : "rounded-xl"} />
    </div>
  );
}
