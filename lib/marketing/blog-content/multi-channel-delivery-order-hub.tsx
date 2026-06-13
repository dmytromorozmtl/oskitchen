import Link from 'next/link';

/** SEO: multi channel delivery order hub */
export function MultiChannelDeliveryOrderHubContent() {
  return (
    <>
      <p>
        A multi-channel delivery order hub consolidates marketplace tablets, owned online ordering, and
        phone-in tickets into one production queue. Ghost kitchens and high-volume delivery brands lose
        hours daily when each channel maintains its own mental model of &quot;what&apos;s cooking
        now.&quot;
      </p>
      <h2>Hub architecture that scales</h2>
      <ul>
        <li>
          <strong>Normalize tickets:</strong> Same bump/recall UX regardless of whether the order
          originated on DoorDash or your storefront.
        </li>
        <li>
          <strong>Brand and channel tags:</strong> Expo staff see packaging rules without opening
          three apps.
        </li>
        <li>
          <strong>Throttle and prioritize:</strong> Rush windows reorder by promised time, not arrival
          order of webhooks.
        </li>
        <li>
          <strong>Integration health:</strong> Per-channel status so a dead Grubhub feed does not block
          Uber Eats tickets silently.
        </li>
      </ul>
      <h2>ROI without fake promises</h2>
      <p>
        Typical operators report fewer missed items when packers work from one queue — but measure your
        own mis-pick rate during a two-week pilot. Middleware that only forwards JSON without kitchen UX
        still leaves expo juggling tablets. Compare total cost: per-tablet fees, per-brand fees, and
        labor at handoff.
      </p>
      <p>
        <Link href="/solutions/ghost-kitchens" className="text-primary underline">
          Ghost kitchen solutions
        </Link>{' '}
        ·{' '}
        <Link href="/blog/ghost-kitchen-software-2026" className="text-primary underline">
          Ghost kitchen software 2026
        </Link>
      </p>
    </>
  );
}
