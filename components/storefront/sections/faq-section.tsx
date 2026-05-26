import { faqSectionSchema } from "@/lib/storefront/sections";
import { parseSectionContentForLocale } from "@/lib/storefront/sections";

export function FAQSection({
  contentJson,
  locale,
  defaultLocale,
}: {
  contentJson: unknown;
  locale: string;
  defaultLocale: string;
}) {
  const c = parseSectionContentForLocale(faqSectionSchema, contentJson, locale, defaultLocale);
  if (!c?.items?.length) return null;

  return (
    <section className="py-6">
      <h2 className="text-2xl font-semibold tracking-tight">FAQ</h2>
      <dl className="mt-4 space-y-3">
        {c.items.map((item, i) => (
          <div key={i} className="sf-card rounded-xl px-4 py-4 dark:bg-gray-900/70">
            <dt className="font-medium">{item.q}</dt>
            <dd className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{item.a}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
