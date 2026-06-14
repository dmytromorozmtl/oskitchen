import { FAQSchema } from "@/components/seo/schema-org";
import { getKbFaqForLocale } from "@/lib/kb/kb-faq-content";
import type { KbLocale } from "@/lib/kb/knowledge-base-content";

export function KbFaqSection({ locale }: { locale: KbLocale }) {
  const faqs = getKbFaqForLocale(locale);

  return (
    <section data-testid="kb-faq-section" className="space-y-4 border-t border-border/80 pt-8">
      <FAQSchema questions={faqs} />
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Frequently asked questions</h2>
        <p className="text-sm text-muted-foreground">
          Quick answers — full guides linked throughout the Knowledge Base.
        </p>
      </div>
      <dl className="space-y-3">
        {faqs.map((faq) => (
          <div
            key={faq.id}
            data-testid={`kb-faq-${faq.id}`}
            className="rounded-xl border border-border/80 bg-card px-4 py-3"
          >
            <dt className="font-medium">{faq.question}</dt>
            <dd className="mt-2 text-sm text-muted-foreground">{faq.answer}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
