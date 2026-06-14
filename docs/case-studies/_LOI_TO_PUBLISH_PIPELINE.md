# Case study pipeline checklist — [design-partner-slug]

**Policy:** `case-study-template-pipeline-p2-56-v1`  
**Status:** Internal — do not publish until day 30 gates pass  
**Canonical guide:** [`../case-study-template-pipeline-p2-56.md`](../case-study-template-pipeline-p2-56.md)

Copy this file to `docs/case-studies/<slug>-pipeline-checklist.md` when outreach begins.

---

## Stage: `pre_loi_template`

| Check | Done |
|-------|:----:|
| Used [`case-study-template-pre-pilot.md`](../case-study-template-pre-pilot.md) for founder story deck | ☐ |
| No customer name or fabricated metrics in external copy | ☐ |
| LOI sent from [`loi-design-partner-template.md`](../loi-design-partner-template.md) | ☐ |

---

## Stage: `loi_signed_internal_draft`

| Check | Done |
|-------|:----:|
| LOI countersigned — `loiSignedDate` recorded | ☐ |
| Milestone draft copied from [`_MILESTONE_TEMPLATE.md`](./_MILESTONE_TEMPLATE.md) | ☐ |
| Challenge + Solution sections filled (internal only) | ☐ |

---

## Stage: `pilot_active_w1`

| Check | Done |
|-------|:----:|
| Pilot start date recorded: `[PILOT_START_DATE]` | ☐ |
| Publish review date (start + 30 days): `[PUBLISH_REVIEW_DATE]` | ☐ |
| W1 results captured — label unverified metrics `(target)` | ☐ |
| `npm run smoke:pilot-metrics-baseline` scheduled for week 1 | ☐ |

---

## Stage: `pilot_day_30_publish_review`

Eligible on or after **Day 30** from pilot start.

| Check | Done |
|-------|:----:|
| ≥30 days since pilot start | ☐ |
| M1 metric rows completed in milestone draft | ☐ |
| Customer permission: ☐ named ☐ anonymized ☐ pending | ☐ |
| Publish gates in [`case-study-template.md`](../case-study-template.md) reviewed | ☐ |
| Forbidden claims smoke PASS | ☐ |

---

## Stage: `published_post_gates`

| Check | Done |
|-------|:----:|
| Legal sign-off on quote and metrics table | ☐ |
| Entry added to `lib/marketing/case-studies.ts` with `status: "published"` | ☐ |
| Slug added to sitemap when public | ☐ |

---

## Honesty reminders

- **Internal draft only** until customer permission + verified metrics
- No LIVE integration claims beyond registry truth
- Founder voice ≠ operator testimonial
