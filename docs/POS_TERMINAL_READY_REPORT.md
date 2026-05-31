# POS Terminal — Ready Report

**Date:** 2026-05-14  
**Scope:** OS Kitchen POS / front-of-house commerce layer (Phase 1–27 delivery against MVP, honest about gaps).

## What was added

- **Prisma** POS entities: terminals, registers, shifts, carts, transactions, payments, receipts, held orders, audit events, inventory impact events; `Product.posVisible` + `Product.barcode`; `Order` ↔ `POSTransaction` relation; migration under `prisma/migrations/`.
- **Order pipeline**: `POS_SALE` order type, `creationSource: POS`, payment rules including `COMPED`, checkout via `createOrderViaCenter`.
- **Services** (`services/pos/*`): checkout, session/bootstrap, register/shift, cart (hold primitives), payment safety helpers, receipt text, kitchen routing, inventory impact placeholders, CRM metrics hook, analytics log, barrel `pos-service.ts`.
- **Library** (`lib/pos/*`): types, status labels, payment alias map, register/shift summaries, permission key constants, receipt footer default, routing rules, hardware matrix, offline copy.
- **Dashboard** `/dashboard/pos/*`: overview, terminal UI, registers, shifts, transactions, receipts, reports (gated), settings + hardware subpage.
- **Actions** `actions/pos.ts`: zod checkout + void form wrappers for Next forms.
- **Nav & IA**: Sidebar **Orders & Sales** order: POS Terminal → Preorders (menus) → Order Hub → Orders → Storefront → Sales Channels; staff allow-list includes `/dashboard/pos` and `/dashboard/menus`.
- **Order Hub**: `pos` tab + POS channel label on internal rows.
- **Billing**: Feature keys `pos_terminal`, `pos_registers`, `pos_receipts`, `pos_shifts`, `pos_reports`, `pos_multi_location`, `pos_hardware_settings`.
- **Module registry**: `pos_terminal` entry with `/dashboard/pos` prefixes + PRO plan metadata.
- **Business modes**: `pos_terminal` added to `recommendedModuleKeys` across major food modes.
- **Permissions**: `pos_access`, `pos_comp` with role mapping; comped checkout requires `pos_comp`.
- **Platform**: `/platform/pos` sanitized 7-day activity table.
- **Settings**: `/dashboard/settings/pos` + section registry entry.
- **Marketing**: `/product/pos-terminal`, hero copy, features card, header link.
- **Documentation**: `docs/POS_*.md` set + this report.

## Architecture

See `docs/POS_ARCHITECTURE.md`. Single spine: **POS checkout = real Order + POS financial artifacts**.

## Data model

See `docs/POS_DATA_MODEL.md`.

## Terminal UI

See `docs/POS_TERMINAL_UI.md`. Touch-first grid + cart; offline indicator; barcode Enter-to-add.

## Order Hub integration

See `docs/POS_ORDER_HUB_INTEGRATION.md`.

## Kitchen routing

See `docs/POS_KITCHEN_ROUTING.md`.

## Inventory impact

See `docs/POS_INVENTORY_IMPACT.md`.

## CRM impact

- `createOrderViaCenter` still upserts when email present.
- `syncPosOrderToCrm` recomputes metrics when customer email resolvable from `customerId`.

## Analytics impact

- `logPosCheckoutAnalytics` emits internal analytics event tagged `sourceType: POS` (see `pos-analytics-service.ts`).

## Register / shift system

See `docs/POS_REGISTER_SHIFTS.md`.

## Receipt system

See `docs/POS_RECEIPTS.md`.

## Permissions & billing

See `docs/POS_PERMISSIONS.md` and `docs/POS_BILLING_ENTITLEMENTS.md`.

## Platform admin

- `/platform/pos` operational lens (no PII beyond workspace email/company already in admin tooling).

## Honest limitations

- No native Stripe Terminal, ESC/POS, or drawer kick — placeholders only.
- No offline checkout queue; server required for sale finalization.
- Terminal lacks full category rail, customer CRM side panel, hold/recall UI, open-price line wizard, and modifier UX — cart supports data model via order lines + `modifiersJson` path in shared order APIs but UI not exhaustive.
- Staff role model is still coarse (`UserRole` + mapped `AppRole`); fine POS RBAC for packers/drivers awaits richer workspace staff auth.
- Onboarding wizard question (“walk-in sales?”) not yet auto-inserted — business modes only recommend module.

## Next roadmap (suggested)

1. Customer search panel + PII-safe CRM cards.
2. Hold / recall / void reasons wired to `POSCart` + `POSHeldOrder`.
3. Receipt modal with print + email gating on provider config.
4. Variance approval thresholds + manager notifications.
5. SKU on `Product` if not present + tax class surfacing in POS grid.
6. Deeper analytics joins (top SKUs, staff leaderboard) once reporting service consolidates POS + channel revenue.

## Verification

- Run `npm run typecheck` and `npm run build` locally after `npm install` (ensure `zod` + `flatted` resolve — both declared in `package.json`).
- `npm run lint` / `npm test` depend on intact `node_modules` (ESLint uses `flat-cache` → `flatted`).

---

**Conclusion:** OS Kitchen now has a **connected POS lane** that creates real orders and operational side effects while staying truthful about hardware and payments. Further releases should deepen cashier UX, RBAC, and offline strategy without revisiting the core order spine.
