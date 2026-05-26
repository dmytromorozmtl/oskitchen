# Partner program architecture

Purpose: allow agencies/consultants to help food businesses implement KitchenOS.

Current foundations:
- `PartnerAccount`
- `PartnerMember`
- `PartnerClient`
- `PartnerReferral`
- `PartnerCommissionPlaceholder`
- `/partner`, `/partner/clients`, `/partner/implementation`, `/partner/revenue`

Not implemented:
- Real payout automation.
- Cross-tenant impersonation.
- Partner-managed permissions.

Safe next steps:
1. Invite-only partners.
2. Client consent before access.
3. Partner role scoped to implementation/readiness.
4. Manual commission reconciliation until finance/legal review.
