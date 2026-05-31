import { Hero, PublicShell, FeatureGrid, Disclaimer } from "@/components/marketing/public-page";

const copy: Record<string, { title: string; currency: string; note: string }> = {
  canada: { title: "OS Kitchen for Canadian food businesses", currency: "CAD-ready settings", note: "Tax and food labeling rules must be verified by the business." },
  "united-states": { title: "OS Kitchen for US food businesses", currency: "USD-ready settings", note: "State/local tax and food labeling requirements must be verified by the business." },
  "united-kingdom": { title: "OS Kitchen for UK food businesses", currency: "GBP-ready settings", note: "VAT, allergen, and labeling requirements must be verified by the business." },
  europe: { title: "OS Kitchen for European food businesses", currency: "EUR-ready settings", note: "Country-specific privacy, tax, and labeling requirements require legal review." },
};

export function MarketPage({ market }: { market: keyof typeof copy }) {
  const page = copy[market];
  return (
    <PublicShell>
      <Hero eyebrow="Market readiness" title={page.title} description="OS Kitchen supports configurable currency, locale, units, menus, orders, production, packing, and implementation workflows for food businesses." cta="Apply for beta" ctaHref="/beta" secondary="Book demo" secondaryHref="/book-demo" />
      <FeatureGrid items={[
        { title: "Use cases", description: "Meal prep, catering, bakeries, weekly preorders, and multi-brand kitchens." },
        { title: "Settings", description: page.currency },
        { title: "Integrations", description: "WooCommerce/Shopify relevance depends on local store setup and credentials." },
      ]} />
      <Disclaimer>{page.note} OS Kitchen does not claim regulatory compliance for this market.</Disclaimer>
    </PublicShell>
  );
}
