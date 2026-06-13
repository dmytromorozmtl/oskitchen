import Link from 'next/link';

/** SEO: shopify orders to kds */
export function ShopifyOrdersToKdsContent() {
  return (
    <>
      <p>
        Routing Shopify orders to a KDS (kitchen display system) sounds simple until modifiers,
        fulfillment types, and third-party delivery labels enter the ticket. The honest goal: one
        production board for ecommerce pickup, catering, and in-store POS — without manual re-entry.
      </p>
      <h2>Integration checklist</h2>
      <ul>
        <li>
          <strong>Webhook verification:</strong> HMAC-signed order/create events with idempotent
          handling — replays should not duplicate tickets.
        </li>
        <li>
          <strong>Product mapping:</strong> Shopify variants map to kitchen prep profiles (allergens,
          station, packaging).
        </li>
        <li>
          <strong>Timing rules:</strong> Scheduled orders fire to KDS at production lead time, not at
          checkout instant.
        </li>
        <li>
          <strong>Health monitoring:</strong> Failed syncs visible to managers — not buried in Shopify
          admin logs.
        </li>
      </ul>
      <h2>When Shopify→KDS is worth it</h2>
      <p>
        Brands selling meal kits, heat-and-eat, or hybrid retail + kitchen production benefit most.
        Pure retail with no production line rarely needs KDS. Verify your connector&apos;s LIVE status
        and run a test order with modifiers before launch week — typical pilots catch mapping gaps in
        the first ten tickets.
      </p>
      <p>
        <Link href="/integrations/shopify" className="text-primary underline">
          Shopify integration
        </Link>{' '}
        ·{' '}
        <Link href="/blog/restaurant-pos-integration-health" className="text-primary underline">
          POS integration health
        </Link>
      </p>
    </>
  );
}
