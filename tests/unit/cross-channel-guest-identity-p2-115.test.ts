import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditCrossChannelGuestIdentityP2_115,
  formatCrossChannelGuestIdentityP2_115AuditLines,
} from "@/lib/crm/cross-channel-guest-identity-p2-115-audit";
import { CROSS_CHANNEL_GUEST_IDENTITY_P2_115_CAPABILITIES } from "@/lib/crm/cross-channel-guest-identity-p2-115-content";
import {
  buildCrossChannelGuestIdentityDemoReport,
  classifyChannelFromSource,
  hasMultiChannelIdentity,
  normalizeGuestKey,
} from "@/lib/crm/cross-channel-guest-identity-p2-115-operations";
import {
  CROSS_CHANNEL_GUEST_IDENTITY_P2_115_CAPABILITY_COUNT,
  CROSS_CHANNEL_GUEST_IDENTITY_P2_115_CI_WORKFLOW,
  CROSS_CHANNEL_GUEST_IDENTITY_P2_115_DOC,
  CROSS_CHANNEL_GUEST_IDENTITY_P2_115_NPM_SCRIPT,
  CROSS_CHANNEL_GUEST_IDENTITY_P2_115_POLICY_ID,
  CROSS_CHANNEL_GUEST_IDENTITY_P2_115_ROUTE,
  CROSS_CHANNEL_GUEST_IDENTITY_P2_115_UNIT_TEST,
} from "@/lib/crm/cross-channel-guest-identity-p2-115-policy";

const ROOT = process.cwd();

describe("Cross-channel guest identity (P2-115)", () => {
  it("locks policy id, route, and three capabilities", () => {
    expect(CROSS_CHANNEL_GUEST_IDENTITY_P2_115_POLICY_ID).toBe(
      "cross-channel-guest-identity-p2-115-v1",
    );
    expect(CROSS_CHANNEL_GUEST_IDENTITY_P2_115_ROUTE).toBe(
      "/dashboard/crm/cross-channel-guest-identity",
    );
    expect(CROSS_CHANNEL_GUEST_IDENTITY_P2_115_CAPABILITY_COUNT).toBe(3);
    expect(CROSS_CHANNEL_GUEST_IDENTITY_P2_115_CAPABILITIES).toHaveLength(3);
  });

  it("passes full cross-channel guest identity audit", () => {
    const summary = auditCrossChannelGuestIdentityP2_115(ROOT);
    expect(summary.wiringComplete).toBe(true);
    expect(summary.docWired).toBe(true);
    expect(summary.componentWired).toBe(true);
    expect(summary.pageWired).toBe(true);
    expect(summary.operationsWired).toBe(true);
    expect(summary.serviceWired).toBe(true);
    expect(summary.legacyUnifiedServiceLinked).toBe(true);
    expect(summary.legacyUnifiedPolicyLinked).toBe(true);
    expect(summary.legacyBuildersLinked).toBe(true);
    expect(summary.legacySourcesLinked).toBe(true);
    expect(summary.legacyPanelLinked).toBe(true);
    expect(summary.legacyHubPageLinked).toBe(true);
    expect(summary.capabilityCountCorrect).toBe(true);
    expect(summary.allTestIdsPresent).toBe(true);
    expect(summary.honestyMarkersPresent).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("normalizes guest keys from email and phone", () => {
    expect(normalizeGuestKey({ email: "Jordan@Example.com" })).toBe("email:jordan@example.com");
    expect(normalizeGuestKey({ phone: "+1 (555) 123-4567" })).toBe("phone:15551234567");
    expect(normalizeGuestKey({ email: "guest@guest.local" })).toBeNull();
  });

  it("classifies channel from customer source", () => {
    expect(classifyChannelFromSource("Storefront")).toBe("storefront");
    expect(classifyChannelFromSource("Manual")).toBe("pos");
    expect(classifyChannelFromSource("Uber Eats")).toBe("delivery");
  });

  it("builds demo report with multi-channel guests", () => {
    const report = buildCrossChannelGuestIdentityDemoReport();
    expect(report.guestCount).toBe(3);
    expect(hasMultiChannelIdentity(report)).toBe(true);
    expect(report.guests[0]?.channels.length).toBeGreaterThan(1);
  });

  it("wires CI audit script and deploy gate", () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts: Record<string, string>;
    };
    expect(pkg.scripts[CROSS_CHANNEL_GUEST_IDENTITY_P2_115_NPM_SCRIPT]).toContain(
      "audit-cross-channel-guest-identity-p2-115.ts",
    );
    expect(pkg.scripts["test:ci:cross-channel-guest-identity-p2-115"]).toContain(
      CROSS_CHANNEL_GUEST_IDENTITY_P2_115_UNIT_TEST,
    );

    const workflow = readFileSync(join(ROOT, CROSS_CHANNEL_GUEST_IDENTITY_P2_115_CI_WORKFLOW), "utf8");
    expect(workflow).toContain(CROSS_CHANNEL_GUEST_IDENTITY_P2_115_NPM_SCRIPT);

    expect(existsSync(join(ROOT, CROSS_CHANNEL_GUEST_IDENTITY_P2_115_DOC))).toBe(true);
    expect(
      formatCrossChannelGuestIdentityP2_115AuditLines(
        auditCrossChannelGuestIdentityP2_115(ROOT),
      ).length,
    ).toBeGreaterThan(5);
  });
});
