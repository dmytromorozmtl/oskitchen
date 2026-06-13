import Link from 'next/link';

/** P3-68: Founder story blog — honest pre-customer origin narrative */
export function WhyWeBuiltOsKitchenContent() {
  return (
    <>
      <p className="text-sm text-muted-foreground border-l-4 border-primary/40 pl-4 italic">
        Honesty rule: OS Kitchen has <strong>0 signed founding customers</strong> as of June 2026.
        This post is founder voice — not a customer testimonial. Integrations carry honest{' '}
        <strong>BETA</strong> labels; we recruit design partners instead of fabricating logos.
      </p>

      <h2>The problem we saw</h2>
      <p>
        Multi-channel food operators — commissaries, ghost kitchens, meal-prep brands — run
        production and fulfillment across storefronts, spreadsheets, and channel tools with no
        single order-to-kitchen truth. Integration status is opaque; AI vendors sell dashboards
        without operational grounding. We watched operators copy orders between Shopify, WhatsApp,
        and paper tickets daily — error cost rising before revenue justifies Toast-scale hardware.
      </p>
      <p>
        The pain is not missing a POS terminal. It is missing an{' '}
        <strong>operating system</strong> for production: orders → kitchen (KDS) → packing → routes,
        with an owner command center that shows what is actually working today — including what is
        still BETA.
      </p>

      <h2>Why we built before the first customer</h2>
      <p>
        OS Kitchen was built as depth-first product work, not a pitch deck with borrowed logos. Before
        any signed LOI, we shipped scaffolding across the workflow operators actually run:
      </p>
      <ul>
        <li>
          <strong>Today Command Center</strong> — daily briefing, alerts, and jump links at{' '}
          <code>/dashboard/today</code>
        </li>
        <li>
          <strong>Order hub → KDS → packing</strong> — one codebase path from channel intake to expo
          handoff
        </li>
        <li>
          <strong>Seven AI modules</strong> — deterministic briefing, costing, purchasing suggestions,
          menu structure, simulation, camera-ready stations, benchmarks — each labeled for maturity
        </li>
        <li>
          <strong>Integration Health UI</strong> — SKIPPED and BETA states visible in product instead
          of hidden behind sales slides
        </li>
        <li>
          <strong>Forbidden-claims CI</strong> — sales limitation sheet and honest compare pages so
          we cannot accidentally claim LIVE integrations we have not proven
        </li>
      </ul>
      <p>
        This is build-first, market-unproven. We would rather show an operator exactly what is BETA
        than pretend we are an incumbent on day one.
      </p>

      <h2>Founder quote</h2>
      <blockquote className="border-l-4 border-primary/60 pl-4 italic text-muted-foreground">
        &ldquo;I&apos;d rather show an operator exactly what&apos;s BETA than pretend we&apos;re Toast
        on day one. OS Kitchen is the kitchen OS I wished existed when commissary operators were
        duct-taping Shopify to spreadsheets — we&apos;re recruiting the first design partners to
        prove it together.&rdquo;
        <footer className="mt-3 not-italic text-sm">
          — Founder, OS Kitchen · June 2026 · <strong>not a customer testimonial</strong>
        </footer>
      </blockquote>

      <h2>What we are not claiming</h2>
      <ul>
        <li>No &ldquo;our customers love…&rdquo; — we have zero published case studies</li>
        <li>No stock photos labeled as customer kitchens — product screenshots only</li>
        <li>No guaranteed ROI — illustrative calculators carry footnotes</li>
        <li>No implied LIVE third-party integrations without verified smoke artifacts</li>
      </ul>

      <h2>Design partner program open</h2>
      <p>
        We are recruiting founding design partners in commissary, ghost kitchen, and meal-prep
        segments — operators who want honest BETA labels and weekly product feedback instead of
        integration fiction. The program is open; the first countersigned LOI will upgrade this
        narrative from founder story to named design partner.
      </p>
      <p>
        <Link href="/book-demo" className="text-primary underline">
          Book a demo
        </Link>{' '}
        ·{' '}
        <Link href="/ghost-kitchen-software" className="text-primary underline">
          Ghost kitchen software
        </Link>{' '}
        ·{' '}
        <Link href="/meal-prep-software" className="text-primary underline">
          Meal prep software
        </Link>{' '}
        ·{' '}
        <Link href="/blog/ghost-kitchen-software-2026" className="text-primary underline">
          Ghost kitchen software guide
        </Link>
      </p>
    </>
  );
}
