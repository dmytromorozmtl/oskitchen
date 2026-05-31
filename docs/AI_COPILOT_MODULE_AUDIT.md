# AI Copilot module audit (OS Kitchen)

**Date:** 2026-05-11
**Scope:** `/dashboard/copilot` (the existing AI Operations Copilot
route — referenced as `/dashboard/ai-copilot` in the spec). Adjacent
modules consulted: Orders, Production, Packing, Routes, Tasks,
Catering, Meal Plans, CRM, Inventory, Purchasing, Costing, Channels,
Webhooks, Forecast.

## TL;DR

The current copilot page is a single read-only summary. It runs four
Prisma queries, derives 1–4 deterministic insight cards, and asks
OpenAI for a 5-sentence narrative *only when* `OPENAI_API_KEY` is set
(returning `null` otherwise — the bullet summary is the fallback). It
does the right thing on secrets (no key in the client, no fake AI
when the key is missing) but it has **no**:

- chat / Q&A surface,
- action drafts or approval workflow,
- structured data sources / source registry,
- per-role redaction or permission layer beyond `requireSessionUser`,
- audit log,
- business-mode adaptation,
- per-source PII levels.

Everything we need to upgrade it lives in the workspace already
(Executive service, Reports service, Production batches, Packing
batches, Routes, Catering, Meal Plans, Inventory shortages,
Purchasing). This project layers a safety / redaction / approval
architecture on top of the existing deterministic pipeline.

## Findings

| #  | Area | Current state | Why it is limiting / risky | Affected user | Recommended fix | Pri |
|----|------|---------------|----------------------------|---------------|-----------------|-----|
| 1  | Surface | Single page, no tabs | Owner can't navigate Today / Chat / Drafts / Audit | Owner / manager | Replace with a Copilot Command Center (8 tabs) | P2 |
| 2  | Deterministic insights | Only `openOrders`, `failedWebhooks`, `lowMarginProductTitles`, `forecast.notes[0]` | Misses production / packing / routes / catering / inventory | Operator | Expand into a deterministic engine that reads the same signals as the Executive dashboard | P1 |
| 3  | AI narrative prompt | Free-form summary of bullets | Bullets can leak product names / PII if upstream changes | Compliance | Build prompts via `lib/ai/copilot-prompts.ts` with explicit safety preamble and redacted context | P0 |
| 4  | AI provider call | Hard-coded `gpt-4o-mini`, no abstraction | Hard to swap providers or unit-test | Engineering | Wrap in `aiNarrative(provider, prompt)` with stub-friendly interface | P2 |
| 5  | Permissions | `requireSessionUser` only | Kitchen / packer / driver / viewer roles all see the same surface, including margin warnings | Compliance | `canUseCopilot(scope, capability)` matrix + per-source PII levels | P0 |
| 6  | PII handling | No redaction layer | Future expansion could leak emails / phone numbers / addresses | Compliance | `redactContext(rows, level)` utility + default `PII_REDACTED` level | P0 |
| 7  | Chat | None | Owner can't ask follow-ups | Owner | New `/dashboard/copilot/chat` route with conversation persistence and deterministic fallback | P1 |
| 8  | Action drafts | None | AI cannot recommend "create a task" / "create a follow-up" without humans approving | Manager | `CopilotActionDraft` model + approve / reject server actions | P1 |
| 9  | Audit | None | No record of what AI was asked / generated / approved | Compliance | `CopilotAuditEvent` table + log on every state change | P0 |
| 10 | Settings | None | Owner can't disable AI narrative or change redaction level | Owner | `/dashboard/copilot/settings` page persisted on `UserProfile` | P1 |
| 11 | Data sources | Implicit (Order / Webhook / Cost snapshot) | Not discoverable | Operator | `lib/ai/copilot-sources.ts` registry with allowed roles + PII level | P2 |
| 12 | Business mode | None | Same copilot for restaurant / catering / meal prep / ghost kitchen | Owner | Mode-aware focus list + recommended chips | P2 |
| 13 | API key surfacing | Not shown anywhere | Owner can't tell if AI is enabled | Owner | Status badge "Deterministic" / "Narrative enabled" (never the key value) | P1 |
| 14 | Privacy disclosure | Generic amber card | Doesn't reflect actual redaction level | Compliance | Concrete badge: "PII minimised — emails / phones masked before sending to AI" | P2 |
| 15 | Error states | Silent return of `null` | Owner can't tell whether AI failed, was disabled, or had no data | Owner | Explicit `narrativeStatus` enum displayed in the UI | P2 |
| 16 | Tool calls | None | AI can't draft structured actions | Manager | Tool registry (`createTask`, `createFollowUp`, `recordPurchasingNeed`, etc.) — output becomes `CopilotActionDraft` rows | P1 |
| 17 | Execution gate | n/a | Spec requires NO destructive action without human approval | Compliance | `approveActionDraft` is the only server action that writes to operational tables | P0 |
| 18 | Performance | All queries on every page load | Fine today; could grow | Engineering | Cache `loadDeterministicInsights` for ~30s per user | P3 |
| 19 | Empty state | "0 orders still active" | Looks broken for blank workspaces | Owner | Empty-state CTA mirroring the Executive dashboard | P2 |
| 20 | Conversation memory | None | Each chat call needs full context | Engineering | `CopilotConversation` + `CopilotMessage` with redaction level per message | P2 |

## Priority legend

- **P0** — Security / privacy / safety; must fix before broad rollout.
- **P1** — High AI / operational value.
- **P2** — UX improvements.
- **P3** — Future enhancements.
