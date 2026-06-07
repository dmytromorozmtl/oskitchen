# Visual Floor Plan Editor — GTM & Sales Scale Playbook

<!-- pm-gtm: absolute-final-pm-marketing-full-scale-v1 task-137 feature-92 -->

> **pm-gtm-hero-banner** · **Oracle MICROS parity** drag-and-drop canvas — **BETA** visual editor
>
> Section zones, table shapes, Order Hub links. **Supabase Realtime** when configured; polling fallback otherwise — **not certified live occupancy** sync for all venues.
>
> **pm-gtm-dark-mode-note:** Plain markdown — readable in GitHub light and dark themes.

**Policy:** `floor-plan-gtm-scale-absolute-final-v1`  
**Product surface:** [`/dashboard/floor-plans`](/dashboard/floor-plans) · [`components/restaurant/floor-plan-editor.tsx`](../components/restaurant/floor-plan-editor.tsx) · `visual-floor-plan-editor-absolute-final-v1`  
**Related:** [`/dashboard/enterprise/multi-location`](/dashboard/enterprise/multi-location) · [`objection-handling.md`](./objection-handling.md) · [`/trust`](/trust)

---

## pm-gtm-icp-profile

### Ideal buyer

| Attribute | Fit |
|-----------|-----|
| Model | Full-service or multi-section dining room (patio, bar, main) needing visual table layout |
| Pain | Spreadsheet floor maps; wants drag-and-drop table placement before tableside ordering pilot |
| Stack | OS Kitchen tables + Order Hub; optional Supabase Realtime for live badge |
| Disqualifier | Requires certified live occupancy sensors, MICROS-certified deployment, or IoT table sensors today |

### Sales-safe wedge

> “**Oracle MICROS parity** canvas — drag tables, filter section zones, link orders. **BETA** editor with honest **Supabase Realtime** badge — **not certified live occupancy** for every venue.”

**Pilot wedge:** ≤5-location operator with one dining room — T+1 floor plan layout, T+3 tableside deep link from table card.

---

## pm-gtm-demo-hook

**12-minute demo path** (floor plans → tableside → multi-location):

1. Open [`/dashboard/floor-plans`](/dashboard/floor-plans) — show hero honesty banner and connection status badge.
2. Add table — drag on canvas, set **RECTANGLE** / **CIRCLE** / **SQUARE** shape, assign section zone.
3. Filter section zones — demonstrate patio vs main dining separation.
4. Click Order Hub link on occupied table — show order context without claiming live sensor sync.
5. Optional: open multi-location map — deep link `?locationId=` to location-scoped floor plan.
6. Close with **BETA** label — polling fallback when Realtime unavailable.

**Talk track:** “Layout and ops visibility — not a certified occupancy platform.”

---

## pm-gtm-objection-handling

| Objection | Response |
|-----------|----------|
| “Is this Oracle MICROS certified?” | **Oracle MICROS parity** UX reference — **BETA** editor, not certified MICROS deployment or support contract. |
| “Do tables update live when guests sit?” | **not certified live occupancy** — Realtime badge when Supabase configured; otherwise polling fallback. No IoT sensor claim. |
| “TouchBistro has floor plans.” | Competitors vary — our wedge is section zones + Order Hub links + multi-location context, with honest connection badge. |
| “We need real-time occupancy for fire code.” | Escalate to founder — do not verbal-commit sensor integrations; layout tool only in standard pilot. |

---

## pm-gtm-pricing-talk-track

- **Standard pilot:** Floor plan editor included — no separate “layout module” SKU on [`/pricing`](/pricing).
- **Multi-location enterprise:** Location context via multi-location map — custom minimum for 10+ sites with SI layout migration.
- **Tableside ordering add-on:** Bundle floor plan + handheld tableside flow in pilot Week 1 — label **BETA** until `/trust` updates.
- Anchor **sales-safe** claims; certified occupancy or MICROS deployment is custom SOW only.

---

## pm-gtm-primary-cta

| Motion | CTA |
|--------|-----|
| Single-location FSR prospect | “Pilot Week 1 — build floor plan, link first table to Order Hub, test tableside deep link.” |
| Multi-location ops lead | “Discovery call — demo location switcher + `/dashboard/floor-plans?locationId=` context banner.” |
| Enterprise RFP (occupancy sensors) | “Route to founder — attach RFP clause; no verbal-commit on live occupancy certification.” |

Primary links: [`/dashboard/floor-plans`](/dashboard/floor-plans) · [`/dashboard/enterprise/multi-location`](/dashboard/enterprise/multi-location)

---

## pm-gtm-honesty-guardrails

**Do **not** claim:**

- Certified Oracle MICROS deployment, support, or interoperability certification  
- Live occupancy or guest-presence sensors for all table types  
- Real-time sync guarantee without **Supabase Realtime** configured  
- TouchBistro / Resy floor-plan feature parity without **BETA** label  

**Always label:** **Oracle MICROS parity** (UX reference) · **BETA** · **not certified live occupancy** · **Supabase Realtime** scope · **sales-safe** talk tracks only  

**Human gate:** Founder + ops sign-off before any enterprise slide stating floor plan or occupancy scope.

---

## Wiring checklist

- [ ] `/trust` free of “live occupancy” forbidden claims  
- [ ] Sales deck links to `components/restaurant/floor-plan-editor.tsx` honesty banner language  
- [ ] Multi-location map pins deep-link to `/dashboard/floor-plans?locationId=`  
- [ ] Tableside ordering demo uses floor plan table card — no false LIVE badge  
