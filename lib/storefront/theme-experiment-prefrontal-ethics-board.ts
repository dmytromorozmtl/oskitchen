/**
 * AD4 — Prefrontal ethics board: human-in-the-loop executive veto before publish (AC2).
 */

import { appendDnaAuditBlock, isDnaAuditTrailEnabled } from "@/lib/compliance/dna-encoded-audit-trail";
import { toJsonValue } from "@/lib/prisma/json";
import {
  isPrefrontalOrganoidMeshEnabled,
  readPrefrontalOrganoidMesh,
} from "@/lib/storefront/theme-experiment-prefrontal-organoid-mesh";

export type EthicsReviewStatus = "pending" | "approved" | "vetoed";

export type EthicsReviewEntry = {
  reviewId: string;
  at: string;
  status: EthicsReviewStatus;
  reviewerId: string | null;
  rationale: string;
  armId: string | null;
  dnaBlockIndex: number | null;
};

export type PrefrontalEthicsBoardSnapshot = {
  at: string;
  queue: EthicsReviewEntry[];
  pendingCount: number;
  latestApprovedAt: string | null;
  publishVetoActive: boolean;
  ethicsBoardReady: boolean;
};

export function isPrefrontalEthicsBoardEnabled(): boolean {
  return process.env.THEME_EXPERIMENT_PREFRONTAL_ETHICS_BOARD === "1";
}

export function ethicsBoardAutoApproveSim(): boolean {
  return process.env.THEME_EXPERIMENT_ETHICS_BOARD_AUTO_APPROVE === "1";
}

export function readPrefrontalEthicsBoard(raw: unknown): PrefrontalEthicsBoardSnapshot | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = (raw as Record<string, unknown>).prefrontalEthicsBoard;
  if (!o || typeof o !== "object" || Array.isArray(o)) return null;
  const s = o as Record<string, unknown>;
  return {
    at: typeof s.at === "string" ? s.at : new Date().toISOString(),
    queue: Array.isArray(s.queue) ? (s.queue as EthicsReviewEntry[]) : [],
    pendingCount: typeof s.pendingCount === "number" ? s.pendingCount : 0,
    latestApprovedAt: typeof s.latestApprovedAt === "string" ? s.latestApprovedAt : null,
    publishVetoActive: s.publishVetoActive === true,
    ethicsBoardReady: s.ethicsBoardReady === true,
  };
}

export function mergePrefrontalEthicsBoard(
  previousRaw: unknown,
  snap: PrefrontalEthicsBoardSnapshot,
): Record<string, unknown> {
  const base =
    previousRaw && typeof previousRaw === "object" && !Array.isArray(previousRaw)
      ? { ...(previousRaw as Record<string, unknown>) }
      : {};
  base.prefrontalEthicsBoard = snap;
  return base;
}

export function enqueueEthicsReview(
  previousRaw: unknown,
  entry: Omit<EthicsReviewEntry, "reviewId" | "at" | "dnaBlockIndex"> & {
    reviewId?: string;
    at?: string;
  },
): { json: Record<string, unknown>; snap: PrefrontalEthicsBoardSnapshot } {
  const review: EthicsReviewEntry = {
    reviewId: entry.reviewId ?? `ethics-${Date.now()}`,
    at: entry.at ?? new Date().toISOString(),
    status: entry.status,
    reviewerId: entry.reviewerId,
    rationale: entry.rationale,
    armId: entry.armId,
    dnaBlockIndex: null,
  };

  let json =
    previousRaw && typeof previousRaw === "object" && !Array.isArray(previousRaw)
      ? { ...(previousRaw as Record<string, unknown>) }
      : {};

  if (isDnaAuditTrailEnabled() && (entry.status === "approved" || entry.status === "vetoed")) {
    const dna = appendDnaAuditBlock(json, {
      eventType: "ethics_review",
      payload: {
        reviewId: review.reviewId,
        status: review.status,
        rationale: review.rationale,
        armId: review.armId,
      },
    });
    json = dna.json;
    review.dnaBlockIndex = dna.block.blockIndex;
  }

  const prev = readPrefrontalEthicsBoard(json);
  const queue = [...(prev?.queue ?? []), review].slice(-50);
  const pending = queue.filter((q) => q.status === "pending");
  const latestApproved = [...queue].reverse().find((q) => q.status === "approved");
  const publishVetoActive = queue.some((q) => q.status === "vetoed" && !latestApproved);

  const snap: PrefrontalEthicsBoardSnapshot = {
    at: new Date().toISOString(),
    queue,
    pendingCount: pending.length,
    latestApprovedAt: latestApproved?.at ?? null,
    publishVetoActive,
    ethicsBoardReady: !publishVetoActive && pending.length === 0 && latestApproved !== undefined,
  };

  return { json: mergePrefrontalEthicsBoard(json, snap), snap };
}

