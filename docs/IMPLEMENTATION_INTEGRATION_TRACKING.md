# Integration tracking

`app/dashboard/implementation/[projectId]/integrations/page.tsx`

For each entry in `IMPLEMENTATION_INTEGRATIONS`:

- **Shopify** (`SHOPIFY`)
- **WooCommerce** (`WOOCOMMERCE`)
- **Uber Eats** (placeholder)
- **Uber Direct** (placeholder)
- **OS Kitchen Storefront** (`storefront_native`)
- **Webhooks**
- **Email / notifications** (Resend-backed — configured under Notifications; no `IntegrationConnection` row)

The page reads the real `IntegrationConnection` rows for the
workspace and maps them by provider. The badge reflects the actual
`IntegrationStatus` (`CONNECTED`, `NEEDS_AUTH`, `DISABLED`, `ERROR`).
Placeholders (Uber Eats, Uber Direct) are surfaced honestly
with the label *"Placeholder — not yet wired"*. Email shows **Not started**
until you configure the provider in Notifications settings (no fake connection row).

The readiness engine consumes the same data and reports:

- **PASS** — all connections are healthy.
- **WARN** — at least one needs auth, none in error.
- **FAIL** — any connection in `ERROR` status.

## Safety

The Implementation Center never persists credentials or fakes a
connection. Setup happens in `/dashboard/integrations`; this page only
mirrors and links.
