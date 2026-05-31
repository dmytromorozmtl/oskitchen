# Partner architecture

## Goals

Deliver a **tenant-safe Partner Operating System**: one dashboard for agencies, SIs, resellers, and franchise/regional operators to monitor many client workspaces without weakening OS Kitchen multi-tenancy.

## Layers

1. **Data (Prisma)**  
   - `PartnerAccount` — organization shell (type, tier, branding fields, billing/onboarding owners).  
   - `PartnerMember` — invited operators; `userId` links to `UserProfile` when accepted.  
   - `PartnerClient` — managed client row: optional `workspaceId`, implementation stage, health, MRR, tags, notes.  
   - `PartnerRevenue` — advisory revenue / commission rows (not payout automation).  
   - `PartnerManagedTicket` — partner-scoped support queue items.

2. **Access control (`lib/partner`)**  
   - `canAccessPartnerModule` — who may open `/dashboard/partner`.  
   - `getAccessiblePartnerAccountIds` — **spine** for all partner queries; superadmin and selected platform roles receive all account IDs; others receive owned + membership accounts.  
   - `canProvisionPartnerOrganizations` — who may create empty partner shells (founder bypass, kitchen OWNER profile, selected platform roles).

3. **Services (`services/partner`)**  
   - `partner-service` — `getPartnerCommandCenterSnapshot` aggregates KPIs, clients, pipeline distribution, revenue mix; degrades if migrations missing.  
   - Satellite services: client list, revenue aggregates, open tickets, implementation ordering, health heuristics, training proxy, billing summaries (as applicable).

4. **UI**  
   - `app/dashboard/partner/layout.tsx` — access gate.  
   - `app/dashboard/partner/page.tsx` — loads snapshot + provision flag.  
   - `components/partner/partner-operations-center.tsx` — KPIs, charts, pipeline board, org cards, client table, detail drawer.

5. **Actions**  
   - `actions/partner-operations.ts` — `createPartnerOrganization` (permission-checked, slug collision safe).

## Integration seams (GTM + ops)

- **Beta applications / Growth CRM**: partner accounts should reference leads and opportunities via future foreign keys or soft links (not yet mandatory).  
- **Billing**: treat partner revenue as **attribution** until finance signs off on payouts.  
- **Support**: managed tickets should map to internal ticket IDs when the customer support product exposes stable keys.

## Non-goals (current release)

- Automated reseller payouts.  
- Cross-tenant impersonation without audited session.  
- Full white-label DNS + mail send pipeline.
