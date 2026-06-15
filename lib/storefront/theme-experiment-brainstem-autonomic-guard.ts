/**
 * AF4 — Brainstem autonomic publish guard over AE4 cerebellar motor organoid.
 */

import { appendDnaAuditBlock, isDnaAuditTrailEnabled } from "@/lib/compliance/dna-encoded-audit-trail";
import { toJsonValue } from "@/lib/prisma/json";
import {
  isCerebellarMotorOrganoidEnabled,
  readCerebellarMotorOrganoid,
} from "@/lib/storefront/theme-experiment-cerebellar-motor-organoid";

export type AutonomicReflexType = "sympathetic_block" | "parasympathetic_allow" | "vagal_hold";

export type BrainstemAutonomicReflex = {
  reflexId: string;
  at: string;
  reflexType: AutonomicReflexType;
  autonomicLatencyMs: number;
  cerebellarReflexId: string | null;
  rationale: string;
};

export type BrainstemAutonomicGuardSnapshot = {
  at: string;
  reflexes: BrainstemAutonomicReflex[];
  latestReflex: AutonomicReflexType | null;
  autonomicPublishBlocked: boolean;
  brainstemSynced: boolean;
  meanAutonomicLatencyMs: number;
};

export function isBrainstemAutonomicGuardEnabled(): boolean {
  return process.env.THEME_EXPERIMENT_BRAINSTEM_AUTONOMIC_GUARD === "1";
}

export function brainstemAutonomicSloMs(): number {
  return Number(process.env.THEME_EXPERIMENT_BRAINSTEM_AUTONOMIC_SLO_MS ?? "30");
}

export function readBrainstemAutonomicGuard(raw: unknown): BrainstemAutonomicGuardSnapshot | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = (raw as Record<string, unknown>).brainstemAutonomicGuard;
  if (!o || typeof o !== "object" || Array.isArray(o)) return null;
  const s = o as Record<string, unknown>;
  return {
    at: typeof s.at === "string" ? s.at : new Date().toISOString(),
    reflexes: Array.isArray(s.reflexes) ? (s.reflexes as BrainstemAutonomicReflex[]) : [],
    latestReflex: (s.latestReflex as AutonomicReflexType) ?? null,
    autonomicPublishBlocked: s.autonomicPublishBlocked === true,
    brainstemSynced: s.brainstemSynced === true,
    meanAutonomicLatencyMs: typeof s.meanAutonomicLatencyMs === "number" ? s.meanAutonomicLatencyMs : 0,
  };
}

export function mergeBrainstemAutonomicGuard(
  previousRaw: unknown,
  snap: BrainstemAutonomicGuardSnapshot,
): Record<string, unknown> {
  const base =
    previousRaw && typeof previousRaw === "object" && !Array.isArray(previousRaw)
      ? { ...(previousRaw as Record<string, unknown>) }
      : {};
  base.brainstemAutonomicGuard = snap;
  return base;
}

export function recordBrainstemAutonomicReflex(
  previousRaw: unknown,
  reflex: Omit<BrainstemAutonomicReflex, "reflexId" | "at"> & { reflexId?: string; at?: string },
): { json: Record<string, unknown>; snap: BrainstemAutonomicGuardSnapshot } {
  const entry: BrainstemAutonomicReflex = {
    reflexId: reflex.reflexId ?? `bs-${Date.now()}`,
    at: reflex.at ?? new Date().toISOString(),
    reflexType: reflex.reflexType,
    autonomicLatencyMs: reflex.autonomicLatencyMs,
    cerebellarReflexId: reflex.cerebellarReflexId,
    rationale: reflex.rationale,
  };

  let json =
    previousRaw && typeof previousRaw === "object" && !Array.isArray(previousRaw)
      ? { ...(previousRaw as Record<string, unknown>) }
      : {};

  if (isDnaAuditTrailEnabled()) {
    const dna = appendDnaAuditBlock(json, {
      eventType: "brainstem_autonomic",
      payload: {
        reflexId: entry.reflexId,
        reflexType: entry.reflexType,
        autonomicLatencyMs: entry.autonomicLatencyMs,
      },
    });
    json = dna.json;
  }

  const prev = readBrainstemAutonomicGuard(json);
  const reflexes = [...(prev?.reflexes ?? []), entry].slice(-40);
  const latest = reflexes[reflexes.length - 1] ?? null;
  const slo = brainstemAutonomicSloMs();
  const meanAutonomicLatencyMs =
    reflexes.length > 0
      ? reflexes.reduce((s, r) => s + r.autonomicLatencyMs, 0) / reflexes.length
      : 0;

  const autonomicPublishBlocked = latest?.reflexType === "sympathetic_block";
  const brainstemSynced =
    latest !== null &&
    meanAutonomicLatencyMs <= slo &&
    latest.reflexType === "parasympathetic_allow";

  const snap: BrainstemAutonomicGuardSnapshot = {
    at: new Date().toISOString(),
    reflexes,
    latestReflex: latest?.reflexType ?? null,
    autonomicPublishBlocked,
    brainstemSynced,
    meanAutonomicLatencyMs,
  };

  return { json: mergeBrainstemAutonomicGuard(json, snap), snap };
}

