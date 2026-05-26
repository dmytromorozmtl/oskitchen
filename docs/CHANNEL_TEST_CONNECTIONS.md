# Channel test connections

- **Service:** `services/channels/test-connection.ts` (`runChannelTestConnectionForUser`)
- **WooCommerce:** Uses `services/integrations/woocommerce` probe + updates `IntegrationConnection.status`
- **Shopify:** Uses `services/integrations/shopify` GraphQL probe
- **Extensibility:** Return structured `{ success, latencyMs, userMessage, nextAction }` for future `ChannelHealthCheck` persistence

HTTP routes under `/api/integrations/*/test` remain the browser-triggered entrypoints; the service can be reused from jobs or CLI.
