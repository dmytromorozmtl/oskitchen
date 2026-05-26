# Platform admin + support — completion notes

## Security baseline (unchanged)

- `/platform/*` gated by `requirePlatformAccess` (`lib/platform/platform-guards.ts`).
- Founder email `workspace.moroz@gmail.com` remains the canonical bootstrap superadmin (`lib/platform-owner.ts`).
- Client/workspace users **must not** obtain platform permissions via workspace roles (platform permissions are separate strings).

## Services restored / added

| Service | Export | Purpose |
|---------|--------|---------|
| `services/platform/platform-support-service.ts` | `listPlatformSupportTickets`, `getPlatformTicketForAdmin`, `listPlatformSupportInboxPreview` | Cross-tenant ticket reads for inbox, queue, escalations, detail. |
| `services/platform/platform-workspace-service.ts` | `platformGetWorkspace`, `listRecentWorkspacesForPlatform` | Workspace detail + lightweight lists. |
| `services/platform/platform-audit-service.ts` | `listPlatformAuditTail`, `recordPlatformAudit` | Platform audit tail + writer shim. |

## Support UX

- Inbox/queue/escalations pages expect `listPlatformSupportTickets` with Prisma `where` filters.
- Ticket detail hydrates comments (with visibility) + events + assignment forms (existing actions).

## Copy / polish

- Removed “ships next” phrasing from workspace detail placeholder — replaced with honest capability statement.

## Follow-ups (P2)

- SLA timers + breach banners on platform inbox.
- Workspace tabs for modules/entitlements with `recordPlatformAudit` on each mutation.
