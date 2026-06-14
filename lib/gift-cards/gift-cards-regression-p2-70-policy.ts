/**
 * P2-70 — Gift cards issue/redeem regression: issue → balance → partial → balance → remaining.
 *
 * @see docs/gift-cards-regression-p2-70.md
 */

export const GIFT_CARDS_REGRESSION_P2_70_POLICY_ID =
  "gift-cards-regression-p2-70-v1" as const;

export const GIFT_CARDS_REGRESSION_P2_70_DOC =
  "docs/gift-cards-regression-p2-70.md" as const;

export const GIFT_CARDS_REGRESSION_P2_70_ARTIFACT =
  "artifacts/gift-cards-regression-p2-70.json" as const;

export const GIFT_CARDS_REGRESSION_P2_70_FLOW_MODULE =
  "lib/gift-cards/gift-cards-regression-p2-70-flow.ts" as const;

export const GIFT_CARDS_REGRESSION_P2_70_CORPUS_MODULE =
  "lib/gift-cards/gift-cards-regression-p2-70-corpus.ts" as const;

export const GIFT_CARDS_REGRESSION_P2_70_SCORING_MODULE =
  "lib/gift-cards/gift-cards-regression-p2-70-scoring.ts" as const;

export const GIFT_CARDS_REGRESSION_P2_70_AUDIT_MODULE =
  "lib/gift-cards/gift-cards-regression-p2-70-audit.ts" as const;

export const GIFT_CARDS_REGRESSION_P2_70_GIFT_CARD_SERVICE =
  "services/gift-cards/gift-card-service.ts" as const;

export const GIFT_CARDS_REGRESSION_P2_70_POS_CHECKOUT_SERVICE =
  "services/pos/pos-checkout-service.ts" as const;

export const GIFT_CARDS_REGRESSION_P2_70_DASHBOARD_PAGE =
  "app/dashboard/gift-cards/page.tsx" as const;

export const GIFT_CARDS_REGRESSION_P2_70_ISSUE_FORM =
  "components/gift-cards/gift-card-issue-form.tsx" as const;

export const GIFT_CARDS_REGRESSION_P2_70_CHECK_NPM_SCRIPT =
  "check:gift-cards-regression-p2-70" as const;

export const GIFT_CARDS_REGRESSION_P2_70_CI_NPM_SCRIPT =
  "test:ci:gift-cards-regression-p2-70" as const;

export const GIFT_CARDS_REGRESSION_P2_70_UNIT_TEST =
  "tests/unit/gift-cards-regression-p2-70.test.ts" as const;

export const GIFT_CARDS_REGRESSION_P2_70_CI_WORKFLOW =
  ".github/workflows/ci.yml" as const;

export const GIFT_CARDS_REGRESSION_P2_70_SCENARIO_COUNT = 8 as const;

export const GIFT_CARDS_REGRESSION_P2_70_FLOW_STEPS = [
  "issue",
  "balance_check",
  "redeem_partial",
  "balance_after_partial",
  "redeem_remaining",
] as const;

export const GIFT_CARDS_REGRESSION_P2_70_WIRING_PATHS = [
  GIFT_CARDS_REGRESSION_P2_70_DOC,
  GIFT_CARDS_REGRESSION_P2_70_ARTIFACT,
  GIFT_CARDS_REGRESSION_P2_70_FLOW_MODULE,
  GIFT_CARDS_REGRESSION_P2_70_CORPUS_MODULE,
  GIFT_CARDS_REGRESSION_P2_70_SCORING_MODULE,
  GIFT_CARDS_REGRESSION_P2_70_AUDIT_MODULE,
  GIFT_CARDS_REGRESSION_P2_70_UNIT_TEST,
  GIFT_CARDS_REGRESSION_P2_70_CI_WORKFLOW,
  GIFT_CARDS_REGRESSION_P2_70_GIFT_CARD_SERVICE,
  GIFT_CARDS_REGRESSION_P2_70_POS_CHECKOUT_SERVICE,
  GIFT_CARDS_REGRESSION_P2_70_DASHBOARD_PAGE,
  GIFT_CARDS_REGRESSION_P2_70_ISSUE_FORM,
  "components/gift-cards/gift-card-list.tsx",
  "actions/gift-cards.ts",
] as const;
