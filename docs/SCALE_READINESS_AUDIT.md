# Scale readiness audit

| Area | Current state | Scale risk | Recommended improvement | Priority |
|---|---|---|---|---|
| Data model scalability | Mostly `userId` scoped with additive workspace/org foundations | Tenant migration complexity | Migrate domain-by-domain to `workspaceId` | P0 scale blocker |
| User/workspace model | Organization/workspace/member models added | Mixed scoping during transition | Use resolver + migration plan | P0 scale blocker |
| Multi-location readiness | Locations exist | Reports not org-level | Enterprise reports + org rollups | P1 enterprise blocker |
| Multi-brand readiness | Brand model + optional brand ids added | Existing records unbranded | Brand filters on new data first | P1 enterprise blocker |
| Partner/agency readiness | Partner accounts/clients/leads exist | Permissions/payout not complete | Partner portal roadmap, no payout automation | P1 enterprise blocker |
| Permissions | Matrix + gate added | Current routes still mostly role-light | Add guards to risky actions over time | P1 enterprise blocker |
| Billing | User subscription model | Enterprise org billing not modeled | Add organization billing contract later | P1 enterprise blocker |
| Reporting | Dashboards + enterprise placeholder | Heavy queries at scale | Materialized rollups/scheduled reports | P2 strategic improvement |
| Integrations | Connection architecture exists | Webhook volume/retry needs queues | Queue processor + replay limits | P1 enterprise blocker |
| Import/export | Import center exists | Large files need async jobs | Background processing and object storage | P1 enterprise blocker |
| Security | Trust/security docs + audit logs | No SSO/SOC2 | Enterprise security roadmap | P1 enterprise blocker |
| Audit logs | Model + dashboard added | Coverage incomplete | Instrument critical actions incrementally | P1 enterprise blocker |
| Support tooling | Ticket system exists | SLA workflows missing | Add SLA/assignment/escalation | P2 strategic improvement |
| Deployment architecture | Vercel/Supabase docs | Connection pool constraints | Pooling, queues, observability | P1 enterprise blocker |
| Operational bottlenecks | Implementation workflow exists | White-glove load | Partner program and playbooks | P2 strategic improvement |
