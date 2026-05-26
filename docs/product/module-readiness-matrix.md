# Module Readiness Matrix

Primary machine-readable source:

- `config/product/module-readiness.json`

This matrix exists to prevent unfinished capability exposure and to give
engineering, CS, onboarding, GTM, and platform ops a single language for module
status.

## Status Meanings

- `GA` — safe to expose by default, market, and support as standard product capability
- `BETA` — usable and real, but still subject to narrower enablement and rollout caution
- `PILOT_ONLY` — real enough for controlled pilots, not safe for broad default exposure
- `INTERNAL` — internal/operator/platform use only
- `HIDDEN` — roadmap only; not exposed by default

## Current Operating Principles

1. A module must not be exposed broadly just because code exists.
2. `PILOT_ONLY` and `BETA` are different:
   - `BETA` is visible with honest caveats
   - `PILOT_ONLY` should require explicit enablement and operator context
3. Business type matters:
   - `MEAL_PREP`, `CATERING`, `GHOST_KITCHEN`, `FULL_SERVICE`, `COMMISSARY`,
     `FOOD_TRUCK`, and `BAKERY` do not need the same default stack.
4. Marketing copy must align with this matrix.

## Recommended UI / Product Behavior

- `GA`
  - visible by default
  - no special badge required
- `BETA`
  - visible when enabled
  - should show a `Beta` badge where helpful
- `PILOT_ONLY`
  - hidden by default unless tenant/program flag allows it
  - should show explicit pilot messaging
- `INTERNAL`
  - not visible to normal operators
- `HIDDEN`
  - not rendered in operator navigation

## Current Wiring

This matrix is now partially wired into the dashboard experience:

- sidebar navigation shows readiness badges for non-GA modules
- route-level notices appear for `Beta` and `Pilot` modules
- settings/white-label now inherits the same pilot-only honesty
- pilot-only modules are disabled by default for a normal workspace until that workspace is
  explicitly enrolled and then enabled
- dashboard module settings now distinguish between:
  - tenant preference (`enabled` / `disabled`)
  - platform pilot enrollment (`workspace_feature_overrides`)
- platform ops can manage pilot workspace cohorts from `platform/feature-flags`

This is now a real tenant-specific rollout layer for pilot modules without new
schema churn. It is still intentionally narrow: it controls pilot readiness
exposure, not arbitrary experiment assignment or percentage rollout.

## Default Business-Type Guidance

### Meal prep

Prioritize:

- storefront
- production
- packing
- routes
- nutrition labels
- customers / CRM

### Catering

Prioritize:

- storefront
- catering quotes
- production
- packing
- routes
- CRM

### Ghost kitchen

Prioritize:

- storefront
- POS
- KDS
- production
- channels / integrations
- routes

### Full service

Prioritize:

- POS
- KDS
- storefront
- staff / schedule
- reservations or QR ordering only when actually shipped

### Commissary

Prioritize:

- production
- packing
- routes
- purchasing
- analytics

### Food truck

Prioritize:

- POS
- handheld / mobile web
- limited storefront
- routes

### Bakery

Prioritize:

- storefront
- production
- packing
- POS
- purchasing

## Current Reality

Most important truth today:

- KitchenOS is strongest in the combined operator loop:
  `storefront + POS + production + packing + routes`
- several adjacent modules are real but not yet category-complete:
  `copilot`, `food_safety`, `accounting`, `white_label`

This matrix should be updated whenever:

1. a pilot-only feature moves to beta,
2. a beta feature becomes safe for broad onboarding,
3. GTM wants to market a capability more aggressively than product reality.
