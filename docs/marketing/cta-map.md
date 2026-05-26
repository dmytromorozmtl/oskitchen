# CTA Map

This is a first-pass funnel map for the current public marketing surface.

## Principles

1. Each page should have one primary CTA.
2. Secondary CTA should support the same funnel stage, not compete with it.
3. Tracking events should be explicit and consistent.
4. CTA copy must match module readiness and claims governance.

| Page | Primary CTA | Secondary CTA | Target User | Funnel Stage | Tracking Event | Next Step |
|------|-------------|---------------|-------------|--------------|----------------|-----------|
| `/` | Start free trial | Book demo | self-serve operator / evaluator | consideration | `cta_home_start_trial` | signup or guided demo |
| `/pricing` | Start free trial | Book demo | pricing-sensitive evaluator | decision | `cta_pricing_start_trial` | signup |
| `/demo` | Explore demo workspace | Start free trial | curious evaluator / investor / partner | consideration | `cta_demo_launch` | demo -> trial |
| `/book-demo` | Book demo | View pricing | higher-intent buyer | decision | `cta_book_demo_submit` | sales follow-up |
| `/customers` | Start free trial | Book demo | proof-seeking evaluator | consideration | `cta_customers_start_trial` | trial |
| `/partners` | Apply to partner | Book demo | agency / integration partner | evaluation | `cta_partners_apply` | partner review |
| `/compare/[slug]` | Start free trial | Book demo | competitor-aware evaluator | decision | `cta_compare_start_trial` | trial |
| `/solutions/[slug]` | Start free trial | Book demo | role/segment-specific operator | consideration | `cta_solutions_start_trial` | trial |
| `/roi-calculator` | Start free trial | Book demo | ROI-focused evaluator | decision | `cta_roi_start_trial` | trial or sales |
| `/case-studies/[slug]` | Start free trial | Book demo | proof-seeking evaluator | decision | `cta_case_study_start_trial` | trial |

## Gaps To Fix

1. Ensure every primary CTA has a named analytics event.
2. Align CTA copy with `config/product/module-readiness.json`.
3. Keep case-study and compare pages honest when capabilities are still beta or pilot-only.
4. Avoid CTA overload on pages that already ask for form submission.
