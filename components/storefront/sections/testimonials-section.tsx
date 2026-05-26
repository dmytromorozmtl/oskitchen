import { testimonialsSectionSchema } from "@/lib/storefront/section-schemas/builder-sections";
import { parseSectionContentForLocale } from "@/lib/storefront/sections";

export function TestimonialsSection({
  contentJson,
  locale,
  defaultLocale,
}: {
  contentJson: unknown;
  locale: string;
  defaultLocale: string;
}) {
  const c = parseSectionContentForLocale(testimonialsSectionSchema, contentJson, locale, defaultLocale);
  if (!c?.items?.length) return null;

  return (
    <section className="py-6">
      <h2 className="text-center text-2xl font-semibold tracking-tight">
        {c.heading?.trim() || "What guests say"}
      </h2>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {c.items.map((item, i) => (
          <blockquote key={i} className="sf-card rounded-2xl p-6 dark:bg-gray-900/80">
            <p className="text-sm leading-relaxed">&ldquo;{item.quote}&rdquo;</p>
            {(item.author || item.role) && (
              <footer className="mt-4 text-xs text-muted-foreground">
                {item.author ? <span className="font-medium text-foreground">{item.author}</span> : null}
                {item.role ? <span>{item.author ? " · " : ""}{item.role}</span> : null}
              </footer>
            )}
          </blockquote>
        ))}
      </div>
    </section>
  );
}
