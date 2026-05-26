# Claims Governance

Machine-readable registry:

- `config/marketing/claims-registry.json`

Audit command:

```bash
npm run audit:marketing-claims
```

## Why This Exists

KitchenOS has enough product depth that marketing can easily outrun proof.
Claims governance prevents the product, GTM, and fundraising narrative from
drifting away from what is actually implemented or verified.

## Required Fields Per Claim

- `claim`
- `page`
- `evidenceType`
- `evidenceSource`
- `dateVerified`
- `status`

Allowed statuses:

- `verified`
- `illustrative`
- `needs-evidence`
- `deprecated`

## Status Meanings

### `verified`

Supported by product reality, code, instrumentation, or approved customer proof.

### `illustrative`

Allowed only when clearly framed as an estimate/example, not a universal
performance claim.

### `needs-evidence`

Potentially useful claim, but must not be strengthened or widely repeated until
proof exists.

### `deprecated`

Should be removed or reworded. This usually means product reality no longer
matches the old claim.

## Governance Rules

1. No new performance claim ships without a registry row.
2. No claim should remain `needs-evidence` forever. Either verify it, soften it,
   or remove it.
3. `deprecated` claims should be cleaned from public copy quickly.
4. Product, GTM, and fundraising material should all reference the same claim
   source of truth.

## Evidence Types

Examples:

- codebase-surface-audit
- product-page
- customer-proof
- internal-estimate
- capability-matrix
- analytics-report
- case-study

## Review Cadence

- monthly during early GTM motion
- before any fundraising deck refresh
- before major pricing / homepage / compare-page rewrites

## Fast Rule of Thumb

If a claim would make a skeptical pilot customer or investor ask "how do you
know that?", it belongs in the registry before it belongs in public copy.
