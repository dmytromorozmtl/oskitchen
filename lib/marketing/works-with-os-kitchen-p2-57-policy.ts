/**
 * P2-57 — Works with OS Kitchen: 17 LIVE integrations with logos + status.
 *
 * @see docs/works-with-os-kitchen-p2-57.md
 * @see app/works-with-os-kitchen/page.tsx
 */

import { LIVE_INTEGRATION_REGISTRY_LIVE_COUNT } from "@/lib/integrations/live-integration-dod-smoke-era17-policy";

export const WORKS_WITH_OS_KITCHEN_P2_57_POLICY_ID =
  "works-with-os-kitchen-p2-57-v1" as const;

export const WORKS_WITH_OS_KITCHEN_P2_57_DOC = "docs/works-with-os-kitchen-p2-57.md" as const;

export const WORKS_WITH_OS_KITCHEN_P2_57_ARTIFACT =
  "artifacts/works-with-os-kitchen-p2-57.json" as const;

export const WORKS_WITH_OS_KITCHEN_P2_57_PUBLIC_ROUTE = "/works-with-os-kitchen" as const;

export const WORKS_WITH_OS_KITCHEN_P2_57_PAGE = "app/works-with-os-kitchen/page.tsx" as const;

export const WORKS_WITH_OS_KITCHEN_P2_57_GRID_COMPONENT =
  "components/marketing/works-with-os-kitchen-integration-grid.tsx" as const;

export const WORKS_WITH_OS_KITCHEN_P2_57_CONTENT_MODULE =
  "lib/marketing/works-with-os-kitchen-p2-57-content.ts" as const;

export const WORKS_WITH_OS_KITCHEN_P2_57_AUDIT_MODULE =
  "lib/marketing/works-with-os-kitchen-p2-57-audit.ts" as const;

export const WORKS_WITH_OS_KITCHEN_P2_57_CHECK_NPM_SCRIPT =
  "check:works-with-os-kitchen-p2-57" as const;

export const WORKS_WITH_OS_KITCHEN_P2_57_CI_NPM_SCRIPT =
  "test:ci:works-with-os-kitchen-p2-57" as const;

export const WORKS_WITH_OS_KITCHEN_P2_57_UNIT_TEST =
  "tests/unit/works-with-os-kitchen-p2-57.test.ts" as const;

export const WORKS_WITH_OS_KITCHEN_P2_57_CI_WORKFLOW = ".github/workflows/ci.yml" as const;

export const WORKS_WITH_OS_KITCHEN_P2_57_GRID_TEST_ID =
  "works-with-os-kitchen-integration-grid-p2-57" as const;

export const WORKS_WITH_OS_KITCHEN_P2_57_LIVE_COUNT = LIVE_INTEGRATION_REGISTRY_LIVE_COUNT;

export const WORKS_WITH_OS_KITCHEN_P2_57_LOGO_DIR = "public/integrations/logos" as const;

export const WORKS_WITH_OS_KITCHEN_P2_57_HONESTY_MARKERS = [
  "registry status",
  "workspace credentials",
  "LIVE scaffold",
  "not a blanket connected badge",
] as const;

export const WORKS_WITH_OS_KITCHEN_P2_57_WIRING_PATHS = [
  WORKS_WITH_OS_KITCHEN_P2_57_DOC,
  WORKS_WITH_OS_KITCHEN_P2_57_ARTIFACT,
  WORKS_WITH_OS_KITCHEN_P2_57_AUDIT_MODULE,
  WORKS_WITH_OS_KITCHEN_P2_57_CONTENT_MODULE,
  WORKS_WITH_OS_KITCHEN_P2_57_GRID_COMPONENT,
  WORKS_WITH_OS_KITCHEN_P2_57_PAGE,
  WORKS_WITH_OS_KITCHEN_P2_57_UNIT_TEST,
  WORKS_WITH_OS_KITCHEN_P2_57_CI_WORKFLOW,
  "lib/integrations/integration-registry.ts",
  "artifacts/smoke-live-integration-dod-summary.json",
] as const;
