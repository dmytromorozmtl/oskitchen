/**
 * P2-47 — Product table thumbnail alt text: alt={productName} not empty string.
 *
 * @see docs/product-thumbnail-alt-text-p2-47.md
 * @see artifacts/product-thumbnail-alt-text-p2-47.json
 */

export const PRODUCT_THUMBNAIL_ALT_TEXT_P2_47_POLICY_ID =
  "product-thumbnail-alt-text-p2-47-v1" as const;

export const PRODUCT_THUMBNAIL_ALT_TEXT_P2_47_DOC =
  "docs/product-thumbnail-alt-text-p2-47.md" as const;

export const PRODUCT_THUMBNAIL_ALT_TEXT_P2_47_ARTIFACT =
  "artifacts/product-thumbnail-alt-text-p2-47.json" as const;

export const PRODUCT_THUMBNAIL_ALT_TEXT_P2_47_AUDIT_MODULE =
  "lib/frontend/product-thumbnail-alt-text-p2-47-audit.ts" as const;

export const PRODUCT_THUMBNAIL_ALT_TEXT_P2_47_CHECK_NPM_SCRIPT =
  "check:product-thumbnail-alt-text-p2-47" as const;

export const PRODUCT_THUMBNAIL_ALT_TEXT_P2_47_CI_NPM_SCRIPT =
  "test:ci:product-thumbnail-alt-text-p2-47" as const;

export const PRODUCT_THUMBNAIL_ALT_TEXT_P2_47_UNIT_TEST =
  "tests/unit/product-thumbnail-alt-text-p2-47.test.ts" as const;

export const PRODUCT_THUMBNAIL_ALT_TEXT_P2_47_CI_WORKFLOW = ".github/workflows/ci.yml" as const;

export const PRODUCT_THUMBNAIL_ALT_TEXT_P2_47_COMPONENT =
  "components/dashboard/product-table-image-cell.tsx" as const;

export const PRODUCT_THUMBNAIL_ALT_TEXT_P2_47_CALLER =
  "components/dashboard/product-manager.tsx" as const;

export const PRODUCT_THUMBNAIL_ALT_TEXT_P2_47_WIRING_PATHS = [
  PRODUCT_THUMBNAIL_ALT_TEXT_P2_47_DOC,
  PRODUCT_THUMBNAIL_ALT_TEXT_P2_47_ARTIFACT,
  PRODUCT_THUMBNAIL_ALT_TEXT_P2_47_AUDIT_MODULE,
  PRODUCT_THUMBNAIL_ALT_TEXT_P2_47_UNIT_TEST,
  PRODUCT_THUMBNAIL_ALT_TEXT_P2_47_CI_WORKFLOW,
  PRODUCT_THUMBNAIL_ALT_TEXT_P2_47_COMPONENT,
  PRODUCT_THUMBNAIL_ALT_TEXT_P2_47_CALLER,
] as const;
