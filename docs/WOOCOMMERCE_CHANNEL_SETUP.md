# WooCommerce channel setup

1. Open **Sales channels → WooCommerce** (`/dashboard/integrations/woocommerce`).
2. Store base URL, consumer key/secret, optional webhook signing secret — all encrypted; never echoed after save.
3. Register WooCommerce webhooks to `{SITE_URL}/api/webhooks/woocommerce?cid=<connectionId>`.
4. Run **Test connection** from API routes when available; watch **Webhook activity** for signature failures.
5. Use **Product mapping** for unmatched SKUs before high-volume order ingest.

Official WooCommerce trademark belongs to Automattic; KitchenOS is an independent integration layer.
