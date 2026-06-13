import Link from 'next/link';

/** SEO: meal prep subscription management */
export function MealPrepSubscriptionManagementContent() {
  return (
    <>
      <p>
        Meal prep subscription management combines recurring billing, weekly menu choice, production
        forecasting, and fulfillment windows. Most operators lose margin when subscriptions live in one
        tool, orders in another, and packing lists in a spreadsheet — not because the food is wrong.
      </p>
      <h2>Core subscription workflows</h2>
      <ul>
        <li>
          <strong>Billing cadence:</strong> Monthly or weekly charge with pause/skip rules customers
          can self-serve before cutoff.
        </li>
        <li>
          <strong>Menu cycles:</strong> Publish next week&apos;s options; lock selections N hours before
          production so purchasing can batch ingredients.
        </li>
        <li>
          <strong>Production batching:</strong> Aggregate subscriber picks into tray counts by protein,
          size, and dietary tag — one queue for packers.
        </li>
        <li>
          <strong>Pickup and delivery slots:</strong> Cap slots by cooler capacity; show honest ETAs
          without over-promising same-day if you batch cook twice weekly.
        </li>
      </ul>
      <h2>Software signals to verify</h2>
      <p>
        Demand a demo where a customer skips a week, upgrades portion size mid-cycle, and the kitchen
        queue updates without re-keying. Subscription churn often traces to cutoff confusion — make
        policy visible in the storefront and confirmation emails. Typical meal prep operators target
        60%+ week-two reorder before scaling ad spend.
      </p>
      <p>
        <Link href="/meal-prep-software" className="text-primary underline">
          Meal prep software
        </Link>{' '}
        ·{' '}
        <Link href="/blog/how-to-start-meal-prep-business" className="text-primary underline">
          Start a meal prep business
        </Link>
      </p>
    </>
  );
}
