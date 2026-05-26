/**
 * AE4 — Cerebellar motor organoid: reflex publish guard over AD4 prefrontal ethics board.
 */

import { appendDnaAuditBlock, isDnaAuditTrailEnabled } from "@/lib/compliance/dna-encoded-audit-trail";
import { toJsonValue } from "@/lib/prisma/json";
import {
  isPrefrontalEthicsBoardEnabled,
  readPrefrontalEthicsBoard,
} from "@/lib/storefront/theme-experiment-prefrontal-ethics-board";

export type CerebellarReflexType = "publish_block" | "publish_allow" | "hold";

export type CerebellarMotorReflex = {
  reflexId: string;
  at: string;
  reflexType: CerebellarReflexType;
  latencyMs: number;
  ethicsReviewId: string | null;
  rationale: string;
};

export type CerebellarMotorOrganoidSnapshot = {
  at: string;
  reflexes: CerebellarMotorReflex[];
  latestReflex: CerebellarReflexType | null;
  reflexPublishBlocked: boolean;
  cerebellarSynced: boolean;
  meanReflexLatencyMs: number;
};

export function isCerebellarMotorOrganoidEnabled(): boolean {
  return process.env.THEME_EXPERIMENT_CEREBELLAR_MOTOR_ORGANOID === "1";
}

export function cerebellarReflexSloMs(): number {
  return Number(process.env.THEME_EXPERIMENT_CEREBELLAR_REFLEX_SLO_MS ?? "50");
}

export function readCerebellarMotorOrganoid(raw: unknown): CerebellarMotorOrganoidSnapshot | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = (raw as Record<string, unknown>).cerebellarMotorOrganoid;
  if (!o || typeof o !== "object" || Array.isArray(o)) return null;
  const s = o as Record<string, unknown>;
  return {
    at: typeof s.at === "string" ? s.at : new Date().toISOString(),
    reflexes: Array.isArray(s.reflexes) ? (s.reflexes as CerebellarMotorReflex[]) : [],
    latestReflex: (s.latestReflex as CerebellarReflexType) ?? null,
    reflexPublishBlocked: s.reflexPublishBlocked === true,
    cerebellarSynced: s.cerebellarSynced === true,
    meanReflexLatencyMs: typeof s.meanReflexLatencyMs === "number" ? s.meanReflexLatencyMs : 0,
  };
}

export function mergeCerebellarMotorOrganoid(
  previousRaw: unknown,
  snap: CerebellarMotorOrganoidSnapshot,
): Record<string, unknown> {
  const base =
    previousRaw && typeof previousRaw === "object" && !Array.isArray(previousRaw)
      ? { ...(previousRaw as Record<string, unknown>) }
      : {};
  base.cerebellarMotorOrganoid = snap;
  return base;
}

export function recordCerebellarReflex(
  previousRaw: unknown,
  reflex: Omit<CerebellarMotorReflex, "reflexId" | "at"> & { reflexId?: string; at?: string },
): { json: Record<string, unknown>; snap: CerebellarMotorOrganoidSnapshot } {
  const entry: CerebellarMotorReflex = {
    reflexId: reflex.reflexId ?? `cb-${Date.now()}`,
    at: reflex.at ?? new Date().toISOString(),
    reflexType: reflex.reflexType,
    latencyMs: reflex.latencyMs,
    ethicsReviewId: reflex.ethicsReviewId,
    rationale: reflex.rationale,
  };

  let json =
    previousRaw && typeof previousRaw === "object" && !Array.isArray(previousRaw)
      ? { ...(previousRaw as Record<string, unknown>) }
      : {};

  if (isDnaAuditTrailEnabled()) {
    const dna = appendDnaAuditBlock(json, {
      eventType: "cerebellar_reflex",
      payload: {
        reflexId: entry.reflexId,
        reflexType: entry.reflexType,
        latencyMs: entry.latencyMs,
      },
    });
    json = dna.json;
  }

  const prev = readCerebellarMotorOrganoid(json);
  const reflexes = [...(prev?.reflexes ?? []), entry].slice(-40);
  const latest = reflexes[reflexes.length - 1] ?? null;
  const slo = cerebellarReflexSloMs();
  const meanReflexLatencyMs =
    reflexes.length > 0 ? reflexes.reduce((s, r) => s + r.latencyMs, 0) / reflexes.length : 0;

  const reflexPublishBlocked = latest?.reflexType === "publish_block";
  const cerebellarSynced =
    latest !== null &&
    meanReflexLatencyMs <= slo &&
    latest.reflexType !== "hold";

  const snap: CerebellarMotorOrganoidSnapshot = {
    at: new Date().toISOString(),
    reflexes,
    latestReflex: latest?.reflexType ?? null,
    reflexPublishBlocked,
    cerebellarSynced,
    meanReflexLatencyMs,
  };

  return { json: mergeCerebellarMotorOrganoid(json, snap), snap };
}

