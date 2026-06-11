/**
 * Blueprint P1-59 — Permission-denied state (icon + message + Request access).
 *
 * @see components/ui/permission-denied-card.tsx
 * @see lib/design/permission-denied-patterns.ts
 */

export const PERMISSION_DENIED_STATE_POLICY_ID = "permission-denied-state-p1-59-v1" as const;

export const PERMISSION_DENIED_STATE_MODULE =
  "components/ui/permission-denied-card.tsx" as const;

export const PERMISSION_DENIED_STATE_REQUEST_ACCESS_LABEL = "Request access" as const;

export const PERMISSION_DENIED_STATE_REQUEST_ACCESS_HREF = "/dashboard/staff" as const;

export const PERMISSION_DENIED_STATE_REQUEST_ACCESS_TEST_ID =
  "permission-denied-request-access" as const;

export const PERMISSION_DENIED_STATE_ICON_CONTAINER_CLASS =
  "mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive sm:mx-0" as const;

export const PERMISSION_DENIED_STATE_REQUIRED_ELEMENTS = [
  "icon",
  "message",
  "request_access",
] as const;

export type PermissionDeniedStateElement =
  (typeof PERMISSION_DENIED_STATE_REQUIRED_ELEMENTS)[number];

export const PERMISSION_DENIED_STATE_AUDIT_SCRIPT =
  "scripts/audit-permission-denied-state.ts" as const;

export const PERMISSION_DENIED_STATE_NPM_SCRIPT = "audit:permission-denied-state" as const;

export const PERMISSION_DENIED_STATE_UNIT_TEST =
  "tests/unit/permission-denied-state.test.ts" as const;

export const PERMISSION_DENIED_STATE_CI_WORKFLOW =
  ".github/workflows/deploy-prod-gate.yml" as const;

export {
  PERMISSION_DENIED_CARD_CLASS,
  PERMISSION_DENIED_CARD_TEST_ID,
} from "@/lib/design/permission-denied-patterns";
