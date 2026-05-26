# Navigation performance review

## Constraints (non-negotiable)

- No **heavy Prisma** or N+1 queries in `DashboardSidebarNav` or `CommandPalette`.  
- Badge counts must be **O(1)** client props or infrequent server aggregates passed from layout.

## Current patterns

| Layer | Work done | Risk |
|-------|-----------|------|
| `app/dashboard/layout.tsx` | One profile fetch + billing access + module prefs; computes blocked prefixes + optional `buildWorkspaceSetupHint`. | Keep select shapes narrow. |
| `DashboardSidebarNav` | `useMemo` for `getFilteredNavGroups`, link index, pinned/recent derivation. | Re-renders on pathname change only — acceptable. |
| `getFilteredNavGroups` | Pure transforms on static `NAV_GROUPS`. | Low. |
| `CommandPalette` | `useMemo` merges registry + extras; filters by small `Set` of disabled keys. | Registry size is static (~40); OK. |

## Hydration

- Pins/recent read `localStorage` in `useEffect` — avoids SSR/client mismatch.  
- Nav scope (`kitchenos.nav.scope`) same pattern.

## Lazy badges (future)

- `lib/modules/module-badges.ts` should consume **summarized** props, e.g. `{ orderAttention?: number }` injected from a layout-level single query or edge cache — not per-link fetches.

## Recommendations

1. **Debounce** sidebar text filter if keystrokes become hot (not needed yet).  
2. **Code-split** rare internal-only routes’ heavy charts — not sidebar.  
3. **React.memo** `NavGroup` if profiling shows rerenders — measure first.
