import { describe, expect, it } from "vitest";

import { resolveVisibleExportTypes } from "@/lib/import-export/export-page-access";
import { defaultPermissionsForWorkspaceRole } from "@/lib/permissions/permissions";

const ownerGranted = defaultPermissionsForWorkspaceRole("OWNER");
const ownerWithoutAudit = new Set(
  [...ownerGranted].filter((key) => key !== "audit.export"),
);

describe("resolveVisibleExportTypes", () => {
  it("hides audit_logs when bootstrap email actor lacks SUPER_ADMIN role row", () => {
    const types = resolveVisibleExportTypes({
      granted: ownerGranted,
      isPlatformSuperAdmin: false,
    });

    expect(types).not.toContain("audit_logs");
    expect(types).toContain("orders");
  });

  it("shows audit_logs when SUPER_ADMIN role row exists and audit.export is granted", () => {
    const types = resolveVisibleExportTypes({
      granted: ownerGranted,
      isPlatformSuperAdmin: true,
    });

    expect(types).toContain("audit_logs");
  });

  it("hides audit_logs when SUPER_ADMIN role exists but audit.export is missing", () => {
    const types = resolveVisibleExportTypes({
      granted: ownerWithoutAudit,
      isPlatformSuperAdmin: true,
    });

    expect(types).not.toContain("audit_logs");
  });
});
