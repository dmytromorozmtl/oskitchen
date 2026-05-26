# Partner ready report

**Status:** Partner Operating System v1 — dashboard, schema extensions, services, documentation.  
**Date:** 2026-05-13.

## Architecture

- Prisma-first partner domain (`PartnerAccount`, `PartnerMember`, `PartnerClient`, `PartnerRevenue`, `PartnerManagedTicket`).  
- Command center snapshot aggregates in `services/partner/partner-service.ts`.  
- UI: `PartnerOperationsCenter` with KPIs, charts, pipeline columns, organizations, client workspace management shell.

## Permissions

- Access gate on layout; data scope via `getAccessiblePartnerAccountIds`.  
- Founder / superadmin unrestricted.  
- Org creation restricted to provisioners (`canProvisionPartnerOrganizations`).

## Onboarding & implementation

- Enum-backed pipeline with ordered stages and portfolio success metric.  
- Client rows carry onboarding label, launch readiness, integration summary, activity timestamps.

## Support

- Managed ticket model + open ticket KPI.  
- Full queue UI and SLA automation deferred.

## Analytics

- Portfolio KPIs + stage distribution + revenue type mix.  
- Time-series analytics deferred to services layer with pagination.

## Revenue

- Advisory `PartnerRevenue` + client `mrrCents`; no payout automation.

## White-label

- Schema fields present; DNS/email/PDF automation not shipped.

## Franchise readiness

- `PartnerOrgType` includes franchise / regional / enterprise deployment.  
- Hierarchical workspaces and shared templates not yet modeled — use tags + notes as interim.

## Scalability

- Client table currently capped (300) in snapshot — **server-side pagination** required before thousands of rows per partner.

## Security

- Tenant isolation enforced in snapshot path.  
- **Mitigated:** legacy public partner client list/detail now require session and reuse `getAccessiblePartnerAccountIds`.

## Limitations

- Training completion KPI is a **proxy** heuristic, not LMS-grade.  
- Health scoring requires scheduled backfill for consistency.  
- No drag-and-drop pipeline mutations in UI.  
- CRM/Beta linkage described as seams, not wired.

## Future roadmap

1. Server pagination + cursor filters for clients.  
2. Stage transition server actions + audit trail.  
3. Partner API keys with scoped OAuth-style permissions.  
4. Stripe Connect payouts + immutable commission ledger.  
5. SSO / SAML for enterprise partners.  
6. Franchise hierarchy (`PartnerClient` parent/child or `WorkspaceGroup`).
