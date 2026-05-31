import Link from 'next/link';

export function FoodWasteProductionContent() {
  return (
    <>
      <p>
        Food waste in commercial kitchens typically runs 4–10% of food cost — sometimes higher when menus
        rotate weekly or channels multiply. Production planning connects forecasted demand to prep
        quantities so you cook what you will sell, not what you hope to sell. This guide explains the
        math, the weekly ritual, and how software supports the loop without fake automation claims.
      </p>

      <h2>Where waste hides</h2>
      <ul>
        <li>Overproduction on bestsellers “just in case”</li>
        <li>Missed handoffs between prep, line, and service</li>
        <li>Channel menus that do not map to the same SKU</li>
        <li>No feedback from unsold trays to next week’s plan</li>
        <li>Custom orders that do not decrement inventory logic</li>
      </ul>

      <h2>The production planning loop</h2>
      <p>Healthy kitchens run a closed loop:</p>
      <ol>
        <li>Forecast demand by SKU and day</li>
        <li>Convert to recipe batches with yield factors</li>
        <li>Produce and log actuals</li>
        <li>Compare sold vs produced vs wasted</li>
        <li>Adjust next cycle</li>
      </ol>

      <h2>Forecast inputs that actually work</h2>
      <p>
        <strong>Meal prep:</strong> Use preorder totals by cutoff — not foot traffic guesses.{' '}
        <strong>Restaurants:</strong> Use POS sales by daypart for the last four comparable weeks.{' '}
        <strong>Catering:</strong> Use confirmed headcount per event, not quote pipeline.
      </p>

      <h2>Yield factors matter</h2>
      <p>
        A recipe that says “10 portions” but loses 12% trim on protein needs a yield factor in the plan.
        Document trim, cook loss, and portion variance per SKU. Small errors compound across 200 trays.
      </p>

      <h2>Software vs spreadsheets</h2>
      <p>
        Spreadsheets work until channels split — storefront, POS, catering quotes, marketplace imports.
        A single production board fed by all channels prevents duplicate prep lists.{' '}
        <Link href="/solutions/meal-prep">OS Kitchen production workflows</Link> tie orders to batch prep
        when recipes exist in your workspace.
      </p>

      <h2>Weekly review ritual (30 minutes)</h2>
      <p>Every week, leadership should review:</p>
      <ul>
        <li>Top three overproduced items by dollars, not weight</li>
        <li>Items that sold out early (lost revenue)</li>
        <li>One process failure (cooling, labeling, handoff)</li>
      </ul>
      <p>Change next week’s batch size or menu — not only “try harder.”</p>

      <h2>Measure dollars, not only weight</h2>
      <p>
        Kitchen staff respond to margin impact. Track waste dollars by menu item and shift. A $40 tray of
        salmon matters more than a pound of rice — prioritize fixes accordingly.
      </p>

      <h2>When to add technology</h2>
      <p>
        If you produce more than ~80–120 units per week across multiple SKUs, software pays for itself in
        labor hours alone — before waste reduction. Start with order-connected production, not AI
        forecasts you cannot audit.
      </p>

      <p>
        <Link href="/signup">Start a OS Kitchen trial</Link> or read{' '}
        <Link href="/blog/how-to-start-meal-prep-business">how to start a meal prep business</Link> for
        the full operational stack.
      </p>
    </>
  );
}
