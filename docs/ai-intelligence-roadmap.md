# AI And Intelligence Roadmap

Status: intelligence roadmap bounded by explainability, tenant safety, and operator approval
Primary evidence: `services/ai/`, `actions/kitchen-ai.ts`, `app/dashboard/copilot/`, `app/dashboard/forecast/`, `services/forecast/`, `docs/system-reality-model.md`

## Rules
- AI must be explainable.
- AI cannot silently message customers.
- AI must require approval for campaigns.
- AI must respect tenant boundaries.
- AI must not leak PII.
- AI beta labels are required until proven.

## Capability Roadmap
| Capability | Current state | Gap | Data / model changes | Service changes | UI changes | Permission / governance | Tests | Acceptance criteria |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| sales forecast | forecast surfaces exist | forecast trust and explanation need maturity | clearer training/input snapshots | deterministic + AI forecast services | explainable forecast panels | `analytics.view`; preview label | forecast accuracy and guard tests | operators understand what the forecast is based on |
| demand forecast | partial through forecasting and inventory foundations | not packaged for purchasing and prep | demand snapshot linkage | demand forecast services | demand forecast dashboard | `analytics.view`, `inventory.read` | demand forecast tests | operators can estimate demand credibly |
| prep forecast | production and forecast are not tightly connected yet | direct prep recommendation flow missing | prep demand snapshots | prep suggestion service | tomorrow prep panel | `analytics.view`, kitchen permissions for ops view | prep recommendation tests | owner can answer "what should I prep tomorrow?" |
| inventory purchasing suggestions | purchasing + forecast foundations exist | no polished suggestion engine | reorder/forecast linkage | PO suggestion services | suggested reorder UI | `purchasing.manage` | purchasing suggestion tests | purchaser gets usable reorder suggestions |
| labor forecast | labor and forecast foundations exist | no mature labor forecast product | labor demand snapshots | labor forecast services | labor forecast dashboard | `analytics.view`, `schedule.manage` | labor forecast tests | owner can forecast labor needs |
| menu performance insights | costing and analytics exist | insight packaging is partial | menu performance snapshots | deterministic insights service | menu insight cards | `analytics.view` | insight tests | owner can identify winners and laggards |
| margin improvement suggestions | costing service exists | no explainable recommendation layer | cost/margin recommendation inputs | recommendation service | margin opportunity UI | `financials.view` | recommendation tests | operator sees actionable, explainable suggestions |
| waste prediction | waste logging exists | prediction not mature | waste/event history inputs | waste prediction service | waste risk cards | `analytics.view` | waste prediction tests | waste risks are presented as explainable probabilities |
| customer churn risk | CRM metrics exist | no mature churn model | customer lifecycle snapshots | churn scoring service | at-risk customer panels | `customers.read`, `analytics.view` | churn score tests | marketer can identify at-risk customers |
| campaign generation | early marketing services exist | no safe approval-first AI campaign workflow | campaign draft metadata | draft generation service only | editable draft composer | `campaigns.manage` and human approval | prompt safety and redaction tests | AI can draft, not send, campaigns |
| review response drafts | feedback/review surfaces exist | no packaged AI drafting loop | feedback context snapshots | response draft service | operator approval UI | `customers.manage` and approval | draft safety tests | operator can approve or discard drafts |
| support summaries | support surfaces exist | summarization maturity is partial | ticket/thread summary snapshots | support summary service | summary panels for support | platform/support permissions | summary safety tests | support sees useful internal summaries |
| anomaly detection | metrics and observability exist | no canonical anomaly layer | metric baseline snapshots | anomaly detection service | anomaly timeline and explanation UI | `analytics.view` | anomaly tests | owner can ask "why did sales drop?" and get evidence-backed leads |

## Product Guardrails
- Ship AI as `preview` or `beta` until each domain has accuracy, explanation, and human-approval standards.
- Prefer deterministic insights first, then assisted language generation second, then optimization suggestions third.
- No customer-facing AI action should execute automatically without explicit policy and user approval.

## Implementation Order
1. deterministic menu/margin/operations insights
2. explainable forecasting and prep suggestions
3. customer lifecycle insights and campaign drafts
4. anomaly detection and support summaries
5. broader optimization recommendations
