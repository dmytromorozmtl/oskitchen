import { Hero, PublicShell, FeatureGrid, Disclaimer } from "@/components/marketing/public-page";

const copy: Record<string, { title: string; currency: string; note: string }> = {
  canada: { title: "KitchenOS for Canadian food businesses", currency: "CAD-ready settings", note: "Tax and food labeling rules must be verified by the business." },
  "united-states": { title: "KitchenOS for US food businesses", currency: "USD-ready settings", note: "State/local tax and food labeling requirements must be verified by the business." },
  "united-kingdom": { title: "KitchenOS for UK food businesses", currency: "GBP-ready settings", note: "VAT, allergen, and labeling requirements must be verified by the business." },
  europe: { title: "KitchenOS for European food businesses", currency: "EUR-ready settings", note: "Country-specific privacy, tax, and labeling requirements require legal review." },
};

export function MarketPage({ market }: { market: keyof typeof copy }) {
  const page = copy[market];
  return (
    <PublicShell>
      <Hero eyebrow="Market readiness" title={page.title} description="KitchenOS supports configurable currency, locale, units, menus, orders, production, packing, and implementation workflows for food businesses." cta="Apply for beta" ctaHref="/beta" secondary="Book demo" secondaryHref="/book-demo" />
      <FeatureGrid items={[
        { title: "Use cases", description: "Meal prep, catering, bakeries, weekly preorders, and multi-brand kitchens." },
        { title: "Settings", description: page.currency },
        { title: "Integrations", description: "WooCommerce/Shopify relevance depends on local store setup and credentials." },
      ]} />
      <Disclaimer>{page.note} KitchenOS does not claim regulatory compliance for this market.</Disclaimer>
    </PublicShell>
  );
}
