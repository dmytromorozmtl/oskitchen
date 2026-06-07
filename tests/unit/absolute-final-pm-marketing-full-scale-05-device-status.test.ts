import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { auditPmMarketingFullScaleSlot } from "@/lib/marketing/absolute-final-pm-marketing-full-scale-audit";
import {
  getPmMarketingFullScaleSlot,
  PM_MARKETING_FULL_SCALE_ABSOLUTE_FINAL_POLICY_ID,
} from "@/lib/marketing/absolute-final-pm-marketing-full-scale-policy";
import {
  docUsesPmGtmTokens,
  PM_GTM_ABSOLUTE_FINAL_POLICY_ID,
  PM_GTM_DOC_DARK_MODE_MARKER,
} from "@/lib/marketing/absolute-final-pm-marketing-full-scale-tokens";
import { auditDeviceStatusGtmScaleWiring } from "@/lib/marketing/device-status-gtm-scale-audit";
import {
  DEVICE_STATUS_GTM_SCALE_DOC_PATH,
  DEVICE_STATUS_GTM_SCALE_HONESTY_MARKERS,
} from "@/lib/marketing/device-status-gtm-scale-absolute-final-policy";
import {
  DEVICE_STATUS_DASHBOARD_COMPONENT_PATH,
  DEVICE_STATUS_DASHBOARD_ROUTE,
  DEVICE_STATUS_DASHBOARD_ABSOLUTE_FINAL_POLICY_ID,
} from "@/lib/integration-health/device-status-dashboard-absolute-final-policy";

const ROOT = process.cwd();
/** Absolute Final Task 135 — PM marketing full scale for feature 90 device status dashboard */
const TASK = 135;
const FEATURE = 90;

describe(`PM marketing full scale — device status dashboard (Absolute Final Task ${TASK}, feature ${FEATURE})`, () => {
  it("locks PM marketing registry slot 135 → feature 90 device status dashboard", () => {
    expect(PM_MARKETING_FULL_SCALE_ABSOLUTE_FINAL_POLICY_ID).toBe(
      "absolute-final-pm-marketing-full-scale-v1",
    );
    const slot = getPmMarketingFullScaleSlot(TASK);
    expect(slot?.featureKey).toBe("device-status-dashboard");
    expect(slot?.featureTaskNumber).toBe(FEATURE);
    expect(slot?.targetPath).toBe(DEVICE_STATUS_GTM_SCALE_DOC_PATH);
  });

  it("applies pm-gtm doc markers to the device status GTM playbook", () => {
    const doc = readFileSync(join(ROOT, DEVICE_STATUS_GTM_SCALE_DOC_PATH), "utf8");
    expect(docUsesPmGtmTokens(doc)).toBe(true);
    expect(doc).toContain("pm-gtm-hero-banner");
    expect(doc).toContain("pm-gtm-icp-profile");
    expect(doc).toContain("pm-gtm-demo-hook");
    expect(doc).toContain("pm-gtm-objection-handling");
    expect(doc).toContain("pm-gtm-pricing-talk-track");
    expect(doc).toContain("pm-gtm-primary-cta");
    expect(doc).toContain("pm-gtm-honesty-guardrails");
    expect(doc).toContain(PM_GTM_DOC_DARK_MODE_MARKER);
    expect(PM_GTM_ABSOLUTE_FINAL_POLICY_ID).toBe(PM_MARKETING_FULL_SCALE_ABSOLUTE_FINAL_POLICY_ID);
  });

  it("includes ICP, demo, objections, pricing, and CTA sections", () => {
    const doc = readFileSync(join(ROOT, DEVICE_STATUS_GTM_SCALE_DOC_PATH), "utf8");
    expect(doc).toContain("pm-gtm-icp-profile");
    expect(doc).toContain("pm-gtm-demo-hook");
    expect(doc).toContain("pm-gtm-objection-handling");
    expect(doc).toContain("pm-gtm-pricing-talk-track");
    expect(doc).toContain("pm-gtm-primary-cta");
    expect(doc).toContain("pm-gtm-honesty-guardrails");
  });

  it("shows honesty guardrails with Configuration only and Clover parity markers", () => {
    const doc = readFileSync(join(ROOT, DEVICE_STATUS_GTM_SCALE_DOC_PATH), "utf8");
    for (const marker of DEVICE_STATUS_GTM_SCALE_HONESTY_MARKERS) {
      expect(doc).toContain(marker);
    }
    expect(doc).toContain(DEVICE_STATUS_DASHBOARD_COMPONENT_PATH);
  });

  it("links GTM playbook to /dashboard/devices and feature policy", () => {
    const doc = readFileSync(join(ROOT, DEVICE_STATUS_GTM_SCALE_DOC_PATH), "utf8");
    expect(doc).toContain(DEVICE_STATUS_DASHBOARD_ROUTE);
    expect(doc).toContain("/dashboard/integration-health");
    expect(doc).toContain("device-status-gtm-scale-absolute-final-v1");
    expect(doc).toContain(DEVICE_STATUS_DASHBOARD_ABSOLUTE_FINAL_POLICY_ID);
    expect(doc).toContain("task-135 feature-90");
  });

  it("references upstream device status dashboard component", () => {
    const component = readFileSync(join(ROOT, DEVICE_STATUS_DASHBOARD_COMPONENT_PATH), "utf8");
    expect(component).toContain("Configuration only");
    expect(component).toContain("Clover parity");
  });

  it("passes base device status GTM wiring audit", () => {
    const wiring = auditDeviceStatusGtmScaleWiring(ROOT);
    expect(wiring.ok, wiring.failures.join("; ")).toBe(true);
  });

  it("passes PM marketing slot 135 audit gate", () => {
    const audit = auditPmMarketingFullScaleSlot(TASK, ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    expect(audit.slot?.gtmTest).toBe(
      "tests/unit/absolute-final-pm-marketing-full-scale-05-device-status.test.ts",
    );
  });
});
