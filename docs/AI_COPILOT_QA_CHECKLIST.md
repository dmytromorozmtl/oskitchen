# Copilot QA checklist

## Page render

- [x] `/dashboard/copilot` builds without errors.
- [x] Subnav highlights the active tab.
- [x] Empty workspace renders the deterministic snapshot (zero-state
      bullet plus CTAs) instead of failing.

## Deterministic insights

- [x] Snapshot loads even with no orders / production / packing rows.
- [x] Each insight carries `severity`, `summary`, `recommendedAction`,
      and `actionRoute`.
- [x] `persistDeterministicInsights` resolves stale rows before
      writing new ones.

## AI narrative

- [x] When `OPENAI_API_KEY` is unset, narrative status is
      `MISSING_API_KEY` and UI shows the deterministic bullet.
- [x] When `deterministicOnly` is true, status is
      `DISABLED_BY_SETTINGS` and no network call is made.
- [x] When the provider returns non-200, status is `PROVIDER_ERROR`
      and the deterministic fallback is shown.
- [x] When the outbound guardrail trips, status is
      `REDACTION_BLOCKED` and no prompt is sent.
- [x] We never fabricate narrative text when AI is unavailable.

## Privacy / redaction

- [x] Emails / phone numbers / addresses in free text are masked
      before being attached to AI prompts.
- [x] Tokens / API keys / credit-card-like runs are always stripped.
- [x] `OPENAI_API_KEY` is never read in a client component.
- [x] Audit rows do not contain prompt bodies — only event type +
      counts / status.

## Chat

- [x] `chatTurnAction` enforces `copilot.chat` and rejects unknown
      conversation IDs.
- [x] Each turn writes `USER` and `ASSISTANT` rows on
      `CopilotMessage`.
- [x] Sample prompts in `ChatThread` execute via the same action.
- [x] Long-running calls do not block the page render.

## Action drafts

- [x] Creating a draft writes a `NEEDS_APPROVAL` row + audit event.
- [x] Approve / reject / cancel transitions all write audit events.
- [x] Only `EXECUTED` produces a side effect (currently:
      `create_task` → `KitchenTask`).
- [x] Approve / execute buttons only render for roles with
      `copilot.actions.approve`.

## Permissions

- [x] Roles without `copilot.view` see a permission-denied card on
      every copilot page.
- [x] Roles without `copilot.read.audit` cannot reach
      `/dashboard/copilot/audit`.
- [x] Superadmin email always has full access.

## Build

```bash
npm run typecheck
npm run build
```

Both exit `0`. All eight `/dashboard/copilot/*` routes appear in the
build output.
