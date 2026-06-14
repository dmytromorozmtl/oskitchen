import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditBlueprintRegistryP245,
  formatBlueprintRegistryP245AuditLines,
  readBlueprintRegistryArtifact,
} from "@/lib/devops/blueprint-registry-p2-45-audit";
import {
  BLUEPRINT_REGISTRY_P2_45_ARTIFACT,
  BLUEPRINT_REGISTRY_P2_45_CHECK_NPM_SCRIPT,
  BLUEPRINT_REGISTRY_P2_45_CI_NPM_SCRIPT,
  BLUEPRINT_REGISTRY_P2_45_CI_WORKFLOW,
  BLUEPRINT_REGISTRY_P2_45_DOC,
  BLUEPRINT_REGISTRY_P2_45_POLICY_ID,
  BLUEPRINT_REGISTRY_P2_45_PRODUCTION_HEALTH_URL,
  BLUEPRINT_REGISTRY_P2_45_SENTRY_TASK_ID,
  BLUEPRINT_REGISTRY_P2_45_SYNC_TARGETS,
  BLUEPRINT_REGISTRY_P2_45_WIRING_PATHS,
  isBlueprintRegistrySentryLive,
} from "@/lib/devops/blueprint-registry-p2-45-policy";

const ROOT = process.cwd();

function readSource(relativePath: string): string {
  return readFileSync(join(ROOT, relativePath), "utf8");
}

describe("Blueprint registry — Sentry production sync (P2-45)", () => {
  it("locks P2-45 policy and production health URL", () => {
    expect(BLUEPRINT_REGISTRY_P2_45_POLICY_ID).toBe("blueprint-registry-p2-45-v1");
    expect(BLUEPRINT_REGISTRY_P2_45_SENTRY_TASK_ID).toBe("1-sentry-dsn-production");
    expect(BLUEPRINT_REGISTRY_P2_45_PRODUCTION_HEALTH_URL).toBe(
      "https://os-kitchen.com/api/health",
    );
    expect(BLUEPRINT_REGISTRY_P2_45_SYNC_TARGETS.length).toBeGreaterThanOrEqual(4);
  });

  it("recognizes live Sentry health check", () => {
    expect(isBlueprintRegistrySentryLive({ ok: true, status: "live" })).toBe(true);
    expect(isBlueprintRegistrySentryLive({ ok: false, status: "not_configured" })).toBe(false);
    expect(isBlueprintRegistrySentryLive({ ok: true, status: "configured" })).toBe(false);
  });

  it("passes full P2-45 audit — registry, trackers, and health route aligned", () => {
    const summary = auditBlueprintRegistryP245(ROOT);
    expect(summary.registryPresent).toBe(true);
    expect(summary.sentryOk).toBe(true);
    expect(summary.blueprintTrackerDone).toBe(true);
    expect(summary.sentryUnblockStatusDone).toBe(true);
    expect(summary.absoluteFinalTrackerDone).toBe(true);
    expect(summary.healthRouteWired).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("blueprint-registry artifact marks Sentry done with ok:true", () => {
    const artifact = readBlueprintRegistryArtifact(ROOT);
    expect(artifact?.policyId).toBe(BLUEPRINT_REGISTRY_P2_45_POLICY_ID);
    const sentry = artifact?.items?.[BLUEPRINT_REGISTRY_P2_45_SENTRY_TASK_ID];
    expect(sentry?.ok).toBe(true);
    expect(sentry?.status).toBe("done");
    expect(sentry?.healthCheck?.sentryServer?.status).toBe("live");
    expect(artifact?.blockedItems).toEqual([]);
  });

  it("P2-45 wiring paths exist including doc, artifact, and CI gate", () => {
    for (const path of BLUEPRINT_REGISTRY_P2_45_WIRING_PATHS) {
      expect(existsSync(join(ROOT, path)), `missing: ${path}`).toBe(true);
    }

    const pkg = readSource("package.json");
    expect(pkg).toContain(`"${BLUEPRINT_REGISTRY_P2_45_CHECK_NPM_SCRIPT}"`);
    expect(pkg).toContain(`"${BLUEPRINT_REGISTRY_P2_45_CI_NPM_SCRIPT}"`);

    const ci = readSource(BLUEPRINT_REGISTRY_P2_45_CI_WORKFLOW);
    expect(ci).toContain(BLUEPRINT_REGISTRY_P2_45_CHECK_NPM_SCRIPT);

    const doc = readSource(BLUEPRINT_REGISTRY_P2_45_DOC);
    expect(doc).toContain(BLUEPRINT_REGISTRY_P2_45_POLICY_ID);
    expect(doc).toContain(BLUEPRINT_REGISTRY_P2_45_ARTIFACT);

    expect(existsSync(join(ROOT, BLUEPRINT_REGISTRY_P2_45_ARTIFACT))).toBe(true);
  });

  it("formats audit lines", () => {
    const summary = auditBlueprintRegistryP245(ROOT);
    const lines = formatBlueprintRegistryP245AuditLines(summary);
    expect(lines.some((line) => line.includes(BLUEPRINT_REGISTRY_P2_45_POLICY_ID))).toBe(true);
    expect(lines.some((line) => line.includes("Passed: YES"))).toBe(true);
  });
});
