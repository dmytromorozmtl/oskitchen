import { describe, expect, it } from "vitest";

import {
  auditPmPilotGonoGoCapstone,
  PM_PILOT_GONO_GO_CAPSTONE_AUDIT_POLICY_ID,
} from "@/lib/pm/pm-pilot-gono-go-capstone-audit-policy";
import {
  PM_PILOT_GONO_GO_CAPSTONE_POLICY_ID,
  PM_PILOT_GONO_GO_CAPSTONE_SUB_POLICIES,
} from "@/lib/pm/pm-pilot-gono-go-capstone-patterns";

describe("PM pilot GO/NO-GO capstone audit (PM-02)", () => {
  it("locks PM-02 policy id and four-surface registry", () => {
    expect(PM_PILOT_GONO_GO_CAPSTONE_POLICY_ID).toBe("pm-pilot-gono-go-capstone-pm02-v1");
    expect(PM_PILOT_GONO_GO_CAPSTONE_AUDIT_POLICY_ID).toBe(PM_PILOT_GONO_GO_CAPSTONE_POLICY_ID);
    expect(PM_PILOT_GONO_GO_CAPSTONE_SUB_POLICIES).toHaveLength(4);
    expect(PM_PILOT_GONO_GO_CAPSTONE_SUB_POLICIES.at(-1)?.id).toBe("PM-01");
  });

  it("composes commercial runbook, GO/NO-GO artifact, integrity, and PM-01", () => {
    const report = auditPmPilotGonoGoCapstone();
    expect(report.subAudits).toHaveLength(4);
    expect(report.subAudits.map((a) => a.taskId)).toEqual(
      PM_PILOT_GONO_GO_CAPSTONE_SUB_POLICIES.map((p) => p.id),
    );
  });

  it("passes full PM pilot GO/NO-GO capstone against repo", () => {
    const report = auditPmPilotGonoGoCapstone();
    expect(report.passed).toBe(true);
    expect(report.subAudits.every((a) => a.passed)).toBe(true);
  });

  it("requires honest NO-GO on committed pilot summary artifact", () => {
    const report = auditPmPilotGonoGoCapstone();
    const artifact = report.subAudits.find((a) => a.taskId === "gono-go-artifact");
    const integrity = report.subAudits.find((a) => a.taskId === "gono-go-integrity");
    expect(artifact?.passed).toBe(true);
    expect(integrity?.passed).toBe(true);
  });
});
