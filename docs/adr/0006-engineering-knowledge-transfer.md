# ADR 0006: Engineering knowledge transfer (bus factor)

**Status:** Accepted  
**Date:** 2026-06-06

## Context

OS Kitchen has **bus factor 1** (single founder engineer). Investors, SOC2 readiness, and pilot scale all require documented knowledge transfer — not tacit-only architecture.

## Decision

Maintain three onboarding artifacts, reviewed quarterly:

1. **`docs/engineering-onboarding.md`** — 2-week hire checklist (access, CI, drills)
2. **`docs/engineering-video-walkthrough.md`** — ~40 min recorded repo tour
3. **`docs/adr/`** — architecture decision log (this folder)

New structural decisions ship as ADRs before merge when they affect tenancy, integrations, deploy, or auth.

## Consequences

**Positive:** Hire #2 and advisors can self-serve; diligence-ready honesty on team risk.  
**Negative:** Documentation maintenance cost; video goes stale without quarterly refresh.

## Alternatives considered

- Wiki-only — rejected (no version control alongside code)
- No video — rejected (async onboarding too slow for bus factor 1)

## References

- [`docs/bus-factor-mitigation.md`](../bus-factor-mitigation.md)
- Policy: `bus-factor-mitigation-absolute-final-v1`
