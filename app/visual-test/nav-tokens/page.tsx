import { StorefrontNavigation } from "@/components/storefront/StorefrontNavigation";
import { VISUAL_TEST_NAV_LINKS } from "@/lib/storefront/visual-test-fixtures";

/** Isolated storefront nav for token / layout snapshots. */
export default function VisualTestNavTokensPage() {
  return (
    <div className="space-y-8" data-testid="visual-nav-tokens">
      <div>
        <h1 className="text-lg font-semibold">Navigation tokens</h1>
        <p className="text-sm text-muted-foreground">Primary header with icons, dropdown, and accent gradient.</p>
      </div>
      <div className="overflow-hidden rounded-2xl border border-border/80 shadow-sm">
        <StorefrontNavigation
          storeSlug="visual-demo"
          publicName="Harbor Bakery"
          tagline="Sourdough & seasonal pastries"
          logoUrl={null}
          accentColor="#c45c26"
          links={VISUAL_TEST_NAV_LINKS}
        />
      </div>
      <div className="overflow-hidden rounded-2xl border border-border/80 shadow-sm">
        <StorefrontNavigation
          storeSlug="visual-demo-alt"
          publicName="Night Market"
          tagline="Late-night catering"
          logoUrl={null}
          accentColor="#5b4bb7"
          links={VISUAL_TEST_NAV_LINKS.filter((l) => l.id !== "catering")}
        />
      </div>
    </div>
  );
}
