import { describe, expect, it } from "vitest";

import {
  buildImportCenterSubnavLinks,
  IMPORT_CENTER_SUBNAV_LINKS,
} from "@/lib/import-center/import-center-subnav-links";
import {
  canCancelImportJob,
  canCommitImportJob,
  canManageImportCenterSettings,
  canRollbackImportJob,
  canUploadAnyImportType,
  canUploadImportType,
  canUseImportCenterCapability,
  canViewImportCenterHub,
  resolveImportCenterJobPermissions,
  workspacePermissionForImportType,
} from "@/lib/import-center/workspace-import-permission";
import type { PermissionKey } from "@/lib/permissions/permissions";

function granted(...keys: PermissionKey[]) {
  return new Set(keys) as ReadonlySet<PermissionKey>;
}

describe("import center canonical RBAC", () => {
  it("maps import types to domain permissions", () => {
    expect(workspacePermissionForImportType("CUSTOMERS")).toBe("customers.manage");
    expect(workspacePermissionForImportType("STAFF")).toBe("staff.manage");
    expect(workspacePermissionForImportType("PRODUCTS")).toBe("products.edit");
  });

  it("allows hub view with production.manage", () => {
    expect(canViewImportCenterHub(granted("production.manage"))).toBe(true);
  });

  it("allows product upload via production.manage", () => {
    expect(canUploadImportType(granted("production.manage"), "INGREDIENTS")).toBe(true);
  });

  it("requires customers.manage for customer imports", () => {
    expect(canUploadImportType(granted("production.manage"), "CUSTOMERS")).toBe(false);
    expect(canUploadImportType(granted("customers.manage"), "CUSTOMERS")).toBe(true);
  });

  it("restricts commit to workspace.settings", () => {
    expect(canUseImportCenterCapability(granted("products.edit"), "import.commit")).toBe(false);
    expect(canUseImportCenterCapability(granted("workspace.settings"), "import.commit")).toBe(true);
  });

  it("filters subnav for read-only operators", () => {
    const links = buildImportCenterSubnavLinks({
      canViewHub: true,
      canUpload: false,
      canManageSettings: false,
    });
    expect(links.some((l) => l.href.includes("/upload"))).toBe(false);
    expect(links.some((l) => l.href.includes("/settings"))).toBe(false);
    expect(links.length).toBeLessThan(IMPORT_CENTER_SUBNAV_LINKS.length);
  });

  it("exposes upload when any upload permission exists", () => {
    expect(canUploadAnyImportType(granted("orders.manage"))).toBe(true);
    expect(canManageImportCenterSettings(granted("products.edit"))).toBe(false);
  });

  it("requires workspace.settings and type permission to commit", () => {
    expect(canCommitImportJob(granted("products.edit"), "PRODUCTS")).toBe(false);
    expect(
      canCommitImportJob(granted("workspace.settings", "products.edit"), "PRODUCTS"),
    ).toBe(true);
    expect(
      canCommitImportJob(granted("workspace.settings", "products.edit"), "CUSTOMERS"),
    ).toBe(false);
  });

  it("scopes cancel to import type upload permission", () => {
    expect(canCancelImportJob(granted("products.edit"), "CUSTOMERS")).toBe(false);
    expect(canCancelImportJob(granted("customers.manage"), "CUSTOMERS")).toBe(true);
  });

  it("resolves job action permissions for UI gates", () => {
    const perms = resolveImportCenterJobPermissions(
      granted("customers.manage"),
      "CUSTOMERS",
      { committable: true },
    );
    expect(perms.canCancel).toBe(true);
    expect(perms.canCommit).toBe(false);
    expect(perms.canRollback).toBe(false);
    expect(canRollbackImportJob(granted("workspace.settings"))).toBe(true);
  });
});
