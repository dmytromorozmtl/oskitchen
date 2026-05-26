# Permission matrix

Permission keys live in `lib/permissions.ts`.

Roles:
- Owner: all permissions.
- Admin: all except billing/developer by default.
- Manager: orders, menus, products, analytics, production, packing, inventory, customers, reports.
- Kitchen Lead: production, packing, inventory, orders.
- Kitchen Staff: production.
- Packing Staff: packing.
- Delivery Staff: order/delivery visibility.
- Accountant: analytics, reports, billing.
- Viewer: dashboard only.
- Partner Consultant: partner clients, reports, analytics.

Next step: add action-level guards to billing, integrations, API keys, export, and user-management mutations.
