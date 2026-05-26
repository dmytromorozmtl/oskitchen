# Partner revenue

## Model

`PartnerRevenue` rows belong to a `PartnerAccount` and optionally to a `PartnerClient` / `Workspace`.

Fields include `revenueType`, `amountCents`, `recurring`, `payoutStatus`, optional period bounds, and freeform `notes`.

## Interpretation

Until finance and legal approve automated payouts, treat amounts as **attribution / pipeline tracking**, not guaranteed payable commissions.

## Dashboard

- **MRR managed** — sum of `PartnerClient.mrrCents` across accessible clients (advisory).  
- **Partner revenue (90d)** — sum of `PartnerRevenue.amountCents` in trailing 90 days.  
- **Revenue mix** — `groupBy` revenue type for the partner command center chart.

## Next steps

- Commission rules engine versioned per contract.  
- Payout batch export + Stripe Connect or manual ACH reconciliation.  
- Invoice PDF generation with white-label templates (see white-label doc).
