import { describe, expect, it } from "vitest";

import {
  auditPmCustomerGtmCapstone,
  PM_CUSTOMER_GTM_CAPSTONE_AUDIT_POLICY_ID,
} from "@/lib/pm/pm-customer-gtm-capstone-audit-policy";
import {
  PM_CUSTOMER_GTM_CAPSTONE_POLICY_ID,
  PM_CUSTOMER_GTM_CAPSTONE_SUB_POLICIES,
} from "@/lib/pm/pm-customer-gtm-capstone-patterns";

describe("PM customer GTM capstone audit (PM-04)", () => {
  it("locks PM-04 policy id and five-surface registry", () => {
    expect(PM_CUSTOMER_GTM_CAPSTONE_POLICY_ID).toBe("pm-customer-gtm-capstone-pm04-v1");
    expect(PM_CUSTOMER_GTM_CAPSTONE_AUDIT_POLICY_ID).toBe(PM_CUSTOMER_GTM_CAPSTONE_POLICY_ID);
    expect(PM_CUSTOMER_GTM_CAPSTONE_SUB_POLICIES).toHaveLength(5);
    expect(PM_CUSTOMER_GTM_CAPSTONE_SUB_POLICIES.at(-1)?.id).toBe("PM-03");
  });

  it("composes CS playbook, demo env, competitor docs, and PM-03", () => {
    const report = auditPmCustomerGtmCapstone();
    expect(report.subAudits).toHaveLength(5);
    expect(report.subAudits.map((a) => a.taskId)).toEqual(
      PM_CUSTOMER_GTM_CAPSTONE_SUB_POLICIES.map((p) => p.id),
    );
  });

  it("passes full PM customer GTM capstone against repo", () => {
    const report = auditPmCustomerGtmCapstone();
    expect(report.passed).toBe(true);
    expect(report.subAudits.every((a) => a.passed)).toBe(true);
  });

  it("requires seven competitor head-to-head profiles in tracker", () => {
    const report = auditPmCustomerGtmCapstone();
    const tracker = report.subAudits.find((a) => a.taskId === "competitor-tracker");
    expect(tracker?.passed).toBe(true);
  });
});
