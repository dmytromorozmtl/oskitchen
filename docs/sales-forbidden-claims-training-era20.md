# Sales — Forbidden Claims Training (Era 20)

**Until `p0ProofStatus: proof_passed` and signed pilot LOI — enforce before every demo and contract.**

## Never claim (forbidden)

- Production SSO / enterprise SSO for all tenants  
- SOC2 certified / SCIM live  
- Unified inventory depletion across POS + storefront  
- Unified loyalty / gift cards across channels  
- Marketplace LIVE (DoorDash/Uber ops)  
- POS hardware certified / offline queue  
- Rush-hour KDS SLO / realtime E2E certified  
- Public API SLA  
- "Production-ready platform" without matrix + pilot scope  

**CI gate:** `npm run verify-claims` — must pass before release marketing copy.

## Safe to demo (with honest UI)

- Owner Daily Briefing (shows NO-GO / SKIPPED when true)  
- Launch Wizard setup narrative  
- Integration Health Center (SKIPPED WITH REASON visible)  
- Order spine, KDS, packing (pilot_ready with qualification)  
- POS software path (not hardware Terminal)  

## Demo script rule

Show Integration Health P0 banner if present — **do not hide SKIPPED rows**.

## After P0 PASS only

- One channel live smoke PASS → "engineering live ingest verified on staging"  
- SSO IdP PASS → "pilot SSO foundation for qualified workspace"  
- GO artifact + LOI → paid pilot scope per `era20-first-paid-pilot-package-2026-05-28.md`
