# Era 20 — Pilot ICP qualification bridge

**Policy:** `era20-pilot-icp-qualification-bridge-v1` (`KOS-E20-015`)

## Purpose

Surface **live** vs **example** ICP qualification for GO/NO-GO without faking customers or LOI.

## Env

```bash
# Example ghost kitchen (NOT a signed customer):
export PILOT_GONOGO_ICP_INPUT_JSON="$(cat config/commercial/pilot-icp-qualified-example.template.json)"

# Real prospect draft (fill _prospectMeta first):
export PILOT_GONOGO_ICP_INPUT_JSON="$(cat config/commercial/pilot-icp-prospect-draft.template.json)"

npm run smoke:pilot-gono-go
```

Example template qualifies ghost-kitchen profile only — does **not** satisfy customer gate.

## UI

`/dashboard/implementation` — **Pilot ICP qualification** panel.

## GO/NO-GO

New evidence gate: `icp_qualification` — visible in `smoke:pilot-gono-go` output.
