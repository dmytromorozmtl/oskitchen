import { Suspense } from "react";

import { ContactFormSection } from "@/components/storefront/sections/contact-form-section";
import { contactFormSectionSchema } from "@/lib/storefront/section-schemas/builder-sections";
import { parseSectionContentForLocale } from "@/lib/storefront/sections";

export function ContactSection({
  contentJson,
  storeSlug,
  storefrontId,
  locale,
  defaultLocale,
}: {
  contentJson: unknown;
  storeSlug: string;
  storefrontId: string;
  locale: string;
  defaultLocale: string;
}) {
  const c = parseSectionContentForLocale(contactFormSectionSchema, contentJson, locale, defaultLocale);
  if (!c) return null;

  return (
    <section className="py-6">
      <Suspense fallback={<div className="h-32 animate-pulse rounded-2xl bg-muted dark:bg-gray-800" />}>
        <ContactFormSection storefrontId={storefrontId} storeSlug={storeSlug} content={c} />
      </Suspense>
    </section>
  );
}