export function syncBrainstemFromCerebellar(previousRaw: unknown): {
  json: Record<string, unknown>;
  snap: BrainstemAutonomicGuardSnapshot;
} {
  const cb = readCerebellarMotorOrganoid(previousRaw);
  const latestCb = cb?.reflexes[cb.reflexes.length - 1];

  let reflexType: AutonomicReflexType = "vagal_hold";
  if (cb?.reflexPublishBlocked || cb?.latestReflex === "publish_block") {
    reflexType = "sympathetic_block";
  } else if (cb?.latestReflex === "publish_allow" && cb.cerebellarSynced) {
    reflexType = "parasympathetic_allow";
  }

  return recordBrainstemAutonomicReflex(previousRaw, {
    reflexType,
    autonomicLatencyMs: 8 + (cb?.reflexes.length ?? 0) * 3,
    cerebellarReflexId: latestCb?.reflexId ?? null,
    rationale:
      reflexType === "parasympathetic_allow"
        ? "Cerebellar allow — brainstem parasympathetic publish path"
        : reflexType === "sympathetic_block"
          ? "Cerebellar block — sympathetic publish inhibition"
          : "Autonomic hold",
  });
}

export function applyBrainstemAutonomicToWetwareJson(previousRaw: unknown): Record<string, unknown> {
  const bs = readBrainstemAutonomicGuard(previousRaw);
  const base =
    previousRaw && typeof previousRaw === "object" && !Array.isArray(previousRaw)
      ? { ...(previousRaw as Record<string, unknown>) }
      : {};
  if (bs?.autonomicPublishBlocked) {
    base.brainstemPublishBlocked = true;
  }
  return base;
}

export function evaluateBrainstemAutonomicGuardGate(raw: unknown): {
  passed: boolean;
  headline: string;
  detail: string;
} {
  if (!isBrainstemAutonomicGuardEnabled()) {
    return { passed: true, headline: "Brainstem autonomic guard off", detail: "" };
  }
  if (!isCerebellarMotorOrganoidEnabled()) {
    return {
      passed: false,
      headline: "Cerebellar motor organoid required",
      detail: "Enable THEME_EXPERIMENT_CEREBELLAR_MOTOR_ORGANOID=1 (AE4).",
    };
  }
  const bs = readBrainstemAutonomicGuard(raw);
  if (bs?.autonomicPublishBlocked) {
    return {
      passed: false,
      headline: "Brainstem sympathetic block active",
      detail: "Resolve cerebellar/ethics block before autonomic allow.",
    };
  }
  if (!bs?.brainstemSynced || bs.latestReflex !== "parasympathetic_allow") {
    return {
      passed: false,
      headline: "Brainstem autonomic path not ready",
      detail: "Run brainstem sync after cerebellar clearance.",
    };
  }
  if (bs.meanAutonomicLatencyMs > brainstemAutonomicSloMs()) {
    return {
      passed: false,
      headline: "Brainstem autonomic SLO breached",
      detail: `Mean ${bs.meanAutonomicLatencyMs.toFixed(1)}ms > ${brainstemAutonomicSloMs()}ms.`,
    };
  }
  return {
    passed: true,
    headline: "Brainstem autonomic guard cleared",
    detail: `Parasympathetic allow · ${bs.meanAutonomicLatencyMs.toFixed(1)}ms`,
  };
}
