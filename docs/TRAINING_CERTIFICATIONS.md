# Certifications

Certifications are explicit, manager-issued proofs that an employee has
completed a program and can perform a role.

## Types

`TrainingCertificationType`:

- `KITCHEN_CERTIFIED`
- `PACKING_CERTIFIED`
- `ROUTE_CERTIFIED`
- `MANAGER_CERTIFIED`
- `SAFETY_CERTIFIED`
- `CATERING_CERTIFIED`
- `CUSTOMER_SERVICE_CERTIFIED`
- `ALLERGEN_CERTIFIED`
- `CUSTOM`

## Default validity (days)

| Type | Days |
|------|------|
| KITCHEN_CERTIFIED | 365 |
| PACKING_CERTIFIED | 365 |
| ROUTE_CERTIFIED | 365 |
| MANAGER_CERTIFIED | 730 |
| SAFETY_CERTIFIED | 365 |
| CATERING_CERTIFIED | 365 |
| CUSTOMER_SERVICE_CERTIFIED | 365 |
| ALLERGEN_CERTIFIED | 365 |
| CUSTOM | (never expires unless explicit) |

`isCertificationActive` returns false if `revokedAt` is set or `expiresAt` is
in the past. `isCertificationExpiringSoon` flags certifications within 30
days of expiry.

## Practice → Live

Certifications are **always** issued explicitly by a manager. Practice-mode
assignments never auto-certify. This is enforced in
`/dashboard/training/practice` — the CTA links to the certifications tab.

## Revocation

Revocation requires a reason string and writes `CERTIFICATION_REVOKED` to
`TrainingEvent`.
