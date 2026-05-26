# Safe Fallbacks & Error Handling

## Libraries & services

| Path | Role |
|------|------|
| `lib/errors/user-facing-errors.ts` | Canonical codes + copy |
| `services/errors/error-normalization-service.ts` | Maps unknown errors → safe UI payload |

## Components

| Path | Role |
|------|------|
| `components/feedback/provider-missing-state.tsx` | Honest “configure provider” card |
| `components/feedback/configuration-required-state.tsx` | Amber call-to-action |
| `components/feedback/retryable-error-state.tsx` | Retry wrapper over `ErrorState` |

## Rules

- Never echo **env values**, tokens, or webhook secrets.  
- Always include **next route** (settings / integrations / sales channels).  
- Optional dev-only `debugHint` stays behind `NODE_ENV === "development"` in normalizer.
