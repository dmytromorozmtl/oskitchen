import { describe, expect, it } from "vitest";

import {
  auditFinal03PilotGonoGo,
  FINAL_03_PILOT_GONO_GO_POLICY_ID,
  PILOT_GONO_GO_NPM_SCRIPT,
} from "@/lib/execution/final-03-pilot-gono-go-audit-policy";
import { FINAL_ORCHESTRATOR_PHASES } from "@/lib/execution/final-orchestrator-phases";

describe("final orchestrator FINAL-03 pilot GO/NO-GO audit", () => {
  it("locks FINAL-03 policy and task slot 197", () => {
    expect(FINAL_03_PILOT_GONO_GO_POLICY_ID).toBe("final-03-pilot-gono-go-v1");
    expect(FINAL_ORCHESTRATOR_PHASES[2]?.id).toBe("FINAL-03");
    expect(FINAL_ORCHESTRATOR_PHASES[2]?.taskSlot).toBe(197);
    expect(PILOT_GONO_GO_NPM_SCRIPT).toBe("smoke:pilot-gono-go");
  });

  it("passes pilot GO/NO-GO audit against repo", () => {
    const report = auditFinal03PilotGonoGo();
    expect(report.passed).toBe(true);
    expect(report.artifactPresent).toBe(true);
    expect(report.artifactHonestNoGo).toBe(true);
    expect(report.integrityPassed).toBe(true);
    expect(report.final02Passed).toBe(true);
  });

  it("requires commercial pilot runbook and smoke builder wiring", () => {
    const report = auditFinal03PilotGonoGo();
    expect(report.runbookPresent).toBe(true);
    expect(report.builderWired).toBe(true);
  });

  it("enforces honest NO-GO without signed customer", () => {
    const report = auditFinal03PilotGonoGo();
    expect(report.artifactHonestNoGo).toBe(true);
    expect(report.integrityPassed).toBe(true);
  });
});