export function syncCerebellarFromEthicsBoard(previousRaw: unknown): {
  json: Record<string, unknown>;
  snap: CerebellarMotorOrganoidSnapshot;
} {
  const ethics = readPrefrontalEthicsBoard(previousRaw);
  const latestReview = ethics?.queue[ethics.queue.length - 1];

  let reflexType: CerebellarReflexType = "hold";
  if (ethics?.publishVetoActive || ethics?.pendingCount) {
    reflexType = "publish_block";
  } else if (ethics?.ethicsBoardReady) {
    reflexType = "publish_allow";
  }

  return recordCerebellarReflex(previousRaw, {
    reflexType,
    latencyMs: 12 + (ethics?.pendingCount ?? 0) * 5,
    ethicsReviewId: latestReview?.reviewId ?? null,
    rationale:
      reflexType === "publish_allow"
        ? "Ethics board cleared — cerebellar allow reflex"
        : reflexType === "publish_block"
          ? "Ethics veto or pending — cerebellar block reflex"
          : "Awaiting ethics board",
  });
}

export function applyCerebellarReflexToWetwareJson(previousRaw: unknown): Record<string, unknown> {
  const cb = readCerebellarMotorOrganoid(previousRaw);
  const base =
    previousRaw && typeof previousRaw === "object" && !Array.isArray(previousRaw)
      ? { ...(previousRaw as Record<string, unknown>) }
      : {};
  if (cb?.reflexPublishBlocked) {
    base.cerebellarPublishBlocked = true;
  }
  return base;
}

export function evaluateCerebellarMotorOrganoidGate(raw: unknown): {
  passed: boolean;
  headline: string;
  detail: string;
} {
  if (!isCerebellarMotorOrganoidEnabled()) {
    return { passed: true, headline: "Cerebellar motor organoid off", detail: "" };
  }
  if (!isPrefrontalEthicsBoardEnabled()) {
    return {
      passed: false,
      headline: "Prefrontal ethics board required",
      detail: "Enable THEME_EXPERIMENT_PREFRONTAL_ETHICS_BOARD=1 (AD4).",
    };
  }
  const cb = readCerebellarMotorOrganoid(raw);
  if (cb?.reflexPublishBlocked) {
    return {
      passed: false,
      headline: "Cerebellar reflex blocks publish",
      detail: "Resolve ethics board before motor allow reflex.",
    };
  }
  if (!cb?.cerebellarSynced || cb.latestReflex !== "publish_allow") {
    return {
      passed: false,
      headline: "Cerebellar motor reflex not ready",
      detail: "Run cerebellar sync after ethics board clearance.",
    };
  }
  if (cb.meanReflexLatencyMs > cerebellarReflexSloMs()) {
    return {
      passed: false,
      headline: "Cerebellar reflex SLO breached",
      detail: `Mean ${cb.meanReflexLatencyMs.toFixed(1)}ms > ${cerebellarReflexSloMs()}ms.`,
    };
  }
  return {
    passed: true,
    headline: "Cerebellar motor reflex cleared",
    detail: `Allow reflex · ${cb.meanReflexLatencyMs.toFixed(1)}ms mean latency`,
  };
}
