import { describe, expect, it } from "vitest";

import {
  COMMERCIAL_PILOT_PATH_STEP_CATALOG,
  ENGINEERING_PATH_TERMINUS_ERA24_POLICY_ID,
  buildCommercialPilotPathStepStatuses,
  resolveCommercialPilotPathSummary,
} from "@/lib/commercial/engineering-path-terminus-era24";

describe("engineering-path-terminus-era24", () => {
  it("locks 16-step commercial pilot catalog", () => {
    expect(COMMERCIAL_PILOT_PATH_STEP_CATALOG).toHaveLength(16);
    expect(COMMERCIAL_PILOT_PATH_STEP_CATALOG[14]?.id).toBe("commercial_pilot_path_absolute_end");
    expect(COMMERCIAL_PILOT_PATH_STEP_CATALOG[15]?.id).toBe("linear_path_permanently_closed");
    expect(COMMERCIAL_PILOT_PATH_STEP_CATALOG.filter((step) => step.kind === "gate")).toHaveLength(9);
  });

  it("reports honest blocked path when P0 vault incomplete", () => {
    const steps = buildCommercialPilotPathStepStatuses({
      p0Vault: { allPresent: false, present: [], missing: ["E2E_LOGIN_EMAIL"] },
      tier2: { tier2GatePassed: false, p0GatePassed: false, missing: ["TIER2_STAGING_GOLDEN_PATH_ATTESTED"] },
      commercialGo: { phases: [{ complete: false }], decision: null, missing: ["PILOT_ICP_CONTRACT_SIGNED"] },
      pilotWeek1: { week1Complete: false, goDecision: null, missing: [] },
      month2: { month2Complete: false, missing: [] },
      scale: { scaleComplete: false, missing: [] },
      seriesA: { seriesAComplete: false, missing: [] },
      marketLeader: { marketLeaderComplete: false, missing: [] },
      sustainedOps: { sustainedOpsComplete: false, missing: [] },
      improvementLoop: { pureOperationalMode: false, goDecision: null },
      productEvolution: { productEvolutionReady: false },
      maintenanceMode: {
        maintenanceModeActive: false,
        commercialPilotPathComplete: false,
        goDecision: null,
      },
      steadyState: {
        steadyStateActive: false,
        engineeringTerminusActive: false,
        overdueTracks: 0,
      },
      absoluteEnd: {
        absoluteEndActive: false,
        pathEngineeringClosed: true,
        completedSteps: 0,
        totalSteps: 16,
        goDecision: null,
      },
      terminalClosure: {
        terminalClosureActive: false,
        linearPathPermanentlyClosed: true,
        docChainSteps: 16,
      },
    });

    expect(steps[0]?.complete).toBe(false);
    expect(steps[12]?.complete).toBe(false);
    expect(steps[13]?.complete).toBe(false);
    expect(steps[14]?.complete).toBe(false);
    expect(steps[15]?.complete).toBe(false);

    const summary = resolveCommercialPilotPathSummary(steps, {
      maintenanceModeActive: false,
      commercialPilotPathComplete: false,
      goDecision: null,
    });
    expect(summary.firstBlockedStep?.step).toBe(1);
    expect(summary.firstBlockedGateStep?.step).toBe(1);
    expect(summary.engineeringTerminusActive).toBe(false);
  });

  it("marks terminus active when maintenance mode active", () => {
    const steps = buildCommercialPilotPathStepStatuses({
      p0Vault: { allPresent: true, present: ["A"], missing: [] },
      tier2: { tier2GatePassed: true, p0GatePassed: true, missing: [] },
      commercialGo: { phases: [{ complete: true }], decision: "GO", missing: [] },
      pilotWeek1: { week1Complete: true, goDecision: "GO", missing: [] },
      month2: { month2Complete: true, missing: [] },
      scale: { scaleComplete: true, missing: [] },
      seriesA: { seriesAComplete: true, missing: [] },
      marketLeader: { marketLeaderComplete: true, missing: [] },
      sustainedOps: { sustainedOpsComplete: true, missing: [] },
      improvementLoop: { pureOperationalMode: true, goDecision: "GO" },
      productEvolution: { productEvolutionReady: true },
      maintenanceMode: {
        maintenanceModeActive: true,
        commercialPilotPathComplete: true,
        goDecision: "GO",
      },
      steadyState: {
        steadyStateActive: true,
        engineeringTerminusActive: true,
        overdueTracks: 0,
      },
      absoluteEnd: {
        absoluteEndActive: true,
        pathEngineeringClosed: true,
        completedSteps: 16,
        totalSteps: 16,
        goDecision: "GO",
      },
      terminalClosure: {
        terminalClosureActive: true,
        linearPathPermanentlyClosed: true,
        docChainSteps: 16,
      },
    });

    expect(steps.every((step) => step.complete)).toBe(true);
    const summary = resolveCommercialPilotPathSummary(
      steps,
      {
        maintenanceModeActive: true,
        commercialPilotPathComplete: true,
        goDecision: "GO",
      },
      {
        steadyStateActive: true,
        engineeringTerminusActive: true,
        overdueTracks: 0,
      },
      {
        absoluteEndActive: true,
        pathEngineeringClosed: true,
        completedSteps: 16,
        totalSteps: 16,
        goDecision: "GO",
      },
      {
        terminalClosureActive: true,
        linearPathPermanentlyClosed: true,
        docChainSteps: 16,
      },
    );
    expect(summary.completedSteps).toBe(16);
    expect(summary.absoluteEndActive).toBe(true);
    expect(summary.terminalClosureActive).toBe(true);
    expect(summary.linearPathPermanentlyClosed).toBe(true);
  });

  it("locks engineering path terminus policy id", () => {
    expect(ENGINEERING_PATH_TERMINUS_ERA24_POLICY_ID).toBe("era24-engineering-path-terminus-v1");
  });
});