/** Sync ethics queue from prefrontal executive gates — auto-approve in sim when configured. */
export function syncEthicsBoardFromPrefrontal(previousRaw: unknown): {
  json: Record<string, unknown>;
  snap: PrefrontalEthicsBoardSnapshot;
} {
  const pfc = readPrefrontalOrganoidMesh(previousRaw);
  const goArms = pfc?.gates.filter((g) => g.decision === "go").map((g) => g.armId) ?? [];

  let json = previousRaw as Record<string, unknown>;
  for (const armId of goArms.slice(0, 2)) {
    const status: EthicsReviewStatus = ethicsBoardAutoApproveSim() ? "approved" : "pending";
    const result = enqueueEthicsReview(json, {
      status,
      reviewerId: ethicsBoardAutoApproveSim() ? "sim-reviewer" : null,
      rationale: `Executive go gate for ${armId}`,
      armId,
    });
    json = result.json;
  }

  if (goArms.length === 0) {
    const result = enqueueEthicsReview(json, {
      status: ethicsBoardAutoApproveSim() ? "approved" : "pending",
      reviewerId: ethicsBoardAutoApproveSim() ? "sim-reviewer" : null,
      rationale: "Prefrontal mesh baseline ethics review",
      armId: null,
    });
    json = result.json;
  }

  const snap = readPrefrontalEthicsBoard(json)!;
  return { json, snap };
}

export function applyEthicsVetoToWetwareJson(previousRaw: unknown): Record<string, unknown> {
  const board = readPrefrontalEthicsBoard(previousRaw);
  if (!board?.publishVetoActive) {
    return previousRaw && typeof previousRaw === "object" && !Array.isArray(previousRaw)
      ? { ...(previousRaw as Record<string, unknown>) }
      : {};
  }
  const base =
    previousRaw && typeof previousRaw === "object" && !Array.isArray(previousRaw)
      ? { ...(previousRaw as Record<string, unknown>) }
      : {};
  base.ethicsPublishBlocked = true;
  return base;
}

export function evaluatePrefrontalEthicsBoardGate(raw: unknown): {
  passed: boolean;
  headline: string;
  detail: string;
} {
  if (!isPrefrontalEthicsBoardEnabled()) {
    return { passed: true, headline: "Prefrontal ethics board off", detail: "" };
  }
  if (!isPrefrontalOrganoidMeshEnabled()) {
    return {
      passed: false,
      headline: "Prefrontal organoid mesh required",
      detail: "Enable THEME_EXPERIMENT_PREFRONTAL_ORGANOID_MESH=1 (AC2).",
    };
  }
  const board = readPrefrontalEthicsBoard(raw);
  if (board?.publishVetoActive) {
    return {
      passed: false,
      headline: "Ethics board veto active",
      detail: "Resolve vetoed review before publish.",
    };
  }
  if (board && board.pendingCount > 0) {
    return {
      passed: false,
      headline: "Ethics reviews pending",
      detail: `${board.pendingCount} review(s) await human approval.`,
    };
  }
  if (!board?.ethicsBoardReady) {
    return {
      passed: false,
      headline: "Ethics board not ready",
      detail: "Run ethics sync after prefrontal executive gating.",
    };
  }
  return {
    passed: true,
    headline: "Ethics board cleared for publish",
    detail: `Approved ${board.latestApprovedAt ?? "—"}`,
  };
}
