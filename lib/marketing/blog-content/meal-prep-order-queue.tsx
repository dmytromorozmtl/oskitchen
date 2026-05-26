import Link from 'next/link';

export function MealPrepOrderQueueContent() {
  return (
    <>
      <p>
        Meal prep kitchens lose margin in two predictable places: mis-picks during packing and orders that
        never make it to the production board in time for the weekly cutoff. A single order queue — fed by
        storefront preorders, POS walk-ins, and catering quotes — is the simplest fix. This guide walks
        through how to design that queue without buying hardware you do not need.
      </p>

      <h2>Why multiple queues create errors</h2>
      <ul>
        <li>Spreadsheet preorders that never sync to the line</li>
        <li>Instagram DMs counted separately from the website</li>
        <li>Substitutions logged on paper but not on the pick list</li>
        <li>Allergen notes trapped in email threads</li>
      </ul>
      <p>
        Each extra channel adds a reconciliation step. At 40–120 orders per week, that reconciliation is
        often an hour of manager time — and one missed allergy note is worse than one missed tray.
      </p>

      <h2>What a unified queue must show</h2>
      <p>Operators need one screen (or printout) with:</p>
      <ol>
        <li>Customer name and pickup window</li>
        <li>Line items with modifiers and allergens highlighted</li>
        <li>Payment status (paid vs collect on pickup)</li>
        <li>Production status (queued → in prep → packed → handed off)</li>
        <li>Source channel (storefront, POS, catering) for troubleshooting</li>
      </ol>
      <p>
        KitchenOS ties{' '}
        <Link href="/solutions/meal-prep">meal prep workflows</Link> to production batches when recipes
        exist — so the queue is not a passive list; it drives what gets cooked on which day.
      </p>

      <h2>Cutoff discipline</h2>
      <p>
        Weekly meal prep lives or dies on cutoff time. Publish cutoff in the storefront, enforce it in
        software (no new orders after Tuesday 8pm, for example), and run a single “locked” export for
        production. Operators who extend cutoff ad hoc should do it in the system so the line sees the
        change — not in a group chat.
      </p>

      <h2>Packing workflow</h2>
      <p>A practical packing sequence:</p>
      <ul>
        <li>Sort by route or pickup slot, not alphabetically by customer</li>
        <li>Scan or tap “packed” per order — not bulk-complete</li>
        <li>Flag exceptions (missing item, substitution) before the customer arrives</li>
      </ul>
      <p>
        Color-only status indicators fail WCAG and fail wet hands on a line. Use text labels plus motion
        (pulse) for overdue tickets on a{' '}
        <Link href="/product/kitchen-display">kitchen display</Link>.
      </p>

      <h2>Metrics to track from week one</h2>
      <ul>
        <li>Orders per cutoff cycle</li>
        <li>Pick errors per 100 orders (self-reported + refunds)</li>
        <li>Minutes from cutoff lock to production list published</li>
        <li>On-time pickup rate</li>
      </ul>
      <p>
        These four numbers become your first case study when you document a pilot with permission — even
        anonymized.
      </p>

      <h2>Software vs paper</h2>
      <p>
        Paper works below ~25 orders per week. Above that, the cost of errors exceeds $99/month software.
        Start with one queue, one production board, one storefront — add channels only after the first
        cycle runs clean.
      </p>

      <p>
        <Link href="/signup">Start a KitchenOS trial</Link>, use the{' '}
        <Link href="/roi-calculator">ROI calculator</Link> to estimate labor savings, or read{' '}
        <Link href="/blog/how-to-start-meal-prep-business">how to start a meal prep business</Link> for the
        full stack.
      </p>
    </>
  );
}
