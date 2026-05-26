# Navigation QA matrix

Run after meaningful nav changes. **Automated:** `npm run typecheck`, `npm run build`.

## Business modes (sidebar + ⌘K labels)

| Mode | Focused nav hides advanced? | Terminology smoke (spot-check) | Module settings reset |
|------|----------------------------|--------------------------------|------------------------|
| RESTAURANT | Y | Orders / Menus / Kitchen | OK |
| CAFE | Y | Storefront wording | OK |
| BAR | Y | Events & drinks site, Bar prep | OK |
| BAKERY | Y | Preorder language | OK |
| CATERING | Y | Quotes / calendar | OK |
| MEAL_PREP | Y | Weekly menus / routes | OK |
| GHOST_KITCHEN | Y | Brands / order hub | OK |
| CLOUD_KITCHEN | Y | Same as ghost | OK |
| MULTI_BRAND | Y | Executive surfaced | OK |

## Roles

| Role | Sidebar expectation | Direct URL / module disabled | ⌘K |
|------|---------------------|------------------------------|-----|
| OWNER | Full groups per mode + billing | Module gate respects prefs | Full minus disabled |
| STAFF | Allow-list strip | Blocked non-allow paths → **You do not have access** | Filtered same |
| Super admin (`workspace.moroz@gmail.com` or SUPER_ADMIN row) | All modules + internal tier in settings | No module blocks | All routes incl. internal |

## Features

| Case | Expected |
|------|----------|
| Pin 7th item | Oldest pin drops (max 6) |
| Recent includes pinned href | Excluded from Recent |
| Clear recent | Empties list + `localStorage` + event hook for sync |
| “Show all modules” | Persists; reveals mode-hidden links |
| Disabled module route | Module not enabled card + link to settings |
| STAFF → `/dashboard/billing` | Role denial card |
| Setup hint | Shown until `buildWorkspaceSetupHint` returns null |

## Mobile

| Case | Expected |
|------|----------|
| Open drawer | Focus moves into sheet |
| Close drawer | Returns focus to trigger |
| Scroll | Search filter reduces list length |

## Regression (super-admin)

- [ ] `platformBypass === true` → `disabledModuleKeys` empty in layout.  
- [ ] Internal modules visible in `/dashboard/settings/modules`.  
- [ ] `/platform/dashboard` reachable from owner extras when bypass on.
