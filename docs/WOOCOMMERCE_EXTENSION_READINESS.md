# WooCommerce extension readiness

Position KitchenOS as a **production hub** reading Woo REST + webhooks.

## Connection method

- REST keys with **Read/Write** limited to orders + products endpoints actually used.
- Webhook topics: `order.created`, `order.updated`, `product.updated`.

## WordPress admin UX

- Generate keys via WooCommerce → Settings → Advanced → REST API.
- Document firewall allow-list for KitchenOS ingress IPs (infra-specific).

## Security

- Store keys encrypted; rotate quarterly.
- Validate HMAC signatures on inbound hooks when Woo sends signing secret.

## Listing checklist

- [ ] Plugin slug + stable tag.
- [ ] Freemium connector vs paid orchestration explained.
- [ ] Screenshots + changelog.
