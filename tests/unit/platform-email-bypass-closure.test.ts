import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

const SCAN_ROOTS = ["app", "actions", "lib"] as const;

/** Bootstrap / seed only — runtime authorization must not call these outside allowlist. */
const IS_SUPER_ADMIN_EMAIL_ALLOWLIST = new Set([
  "lib/platform-owner.ts",
  "lib/platform-admin.ts",
]);

/** Deprecated helper re-export — must not be used for runtime gates in scanned trees. */
const IS_SUPER_ADMIN_EMAIL_REEXPORT_ALLOWLIST = new Set(["lib/auth/is-superadmin.ts"]);

const SUPERADMIN_EMAIL_CONST_ALLOWLIST = new Set(["lib/platform-owner.ts"]);

/** Founder email string may appear in bootstrap constants or non-auth UI copy. */
const HARDCODED_FOUNDER_EMAIL_ALLOWLIST = new Set([
  "lib/platform-owner.ts",
  "lib/platform/platform-roles.ts",
  "app/dashboard/product-mapping/settings/page.tsx",
  "app/dashboard/sales-channels/assistant/page.tsx",
]);

function collectTsFiles(dir: string, acc: string[] = []): string[] {
  const full = join(ROOT, dir);
  if (!statSync(full).isDirectory()) return acc;
  for (const entry of readdirSync(full)) {
    const path = join(full, entry);
    const stat = statSync(path);
    if (stat.isDirectory()) {
      if (entry === "node_modules" || entry === ".next") continue;
      collectTsFiles(relative(ROOT, path), acc);
    } else if (/\.(ts|tsx)$/.test(entry)) {
      acc.push(relative(ROOT, path));
    }
  }
  return acc;
}

function findPatternHits(files: string[], pattern: RegExp): string[] {
  const hits: string[] = [];
  for (const file of files) {
    const content = readFileSync(join(ROOT, file), "utf8");
    if (pattern.test(content)) hits.push(file);
  }
  return hits.sort();
}

function findViolations(files: string[], pattern: RegExp, allowlist: Set<string>): string[] {
  return findPatternHits(files, pattern).filter((file) => !allowlist.has(file));
}

describe("platform email bypass closure", () => {
  const runtimeFiles = SCAN_ROOTS.flatMap((dir) => collectTsFiles(dir));

  it("has no isSuperAdminEmail calls outside bootstrap allowlist in app/actions/lib", () => {
    const hits = findPatternHits(runtimeFiles, /isSuperAdminEmail\s*\(/);
    const violations = hits.filter(
      (file) =>
        !IS_SUPER_ADMIN_EMAIL_ALLOWLIST.has(file) && !IS_SUPER_ADMIN_EMAIL_REEXPORT_ALLOWLIST.has(file),
    );
    expect(violations).toEqual([]);
  });

  it("has no SUPERADMIN_EMAIL constant outside bootstrap allowlist", () => {
    expect(findViolations(runtimeFiles, /SUPERADMIN_EMAIL/, SUPERADMIN_EMAIL_CONST_ALLOWLIST)).toEqual([]);
  });

  it("has no hardcoded founder email in permission/runtime code outside allowlist", () => {
    expect(
      findViolations(runtimeFiles, /workspace\.moroz@gmail\.com/, HARDCODED_FOUNDER_EMAIL_ALLOWLIST),
    ).toEqual([]);
  });

  it("documents bootstrap-only platform owner module", () => {
    const content = readFileSync(join(ROOT, "lib/platform-owner.ts"), "utf8");
    expect(content).toContain("Bootstrap-only");
    expect(content).toContain("@deprecated");
    expect(content).toContain("hasSuperAdminRoleRow");
  });

  it("keeps sync isSuperAdmin UI helper fail-closed", async () => {
    const { isSuperAdmin } = await import("@/lib/auth/is-superadmin");
    expect(isSuperAdmin({ email: "workspace.moroz@gmail.com" })).toBe(false);
    expect(isSuperAdmin(null)).toBe(false);
  });
});
