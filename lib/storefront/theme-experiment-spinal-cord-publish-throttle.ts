/**
 * AG4 — Spinal cord motor publish throttle over AF4 brainstem autonomic guard.
 */

import { toJsonValue } from "@/lib/prisma/json";
import {
  isBrainstemAutonomicGuardEnabled,
  readBrainstemAutonomicGuard,
} from "@/lib/storefront/theme-experiment-brainstem-autonomic-guard";
import {
  isPrefrontalEthicsBoardEnabled,
  readPrefrontalEthicsBoard,
} from "@/lib/storefront/theme-experiment-prefrontal-ethics-board";

export type SpinalPublishAttempt = {
  at: string;
  attemptId: string;
  ethicsWindowId: string;
  blocked: boolean;
  throttleMs: number;
};

export type SpinalCordPublishThrottleSnapshot = {
  at: string;
  attempts: SpinalPublishAttempt[];
  ethicsWindowId: string | null;
  attemptsInWindow: number;
  maxAttemptsPerWindow: number;
  throttleMs: number;
  publishThrottled: boolean;
  brainstemCleared: boolean;
};

export function isSpinalCordPublishThrottleEnabled(): boolean {
  return process.env.THEME_EXPERIMENT_SPINAL_CORD_PUBLISH_THROTTLE === "1";
}

export function spinalMaxPublishAttemptsPerEthicsWindow(): number {
  return Number(process.env.THEME_EXPERIMENT_SPINAL_MAX_PUBLISH_ATTEMPTS ?? "3");
}

export function spinalThrottleMsPerAttempt(): number {
  return Number(process.env.THEME_EXPERIMENT_SPINAL_THROTTLE_MS ?? "120000");
}

function ethicsWindowId(raw: unknown): string | null {
  const board = readPrefrontalEthicsBoard(raw);
  if (!board) return null;
  const pending = board.queue.filter((q) => q.status === "pending");
  if (pending.length > 0) {
    return `pending-${pending[0]!.reviewId}`;
  }
  const last = board.queue[board.queue.length - 1];
  return last ? `ethics-${last.reviewId}-${last.status}` : "ethics-default";
}

export function readSpinalCordPublishThrottle(raw: unknown): SpinalCordPublishThrottleSnapshot | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = (raw as Record<string, unknown>).spinalCordPublishThrottle;
  if (!o || typeof o !== "object" || Array.isArray(o)) return null;
  const s = o as Record<string, unknown>;
  return {
    at: typeof s.at === "string" ? s.at : new Date().toISOString(),
    attempts: Array.isArray(s.attempts) ? (s.attempts as SpinalPublishAttempt[]) : [],
    ethicsWindowId: typeof s.ethicsWindowId === "string" ? s.ethicsWindowId : null,
    attemptsInWindow: typeof s.attemptsInWindow === "number" ? s.attemptsInWindow : 0,
    maxAttemptsPerWindow: typeof s.maxAttemptsPerWindow === "number" ? s.maxAttemptsPerWindow : 3,
    throttleMs: typeof s.throttleMs === "number" ? s.throttleMs : 0,
    publishThrottled: s.publishThrottled === true,
    brainstemCleared: s.brainstemCleared === true,
  };
}

export function mergeSpinalCordPublishThrottle(
  previousRaw: unknown,
  snap: SpinalCordPublishThrottleSnapshot,
): Record<string, unknown> {
  const base =
    previousRaw && typeof previousRaw === "object" && !Array.isArray(previousRaw)
      ? { ...(previousRaw as Record<string, unknown>) }
      : {};
  base.spinalCordPublishThrottle = snap;
  return base;
}

