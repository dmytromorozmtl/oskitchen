import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditNoopV1FallbackPolicy,
  OFFLINE_PCI_NOOP_V1_REVIEW_POLICY_ID,
} from "@/lib/pos/offline-pci-noop-v1-review";
import {
  OFFLINE_POS_FULL_MODE_P1_31_ARTIFACT,
  OFFLINE_POS_FULL_MODE_P1_31_CHECK_NPM_SCRIPT,
  OFFLINE_POS_FULL_MODE_P1_31_CI_NPM_SCRIPT,
  OFFLINE_POS_FULL_MODE_P1_31_CI_WORKFLOW,
  OFFLINE_POS_FULL_MODE_P1_31_COMPONENT,
  OFFLINE_POS_FULL_MODE_P1_31_DOC,
  OFFLINE_POS_FULL_MODE_P1_31_ENCRYPTION,
  OFFLINE_POS_FULL_MODE_P1_31_FLOW_STEPS,
  OFFLINE_POS_FULL_MODE_P1_31_MENU_CACHE,
  OFFLINE_POS_FULL_MODE_P1_31_POLICY_ID,
  OFFLINE_POS_FULL_MODE_P1_31_TERMINAL_CLIENT,
  OFFLINE_POS_FULL_MODE_P1_31_TEST_ID,
  OFFLINE_POS_FULL_MODE_P1_31_WIRING_PATHS,
} from "@/lib/pos/offline-pos-full-mode-p1-31-policy";
import {
  POS_OFFLINE_MENU_CACHE_DB,
  POS_OFFLINE_MENU_CACHE_STORE,
} from "@/lib/pos/pos-offline-menu-cache";

const ROOT = process.cwd();

function readSource(relativePath: string): string {
  return readFileSync(join(ROOT, relativePath), "utf8");
}

describe("Offline POS full mode (P1-31)", () => {
  it("locks P1-31 policy and Toast-parity full mode flow", () => {
    expect(OFFLINE_POS_FULL_MODE_P1_31_POLICY_ID).toBe("offline-pos-full-mode-p1-31-v1");
    expect(OFFLINE_POS_FULL_MODE_P1_31_FLOW_STEPS).toEqual([
      "menu-cache",
      "local-cart",
      "cash-offline",
      "pci-aes-gcm",
      "sync-queue",
      "conflict-resolution",
      "noop-v1-review",
    ]);
    expect(OFFLINE_PCI_NOOP_V1_REVIEW_POLICY_ID).toBe("offline-pci-noop-v1-review-p1-31-v1");
  });

  it("menu cache uses IndexedDB store for offline refresh", () => {
    const cache = readSource(OFFLINE_POS_FULL_MODE_P1_31_MENU_CACHE);
    expect(cache).toContain(POS_OFFLINE_MENU_CACHE_DB);
    expect(cache).toContain(POS_OFFLINE_MENU_CACHE_STORE);
    expect(cache).toContain("export async function savePosOfflineMenuCache");
    expect(cache).toContain("export async function loadPosOfflineMenuCache");
  });

  it("passes noop-v1 fallback review on encryption module", () => {
    const encryption = readSource(OFFLINE_POS_FULL_MODE_P1_31_ENCRYPTION);
    const review = auditNoopV1FallbackPolicy(encryption);
    expect(review.passed, review.failures.join("; ")).toBe(true);
    expect(encryption).not.toContain("btoa(trimmed)");
  });

  it("full mode panel and terminal client wire menu cache", () => {
    const panel = readSource(OFFLINE_POS_FULL_MODE_P1_31_COMPONENT);
    expect(panel).toContain(`data-testid="${OFFLINE_POS_FULL_MODE_P1_31_TEST_ID}"`);
    expect(panel).toContain("Toast parity checklist");
    expect(panel).toContain("noop-v1");

    const terminal = readSource(OFFLINE_POS_FULL_MODE_P1_31_TERMINAL_CLIENT);
    expect(terminal).toContain("savePosOfflineMenuCache");
    expect(terminal).toContain("loadPosOfflineMenuCache");
  });

  it("P1-31 wiring paths exist including doc, artifact, and CI gate", () => {
    for (const path of OFFLINE_POS_FULL_MODE_P1_31_WIRING_PATHS) {
      expect(existsSync(join(ROOT, path)), `missing: ${path}`).toBe(true);
    }

    const pkg = readSource("package.json");
    expect(pkg).toContain(`"${OFFLINE_POS_FULL_MODE_P1_31_CHECK_NPM_SCRIPT}"`);
    expect(pkg).toContain(`"${OFFLINE_POS_FULL_MODE_P1_31_CI_NPM_SCRIPT}"`);

    const ci = readSource(OFFLINE_POS_FULL_MODE_P1_31_CI_WORKFLOW);
    expect(ci).toContain(OFFLINE_POS_FULL_MODE_P1_31_CHECK_NPM_SCRIPT);

    const doc = readSource(OFFLINE_POS_FULL_MODE_P1_31_DOC);
    expect(doc).toContain(OFFLINE_POS_FULL_MODE_P1_31_POLICY_ID);

    const artifact = JSON.parse(readSource(OFFLINE_POS_FULL_MODE_P1_31_ARTIFACT));
    expect(artifact.policyId).toBe(OFFLINE_POS_FULL_MODE_P1_31_POLICY_ID);
    expect(artifact.noopV1EmptyOnly).toBe(true);
  });
});
