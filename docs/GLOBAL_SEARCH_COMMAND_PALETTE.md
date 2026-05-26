# Global Search & Command Palette

## UX

- **Shortcut:** ⌘K / Ctrl+K (existing)
- **Navigation:** static allow-listed routes + registry entries (permission + module aware)
- **Workspace search:** debounced server action when query length ≥ 2

## Code map

| Path | Responsibility |
|------|------------------|
| `lib/search/search-types.ts` | Hit kinds + DTO |
| `services/search/global-search-service.ts` | Prisma queries scoped to `userId` |
| `actions/global-search.ts` | `runGlobalSearch` server action |
| `components/dashboard/command-palette.tsx` | Merges nav + remote hits |

## Security

- Results **never** cross workspaces (`userId` filter on every query).
- No secrets returned (integration search selects metadata only).

## Future

- Import job hits (`/dashboard/import-center/jobs/[id]`)
- Workspace-level audit search for platform admins only
