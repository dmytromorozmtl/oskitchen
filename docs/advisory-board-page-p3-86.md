# Advisory board page — honest recruiting mode (P3-86)

**Policy:** `advisory-board-page-p3-86-v1`  
**Updated:** 2026-06-16  
**Route:** `/advisory-board`  
**Page mode:** `recruiting_application_only`

Gap closure: remove risk of fabricated advisory board members. The public page is an **application form only** until real operators opt in with written permission.

---

## Decision

| Option | Verdict |
|--------|---------|
| **Fabricated advisor grid** | **Rejected** — no placeholder names, headshots, or "meet our board" copy |
| **Remove `/advisory-board` route** | **Rejected** — live application flow + dashboard review exist |
| **Honest recruiting page** | **Accepted** — apply form + zero published members disclosed |

## Published members

**Count: 0** — names/logos appear only after explicit permission ([`CUSTOMER_ADVISORY_BOARD.md`](./CUSTOMER_ADVISORY_BOARD.md)).

## Page requirements

| Check | Status |
|-------|--------|
| Application form wired | `submitAdvisoryBoardApplicationFormAction` |
| Honesty block visible | `data-testid="advisory-board-honesty"` |
| No advisor member grid | No `advisor-card` / fake profile components |
| Forbidden patterns absent | No "our advisors include", "former CEO of", etc. |
| Feedback program disclaimer | Not a paid customer or investor board claim |

## Ideal operator profiles

- Meal prep owners (100+ weekly orders)
- Catering managers with repeat events
- Bakery preorder operators
- Ghost / cloud kitchen operators

Target group: **5–10 operators**.

## CI

```bash
npm run check:advisory-board-page-p3-86
```

## Artifact

`artifacts/advisory-board-page-p3-86.json`
