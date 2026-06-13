import Link from 'next/link';

/** SEO: woocommerce kds restaurant integration */
export function WooCommerceKdsRestaurantIntegrationContent() {
  return (
    <>
      <p>
        WooCommerce KDS restaurant integration connects your WordPress storefront to kitchen production
        — critical when pickup and delivery orders must hit the same line as walk-in POS tickets.
        Without mapping discipline, WooCommerce line items become verbal shout tickets at expo.
      </p>
      <h2>Setup priorities</h2>
      <ul>
        <li>
          <strong>Secure webhooks:</strong> Validate signatures on order status changes; reject
          unsigned payloads.
        </li>
        <li>
          <strong>SKU ↔ kitchen item map:</strong> Variable products (size, protein swap) need explicit
          modifier rules — defaults cause wrong trays.
        </li>
        <li>
          <strong>Order types:</strong> Distinguish pickup, local delivery, and ship-to; only
          production-relevant types should bump on KDS.
        </li>
        <li>
          <strong>Refund and void sync:</strong> Cancelled WooCommerce orders should clear or mark
          tickets — verify behavior in your pilot.
        </li>
      </ul>
      <h2>Honest expectations</h2>
      <p>
        WooCommerce plugins vary in depth; confirm whether yours supports multi-location routing and
        retry queues. OS Kitchen WooCommerce connectors are BETA — run LIVE smoke tests (webhook → HMAC
        → KDS ticket) in staging before promoting menu changes to production traffic.
      </p>
      <p>
        <Link href="/integrations/woocommerce" className="text-primary underline">
          WooCommerce integration
        </Link>{' '}
        ·{' '}
        <Link href="/blog/shopify-orders-to-kds" className="text-primary underline">
          Shopify orders to KDS
        </Link>
      </p>
    </>
  );
}
