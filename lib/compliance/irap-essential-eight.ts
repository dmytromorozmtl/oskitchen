/**
 * V3 — Australian IRAP + Essential Eight maturity crosswalk from StateRAMP/TX-RAMP (U3).
 */

import {
  buildStateRampTxRampEvidence,
  type StateRampControlId,
} from "@/lib/compliance/stateramp-txramp-crosswalk";

export type EssentialEightStrategy =
  | "patch_apps"
  | "patch_os"
  | "mfa"
  | "restrict_admin"
  | "app_control"
  | "office_macros"
  | "user_apps"
  | "regular_backups";

export type IrapEssentialEightEvidence = {
  generatedAt: string;
  period: string;
  irapReady: boolean;
  essentialEightMaturity: "M1" | "M2" | "M3";
  controls: {
    strategy: EssentialEightStrategy;
    mappedStateRamp: StateRampControlId[];
    maturityLevel: "M1" | "M2" | "M3";
    continuousMonitoring: "pass" | "partial" | "fail";
  }[];
};

export const STATERAMP_TO_E8: Record<StateRampControlId, EssentialEightStrategy[]> = {
  "SR-AC-1": ["mfa", "restrict_admin"],
  "SR-AU-1": ["patch_os"],
  "SR-CM-1": ["patch_apps", "regular_backups"],
  "SR-SC-1": ["app_control"],
  "SR-SI-1": ["patch_apps", "office_macros"],
};

export function isIrapEssentialEightEnabled(): boolean {
  return process.env.THEME_EXPERIMENT_IRAP_ESSENTIAL8 === "1";
}

export function buildIrapEssentialEightEvidence(): IrapEssentialEightEvidence {
  const sr = buildStateRampTxRampEvidence();
  const byStrategy = new Map<
    EssentialEightStrategy,
    { sr: Set<StateRampControlId>; status: "pass" | "partial" | "fail" }
  >();

  for (const c of sr.controls) {
    if (c.framework !== "StateRAMP") continue;
    const srId = c.controlId as StateRampControlId;
    for (const strat of STATERAMP_TO_E8[srId] ?? []) {
      const e = byStrategy.get(strat) ?? { sr: new Set(), status: c.continuousMonitoring };
      e.sr.add(srId);
      if (c.continuousMonitoring === "fail") e.status = "fail";
      else if (c.continuousMonitoring === "partial" && e.status === "pass") e.status = "partial";
      byStrategy.set(strat, e);
    }
  }

  const controls: IrapEssentialEightEvidence["controls"] = [];
  for (const [strategy, data] of byStrategy) {
    const maturityLevel: "M1" | "M2" | "M3" =
      data.status === "pass" ? "M3" : data.status === "partial" ? "M2" : "M1";
    controls.push({
      strategy,
      mappedStateRamp: [...data.sr],
      maturityLevel,
      continuousMonitoring: data.status,
    });
  }

  const allPass = controls.every((c) => c.continuousMonitoring === "pass");
  const essentialEightMaturity: "M1" | "M2" | "M3" = allPass
    ? "M3"
    : controls.some((c) => c.maturityLevel === "M2")
      ? "M2"
      : "M1";

  return {
    generatedAt: new Date().toISOString(),
    period: sr.period,
    irapReady: allPass && sr.stateRampReady,
    essentialEightMaturity,
    controls,
  };
}

export function irapEssentialEightPdfLines(ev: IrapEssentialEightEvidence): string {
  return [
    `IRAP + Essential Eight — ${ev.period}`,
    `IRAP ready: ${ev.irapReady}`,
    `E8 maturity: ${ev.essentialEightMaturity}`,
    "",
    ...ev.controls.map(
      (c) => `${c.strategy} [${c.maturityLevel}] ← ${c.mappedStateRamp.join(", ")}`,
    ),
  ].join("\n");
}
