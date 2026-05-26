# AI Copilot — ready report

## What changed

- `/dashboard/copilot` is now an Operations Intelligence Assistant
  with subnav, KPI counters, deterministic insights, optional AI
  narrative, action drafts, audit log, settings, and a Q&amp;A chat
  surface — replacing the previous single-page summary.
- New library at `lib/ai/` (types, permissions, redaction, sources,
  tools, prompts, guardrails).
- New services at `services/ai/copilot-service.ts` and
  `services/ai/deterministic-insights-service.ts`. Legacy
  `services/ai/copilot.ts` is preserved.
- New Prisma models: `CopilotInsight`, `CopilotConversation`,
  `CopilotMessage`, `CopilotActionDraft`, `CopilotAuditEvent`,
  `CopilotSettings` (migration `20260516000000_ai_copilot`).
- Server actions: `chatTurnAction`, `createActionDraftAction`,
  `approve/reject/executeActionDraftFormAction`,
  `refreshDeterministicAction`, `resolveCopilotInsightFormAction`,
  `updateCopilotSettingsFormAction`.

## Deterministic insights

`buildDeterministicSnapshot` reuses `loadExecutiveOverview` so the
copilot, executive dashboard, and reports module share one set of
numbers. 13 rule types covering throughput, integrations, production,
packing, delivery, inventory, purchasing, catering, meal plans,
tasks, margin, and repeat rate.

## Optional AI narrative

`generateNarrative` is gated by:

1. `aiNarrativeEnabled && !deterministicOnly` in `CopilotSettings`.
2. `OPENAI_API_KEY` present server-side.
3. `runOutboundGuardrail` passing on the redacted prompt.

All four failure modes are explicit: `DISABLED_BY_SETTINGS`,
`MISSING_API_KEY`, `PROVIDER_ERROR`, `REDACTION_BLOCKED`. UI never
claims AI ran when it didn't.

## Chat

`/dashboard/copilot/chat` uses `chatTurnAction` server-side. Messages
are persisted with their redaction level. Up to 20 prior turns are
included in the prompt. Sample prompt chips speed common questions.

## Data sources

`lib/ai/copilot-sources.ts` registers 18 sources with `piiLevel`,
`allowedRoles`, `maxRows`, and `recommendedRedaction`. The sources
tab (`/dashboard/copilot/sources`) renders the catalogue for
discoverability.

## Redaction / privacy

`lib/ai/copilot-redaction.ts` exposes `redactText`, `maskEmail`,
`maskPhone`, `maskAddress`, `detectLeakRisks`, and
`stricterRedaction`. The outbound guardrail
(`lib/ai/copilot-guardrails.ts`) is the single chokepoint before any
provider call.

## Action drafts

`CopilotActionDraft` rows go through
`NEEDS_APPROVAL → APPROVED → EXECUTED`. Only `EXECUTED` runs a side
effect. `create_task` is the only side-effect-enabled action today
(it creates a `KitchenTask` with `taskType = ADMIN`). All other tools
record a draft and rely on the human to act inside the relevant
module.

## Approval workflow

- Drafts: anyone with `copilot.actions.draft`
  (owner, manager, admin, kitchen_lead, sales).
- Approve / reject / execute: `copilot.actions.approve`
  (owner, manager, admin).
- Forms send `FormData` to dedicated server actions; status
  transitions are atomic and audit-logged.

## Permissions

10 capabilities (`lib/ai/copilot-permissions.ts`) with a per-role
matrix. Superadmin always full access.

## Audit

Every state change writes a `CopilotAuditEvent`:
`narrative_generated`, `narrative_provider_error`,
`narrative_blocked`, `chat_message_generated`, `chat_provider_error`,
`chat_blocked`, `action_draft_created`, `action_draft_approved`,
`action_draft_rejected`, `action_draft_cancelled`,
`action_draft_executed`, `insight_resolved`, `settings_changed`.

## Limitations

- Side effects are limited to `create_task`. Other tool types remain
  as recorded drafts that operators act on inside the relevant
  module. This is intentional to avoid expanding the auto-write
  surface without an explicit product review.
- No streaming token output — replies arrive whole. We can layer the
  Vercel AI SDK on top of `chatTurnAction` without changing the
  server contract.
- No tool-calling round-trip in chat — the chat path always returns a
  text answer. Tool execution requests still flow through the
  explicit Action Drafts form.
- The redaction engine is rule-based (regex). It is not a substitute
  for legal review of high-PII workflows.

## Next recommendations

1. Add a per-source "deep dive" tool that the copilot can invoke to
   summarise one source at a time, with the registry's per-source
   redaction enforced.
2. Wire the Vercel AI SDK so chat tokens stream into `ChatThread`.
3. Add a scheduled job (`/api/cron/copilot/snapshot`) that calls
   `persistDeterministicInsights` daily — so the insights tab is
   fresh even when no operator opens the copilot.
4. Expand `executeApprovedAction` to handle `create_follow_up`,
   `create_purchasing_reminder`, and `suggest_report_export` natively
   once the destination modules expose stable server actions.
5. Add a per-conversation `redactionLevel` override so investigators
   can temporarily allow `FULL_INTERNAL_ALLOWED` (subject to admin
   confirmation and audit).

## Build status

```
npm run typecheck   # exit 0
npm run build       # exit 0
```

All eight `/dashboard/copilot/*` routes appear in the build output.
