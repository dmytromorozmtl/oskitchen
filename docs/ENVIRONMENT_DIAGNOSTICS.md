# Environment Diagnostics

## Rules

- **Never** display env values — only presence / pattern warnings (`getEnvHealth`, `getEnvSuspicionWarnings`, `getProductionLaunchGaps`).
- Grouped diagnostics: `lib/developer/environment-groups.ts` + `services/developer/environment-service.ts`.

## Status vocabulary

| Status | Meaning |
|--------|---------|
| ok | Variable present |
| missing | Unset or blocked for production requirements |
| insecure | Pattern-based suspicion (see `getEnvSuspicionWarnings`) |
| deprecated | Reserved for future static keys list |

## UI

- `/dashboard/developer/health#env` — grouped tables.
