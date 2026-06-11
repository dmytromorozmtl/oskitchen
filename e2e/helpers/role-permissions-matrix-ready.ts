import { test } from "@playwright/test";

import {
  hasRolePermissionsMatrixCredentials,
  isRolePermissionsMatrixE2EEnabled,
} from "@/lib/qa/role-permissions-matrix-e2e-policy";

export function skipRolePermissionsMatrixIfGateDisabled(): void {
  if (!isRolePermissionsMatrixE2EEnabled()) {
    test.skip(
      true,
      "Role permissions matrix owner smoke E2E SKIPPED — set E2E_ROLE_PERMISSIONS_MATRIX=true",
    );
  }
}

export function skipRolePermissionsMatrixIfNotAuthed(): void {
  if (!hasRolePermissionsMatrixCredentials()) {
    test.skip(
      true,
      "Role permissions matrix owner smoke E2E SKIPPED — missing E2E_LOGIN_EMAIL / E2E_LOGIN_PASSWORD",
    );
  }
}
