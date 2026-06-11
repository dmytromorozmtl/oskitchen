import Link from 'next/link';

export function CommissaryKitchenSoftwareGuideContent() {
  return (
    <>
      <p>
        Shared commissary kitchens run batch production for multiple tenant brands — each with
        different menus, cutoffs, and packing rules. Spreadsheets break when tenant count grows past
        three. This guide explains how commissary kitchen software routes orders, schedules batch
        waves, and optionally supplies B2B catalog checkout — with honest BETA labels, not ERP
        overclaims.
      </p>

      <h2>What commissary software must do</h2>
      <ul>
        <li>Route tenant orders to the correct production lane</li>
        <li>Schedule batch waves with yield-aware quantities</li>
        <li>Verify packing before handoff to tenant pickup or delivery</li>
        <li>Optionally expose B2B catalog to tenant kitchens (BETA marketplace)</li>
        <li>Audit who produced what, when — without fake automation badges</li>
      </ul>

      <h2>Multi-tenant order hub</h2>
      <p>
        Each tenant may sell through storefront, POS, or catering quotes. A commissary hub merges
        confirmed demand into one prioritized queue — filtered by tenant, allergen flags, and pickup
        window. Expo sees one board; tenants see only their orders.
      </p>

      <h2>Batch production calendar</h2>
      <p>
        Commissaries cook in waves — proteins first, cold prep second, assembly last. Software should
        translate order totals into batch sizes when recipes exist. Without recipes, start with SKU
        counts and refine weekly. Typical operators save 4–8 labor hours per week once waves replace
        sticky-note scheduling.
      </p>

      <h2>B2B supply to tenants (BETA)</h2>
      <p>
        Some commissaries also sell ingredients or par-baked goods to tenant kitchens. A B2B
        marketplace module lets tenants browse catalog, build carts, and create POs — verify vendor
        seeding and maturity labels before external claims. OS Kitchen marketplace is{' '}
        <strong>BETA scaffold</strong> — not a live national vendor network.
      </p>

      <h2>Commissary vs ghost kitchen software</h2>
      <p>
        Ghost kitchen software optimizes multi-brand delivery from one operator. Commissary software
        optimizes <em>tenant isolation</em> and shared production capacity. Many facilities do both —
        pick tooling that supports tenant CRM and batch scheduling, not only aggregator tablets.
      </p>

      <h2>Evaluation checklist</h2>
      <ol>
        <li>Can you onboard a tenant in under one day without custom dev?</li>
        <li>Does production reflect confirmed orders, not periodic counts?</li>
        <li>Are integration health labels honest (PASS / SKIPPED / FAILED)?</li>
        <li>Can finance export PO and invoice data without fake GL depth claims?</li>
      </ol>

      <h2>When spreadsheets still work</h2>
      <p>
        Under ~50 weekly units and one tenant, spreadsheets may suffice. Past two tenants or three
        production lanes, software pays for itself in mis-pick reduction alone — before marketplace
        or invoice AI modules.
      </p>

      <p>
        <Link href="/commissary-software">See commissary kitchen software</Link>,{' '}
        <Link href="/book-demo">book a commissary fit call</Link>, or read the{' '}
        <Link href="/blog/ghost-kitchen-setup-complete-guide">ghost kitchen setup guide</Link> for
        multi-brand overlap.
      </p>
    </>
  );
}
