import Link from 'next/link';

export function GhostKitchenSetupGuideContent() {
  return (
    <>
      <p>
        Ghost kitchens and virtual brands share production lines but sell different menus on delivery apps.
        Success depends on brand architecture, prep capacity, and honest aggregator economics — not only
        menu photography.
      </p>
      <h2>1. Design brands around production, not logos</h2>
      <p>
        Each virtual brand should reuse the same prep stations where possible. Map SKUs to shared
        ingredients before you launch the fifth concept on Uber Eats.
      </p>
      <h2>2. Consolidate orders into one hub</h2>
      <p>
        Operators lose margin when each tablet becomes its own ticket stream. Use an order hub with product
        mapping so DoorDash, Grubhub, and owned storefront orders hit one production board.
      </p>
      <h2>3. Plan packaging and routing early</h2>
      <p>
        Delivery-only brands live or die on handoff accuracy. Invest in packing verification and zone-based
        routing before scaling ad spend.
      </p>
      <p>
        <Link href="/solutions/ghost-kitchens" className="text-primary underline">
          Ghost kitchen solutions
        </Link>{' '}
        ·{' '}
        <Link href="/signup" className="text-primary underline">
          Start free trial
        </Link>
      </p>
    </>
  );
}
