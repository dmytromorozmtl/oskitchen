# Enterprise Multi-Location Operations

## Principles

1. **Do not force complexity** on single-location workspaces — progressive disclosure only.  
2. Prefer **additive filters** (`brandId`, `locationId`, `workspaceId`) on queries that already support them (`ExecutiveOverview`, orders).  
3. Organization rollups require `Workspace.organizationId` to be populated.

## Libraries & services (this pass)

- `lib/org/org-scope.ts` — workspace vs org vs all mode types.  
- `lib/location/location-scope.ts` — ALL vs SINGLE location filter.  
- `lib/brand/brand-scope.ts` — ALL vs SINGLE brand filter.  
- `services/org/org-rollup-service.ts` — list workspaces in org + resolve org from workspace.  
- `services/location/location-operations-service.ts` — wraps `location-service` + `countLocationsForUser`.  
- `services/brand/brand-operations-service.ts` — list/count brands for workspace.

## Reporting targets (roadmap)

- Revenue / orders by `locationId` and `brandId` (reuse analytics filters).  
- Production workload by kitchen station JSON on `Location`.  
- Packing + routing KPIs per location (requires consistent location attribution on tasks).

## Risks

- Historical rows may lack `locationId` — reports must show **Unknown** bucket, not silent mis-rollup.
