# Organization and workspace architecture

KitchenOS remains backward-compatible with existing `userId` records.

New structure:
- `Organization`: customer, partner, or internal account.
- `Workspace`: brand/location operating context under an organization.
- `OrganizationMember`: org-level role.
- `WorkspaceMember`: workspace-level role.
- `Brand`: optional brand scope inside a workspace.

Migration approach:
1. Backfill one default organization and workspace per existing owner.
2. Keep existing `userId` queries working.
3. Scope new enterprise data by `organizationId`/`workspaceId`.
4. Add a resolver that returns current user, organization, workspace, and role.
5. Migrate orders/menus/products/integrations domain-by-domain.

Do not remove `userId` until every route/action/API endpoint has tenant tests.
