# AI / Automation Audit Events

## Guidance

- Use `category: AI_COPILOT` or `AUTOMATIONS` and `source: AI_COPILOT` or `AUTOMATION`.
- Log intent-level actions (`AI_ACTION_DRAFT_CREATED`, `AUTOMATION_RULE_TRIGGERED`) with ids only — not model prompts containing secrets or unnecessary PII.

## Tab preset

`tab=ai` filters to AI/automation categories and sources.

## Follow-up

Instrument `actions/copilot.ts`, notification rules, and kitchen task automations.
