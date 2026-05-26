# Partner permissions

## Module access (`canAccessPartnerModule`)

Users may open the partner dashboard if **any** of:

1. `canAccessOwnerOnlySurfaces` — `UserRole.OWNER` on profile, or superadmin.  
2. `isSuperAdminUser` — includes canonical founder email `workspace.moroz@gmail.com` and `SUPER_ADMIN` platform row.  
3. `platformUserRole` in `PARTNER_PLATFORM_ROLES`: `PARTNER_ADMIN`, `IMPLEMENTATION_ADMIN`, `SUPPORT_ADMIN`, `PLATFORM_ADMIN`.  
4. Owns a `PartnerAccount` (`ownerUserId`).  
5. Has a `PartnerMember` row with non-null `userId` (accepted member).

## Data scope (`getAccessiblePartnerAccountIds`)

- **Superadmin** and users with partner-platform roles above → **all** `PartnerAccount.id` values.  
- Everyone else → union of accounts they **own** and accounts where they appear as a **member**.

All list/aggregate queries must filter `partnerAccountId in accessibleIds`. Never accept arbitrary `partnerAccountId` from the client without re-checking membership.

## Organization provisioning (`canProvisionPartnerOrganizations`)

May create new `PartnerAccount` rows if:

- Superadmin, **or**  
- Owner-only surfaces (kitchen `OWNER` profile / founder bypass), **or**  
- Platform role in `SUPER_ADMIN`, `PLATFORM_ADMIN`, `PARTNER_ADMIN`, `GROWTH_ADMIN`.

Regular consultants invited only as `PartnerMember` **cannot** self-provision orgs.

## Role model (future mutations)

`PartnerMemberRole` enumerates partner-side job functions (`PARTNER_OWNER`, `IMPLEMENTATION_SPECIALIST`, …). Granular JSON `permissions` is reserved for fine-grained feature flags once mutation APIs land.

## Audit expectations

When partner mutations ship, log: actor, partner account, target client/workspace, before/after payload hash (not secrets), correlation id.
