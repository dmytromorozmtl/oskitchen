# UX / Design System Audit — Post Era 19

**Date:** 2026-05-28 · **HEAD:** `7b17ffa` · **Prior:** `docs/operator-ux-speed-audit-2026-05-28.md` (81/100)

**Operator UX score (post Era 19): 86/100** (+5). **WOW UX score: 62/100** (+18 vs Era 18 strip-only baseline for pillar surfaces).

---

## System-Wide Assessment

| Dimension | Score | Issues | Fix |
|-----------|------:|--------|-----|
| Visual hierarchy | 78 | Today page dense when briefing + legacy strips | Collapse legacy strips when briefing active (partially done) |
| Spacing/density | 75 | Dashboard vs POS/KDS inconsistency | Token pass post-pilot |
| Typography | 76 | Adequate; KDS readable | sustain |
| Navigation clarity | 62 | 701 pages, preview noise | Hide 40% preview from default nav |
| Role-based UX | **88** | Era 18 landing + Era 19 packs | sustain |
| Mobile responsiveness | 74 | Launch wizard mobile CTAs (C13) | field-test on tablets |
| Tablet (POS/KDS) | 80 | POS tablet policy + speed mode | pilot validate |
| Accessibility | 72 | Wizard labels improved; not full audit | a11y sweep P2 |
| Empty/error/loading | 78 | Briefing blocked/setup states | extend to all hubs |
| Permission-denied | **85** | Era 19 packing/production cards | extend wave |
| Deep links | **90** | era19 tile-link registry | sustain |
| CTA clarity | **85** | Next-action heroes era18+19 | reduce duplicate CTAs |

---

## Surface Table (Priority)

| Surface | UX | Clarity | Responsive | A11y | Operator speed | Issues | Fix |
|---------|---:|--------:|------------|-----:|---------------:|--------|-----|
| `/dashboard/today` | **88** | 90 | 78 | 72 | 85 | Strip overlap | briefing-first layout |
| Owner Daily Briefing | **85** | 88 | 75 | 70 | 88 | Alert noise risk | cap ranked actions to 3 |
| Launch Wizard | **80** | 85 | **82** | 75 | 82 | Parallel go-live pages | single entry CTA |
| Integration Health | **88** | 92 | 75 | 72 | 80 | Technical density | support `?mode=support` default for support |
| Order Hub | 85 | 88 | 72 | 70 | 85 | Live proof rows | sustain |
| POS Terminal | 82 | 80 | 85 | 70 | **88** | Speed mode discoverability | default for cashiers |
| POS Shifts | **85** | 88 | 80 | 72 | 82 | Still multi-step | sustain checklist |
| KDS | **88** | 90 | 88 | 75 | **90** | Poll vs realtime expectation | honest banner |
| Production Board | 82 | 85 | 75 | 70 | 80 | — | sustain |
| Production Calendar | **85** | 88 | 75 | 72 | 82 | Drill hero | sustain anchor |
| Packing | **84** | 86 | 72 | 70 | 82 | QC checklist | sustain |
| Storefront admin | 72 | 75 | 70 | 68 | 70 | Builder complexity | wizard handoff |
| Go-live | 78 | 80 | 72 | 70 | 75 | Duplicates wizard | merge messaging |
| Platform support | 80 | 82 | 70 | 68 | 78 | — | sustain deep links |
| Enterprise SSO setup | 80 | 85 | 72 | 72 | 75 | IdP proof external | inline proof status |

---

## Design System Gaps

- No unified **operator density** token set across dashboard vs kitchen vs POS
- **Wizards** (launch, SSO pilot, channel pilot) share patterns but not one component system
- **Tables/filters** on reports still heavier than order hub focus pattern
- Marketing site not audited here (live, separate)

---

## Top 20 UX Gaps (Post Era 19)

1. Nav still shows too many preview families  
2. No instrumented click-depth telemetry  
3. Owner still has parallel go-live + wizard paths  
4. Cashier speed mode not default  
5. Table service preview not labeled on floor  
6. Campaign/growth preview reachable  
7. Copilot preview without beta banner consistency  
8. Storefront builder overwhelming vs wizard  
9. Reports lack briefing-style next actions  
10. Mobile Today briefing scroll length  
11. Integration health technical for non-support owners  
12. KDS realtime expectation vs 15s poll  
13. Permission-denied not universal  
14. Dark mode / contrast not certified  
15. Keyboard shortcuts sparse on POS  
16. Haptic/audio feedback absent on KDS bump  
17. Multi-location switcher polish  
18. Empty states uneven on preview modules  
19. Error recovery links sometimes loop gated routes (era19 fix partial)  
20. No unified "command center" brand for ops pillars  

---

## What Era 19 Fixed (UX)

- Owner Daily Briefing as real command surface (not just strips)
- Launch Wizard progress + mobile polish
- Integration Health honest status + recovery
- KDS priority lane + allergen/overdue scoring
- POS speed mode, shift closeout checklist, manager override checklist
- Packing/production QC clarity checklists
- Permission-denied cards on 9 packing/production routes
