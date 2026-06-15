/**
 * W3 — ISMAP (AU) + NZISM (NZ) government cloud crosswalk from IRAP/Essential Eight (V3).
 */

import {
  buildIrapEssentialEightEvidence,
  type EssentialEightStrategy,
} from "@/lib/compliance/irap-essential-eight";

export type IsmapControlId = "ISMAP-AC-1" | "ISMAP-AU-1" | "ISMAP-SC-1" | "ISMAP-SI-1";

export type NzismControlId = "NZISM-1" | "NZISM-2" | "NZISM-4" | "NZISM-10";

export const E8_TO_ISMAP: Record<EssentialEightStrategy, IsmapControlId[]> = {
  patch_apps: ["ISMAP-SI-1"],
  patch_os: ["ISMAP-SI-1"],
  mfa: ["ISMAP-AC-1"],
  restrict_admin: ["ISMAP-AC-1"],
  app_control: ["ISMAP-SC-1"],
  office_macros: ["ISMAP-SI-1"],
  user_apps: ["ISMAP-SC-1"],
  regular_backups: ["ISMAP-AU-1"],
};

export const E8_TO_NZISM: Record<EssentialEightStrategy, NzismControlId[]> = {
  patch_apps: ["NZISM-4"],
  patch_os: ["NZISM-4"],
  mfa: ["NZISM-1"],
  restrict_admin: ["NZISM-1"],
  app_control: ["NZISM-2"],
  office_macros: ["NZISM-4"],
  user_apps: ["NZISM-2"],
  regular_backups: ["NZISM-10"],
};

export type IsmapNzismEvidence = {
  generatedAt: string;
  period: string;
  ismapReady: boolean;
  nzismReady: boolean;
  controls: {
    framework: "ISMAP" | "NZISM";
    controlId: string;
    mappedE8: EssentialEightStrategy[];
    continuousMonitoring: "pass" | "partial" | "fail";
  }[];
};

export function isIsmapNzismEnabled(): boolean {
  return process.env.THEME_EXPERIMENT_ISMAP_NZISM === "1";
}

export function buildIsmapNzismEvidence(): IsmapNzismEvidence {
  const irap = buildIrapEssentialEightEvidence();
  const ismapMap = new Map<IsmapControlId, { e8: Set<EssentialEightStrategy>; status: "pass" | "partial" | "fail" }>();
  const nzismMap = new Map<NzismControlId, { e8: Set<EssentialEightStrategy>; status: "pass" | "partial" | "fail" }>();

  for (const c of irap.controls) {
    for (const ismap of E8_TO_ISMAP[c.strategy] ?? []) {
      const e = ismapMap.get(ismap) ?? { e8: new Set(), status: c.continuousMonitoring };
      e.e8.add(c.strategy);
      if (c.continuousMonitoring === "fail") e.status = "fail";
      else if (c.continuousMonitoring === "partial" && e.status === "pass") e.status = "partial";
      ismapMap.set(ismap, e);
    }
    for (const nz of E8_TO_NZISM[c.strategy] ?? []) {
      const e = nzismMap.get(nz) ?? { e8: new Set(), status: c.continuousMonitoring };
      e.e8.add(c.strategy);
      if (c.continuousMonitoring === "fail") e.status = "fail";
      else if (c.continuousMonitoring === "partial" && e.status === "pass") e.status = "partial";
      nzismMap.set(nz, e);
    }
  }

  const controls: IsmapNzismEvidence["controls"] = [];
  for (const [controlId, data] of ismapMap) {
    controls.push({
      framework: "ISMAP",
      controlId,
      mappedE8: [...data.e8],
      continuousMonitoring: data.status,
    });
  }
  for (const [controlId, data] of nzismMap) {
    controls.push({
      framework: "NZISM",
      controlId,
      mappedE8: [...data.e8],
      continuousMonitoring: data.status,
    });
  }

  const ismapReady = controls
    .filter((c) => c.framework === "ISMAP")
    .every((c) => c.continuousMonitoring === "pass");
  const nzismReady = controls
    .filter((c) => c.framework === "NZISM")
    .every((c) => c.continuousMonitoring === "pass");

  return {
    generatedAt: new Date().toISOString(),
    period: irap.period,
    ismapReady,
    nzismReady,
    controls,
  };
}

export function evaluateIsmapNzismPublishGate(_raw: unknown): {
  passed: boolean;
  headline: string;
  detail: string;
} {
  if (!isIsmapNzismEnabled()) {
    return { passed: true, headline: "ISMAP/NZISM off", detail: "" };
  }
  const ev = buildIsmapNzismEvidence();
  if (!ev.ismapReady) {
    return {
      passed: false,
      headline: "ISMAP controls not ready",
      detail: "AU government cloud procurement — map Essential Eight → ISMAP.",
    };
  }
  if (!ev.nzismReady) {
    return {
      passed: false,
      headline: "NZISM controls not ready",
      detail: "NZ government cloud — Essential Eight → NZISM crosswalk incomplete.",
    };
  }
  return {
    passed: true,
    headline: "ISMAP + NZISM aligned",
    detail: `${ev.controls.length} controls · period ${ev.period}`,
  };
}

export function ismapNzismPdfLines(ev: IsmapNzismEvidence): string {
  return [
    `ISMAP + NZISM — ${ev.period}`,
    `ISMAP ready: ${ev.ismapReady}`,
    `NZISM ready: ${ev.nzismReady}`,
    "",
    ...ev.controls.map(
      (c) => `${c.framework} ${c.controlId} [${c.continuousMonitoring}] ← ${c.mappedE8.join(", ")}`,
    ),
  ].join("\n");
}
