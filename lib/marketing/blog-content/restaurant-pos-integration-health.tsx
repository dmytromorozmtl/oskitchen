import Link from 'next/link';

/** SEO: restaurant pos integration health */
export function RestaurantPosIntegrationHealthContent() {
  return (
    <>
      <p>
        Restaurant POS integration health is the difference between &quot;orders flow&quot; and
        &quot;we did not know DoorDash stopped syncing until Saturday night.&quot; Modern kitchens
        depend on webhooks, menu maps, and credential rotation — failures are operational, not IT
        trivia.
      </p>
      <h2>What breaks silently</h2>
      <ul>
        <li>
          <strong>Expired OAuth tokens:</strong> Marketplace connections look green in settings while
          webhooks stop firing.
        </li>
        <li>
          <strong>Menu drift:</strong> POS item IDs no longer match aggregator SKUs — tickets arrive
          with missing modifiers.
        </li>
        <li>
          <strong>Rate limits and retries:</strong> Burst lunch traffic drops events unless your hub
          queues and surfaces retry status.
        </li>
        <li>
          <strong>Wrong-store routing:</strong> Multi-unit operators push orders to the wrong kitchen
          when location mapping is stale.
        </li>
      </ul>
      <h2>Integration Health Center pattern</h2>
      <p>
        Operators need a single pane: last successful webhook, failure code, suggested fix, and test
        ping — not a generic &quot;connected&quot; badge. See exactly why your DoorDash integration
        failed before you re-open the store. OS Kitchen Integration Health shows PASS / SKIPPED / FAIL
        per channel; verify LIVE status for your stack during pilot — BETA labels apply where
        certification is still in progress.
      </p>
      <p>
        <Link href="/restaurant-integration-health" className="text-primary underline">
          Restaurant integration health
        </Link>{' '}
        ·{' '}
        <Link href="/integration-health-center" className="text-primary underline">
          Integration Health Center
        </Link>{' '}
        ·{' '}
        <Link href="/blog/how-to-choose-restaurant-pos-2026" className="text-primary underline">
          Choose restaurant POS 2026
        </Link>
      </p>
    </>
  );
}