export function recordSpinalPublishAttempt(
  previousRaw: unknown,
  opts?: { blocked?: boolean },
): { json: Record<string, unknown>; snap: SpinalCordPublishThrottleSnapshot } {
  const windowId = ethicsWindowId(previousRaw) ?? "ethics-default";
  const maxAttempts = spinalMaxPublishAttemptsPerEthicsWindow();
  const throttleMs = spinalThrottleMsPerAttempt();

  const prev = readSpinalCordPublishThrottle(previousRaw);
  const windowAttempts = (prev?.attempts ?? []).filter((a) => a.ethicsWindowId === windowId);
  const attemptsInWindow = windowAttempts.length + 1;
  const publishThrottled = attemptsInWindow > maxAttempts;

  const entry: SpinalPublishAttempt = {
    at: new Date().toISOString(),
    attemptId: `spinal-${Date.now()}`,
    ethicsWindowId: windowId,
    blocked: opts?.blocked ?? publishThrottled,
    throttleMs,
  };

  const attempts = [...(prev?.attempts ?? []), entry].slice(-80);
  const bs = readBrainstemAutonomicGuard(previousRaw);
  const brainstemCleared =
    bs?.latestReflex === "parasympathetic_allow" && !bs.autonomicPublishBlocked;

  const snap: SpinalCordPublishThrottleSnapshot = {
    at: new Date().toISOString(),
    attempts,
    ethicsWindowId: windowId,
    attemptsInWindow,
    maxAttemptsPerWindow: maxAttempts,
    throttleMs: publishThrottled ? throttleMs * attemptsInWindow : throttleMs,
    publishThrottled: publishThrottled && brainstemCleared,
    brainstemCleared,
  };

  return { json: mergeSpinalCordPublishThrottle(previousRaw, snap), snap };
}

export function syncSpinalThrottleFromBrainstem(previousRaw: unknown): {
  json: Record<string, unknown>;
  snap: SpinalCordPublishThrottleSnapshot;
} {
  return recordSpinalPublishAttempt(previousRaw, { blocked: false });
}

export function applySpinalThrottleToWetwareJson(previousRaw: unknown): Record<string, unknown> {
  const spinal = readSpinalCordPublishThrottle(previousRaw);
  const base =
    previousRaw && typeof previousRaw === "object" && !Array.isArray(previousRaw)
      ? { ...(previousRaw as Record<string, unknown>) }
      : {};
  if (spinal?.publishThrottled) {
    base.spinalPublishThrottled = true;
    base.spinalThrottleMs = spinal.throttleMs;
  }
  return base;
}

export function evaluateSpinalCordPublishThrottleGate(raw: unknown): {
  passed: boolean;
  headline: string;
  detail: string;
} {
  if (!isSpinalCordPublishThrottleEnabled()) {
    return { passed: true, headline: "Spinal cord publish throttle off", detail: "" };
  }
  if (!isBrainstemAutonomicGuardEnabled()) {
    return {
      passed: false,
      headline: "Brainstem autonomic guard required",
      detail: "Enable THEME_EXPERIMENT_BRAINSTEM_AUTONOMIC_GUARD=1 (AF4).",
    };
  }
  const bs = readBrainstemAutonomicGuard(raw);
  if (!bs?.brainstemSynced || bs.latestReflex !== "parasympathetic_allow") {
    return {
      passed: false,
      headline: "Brainstem path not cleared for spinal throttle",
      detail: "Run brainstem sync after cerebellar clearance.",
    };
  }
  if (isPrefrontalEthicsBoardEnabled()) {
    const board = readPrefrontalEthicsBoard(raw);
    if (board?.publishVetoActive) {
      return {
        passed: false,
        headline: "Ethics veto active — spinal throttle engaged",
        detail: "Resolve ethics review before publish attempts.",
      };
    }
  }
  const spinal = readSpinalCordPublishThrottle(raw);
  if (spinal?.publishThrottled) {
    return {
      passed: false,
      headline: "Spinal cord publish throttle active",
      detail: `${spinal.attemptsInWindow}/${spinal.maxAttemptsPerWindow} attempts in ethics window · wait ${spinal.throttleMs}ms.`,
    };
  }
  return {
    passed: true,
    headline: "Spinal cord publish throttle cleared",
    detail: `Throttle ${spinal?.throttleMs ?? spinalThrottleMsPerAttempt()}ms per attempt window`,
  };
}
