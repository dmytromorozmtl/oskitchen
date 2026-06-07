/**
 * Suspense / skeleton test harness — slow network, layout stability, hang guard.
 */

import { SUSPENSE_SKELETON_MAX_HANG_MS } from "@/lib/testing/suspense-skeleton-policy";

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

/** Simulates slow network before an async server/component load resolves. */
export async function runWithSlowNetworkThrottle<T>(
  operation: () => Promise<T>,
  throttleMs: number,
): Promise<{ result: T; elapsedMs: number }> {
  const start = Date.now();
  if (throttleMs > 0) {
    await delay(throttleMs);
  }
  const result = await operation();
  return { result, elapsedMs: Date.now() - start };
}

/**
 * Race an async load against a hang budget — mirrors Suspense pending timeout guard.
 */
export async function waitForSuspenseBoundary<T>(
  load: () => Promise<T>,
  options: {
    throttleMs?: number;
    maxWaitMs?: number;
  } = {},
): Promise<T> {
  const throttleMs = options.throttleMs ?? 0;
  const maxWaitMs = options.maxWaitMs ?? SUSPENSE_SKELETON_MAX_HANG_MS;

  let timedOut = false;
  let throttleTimer: ReturnType<typeof setTimeout> | undefined;
  let hangTimer: ReturnType<typeof setTimeout> | undefined;

  const hangPromise = new Promise<never>((_, reject) => {
    hangTimer = setTimeout(() => {
      timedOut = true;
      if (throttleTimer !== undefined) {
        clearTimeout(throttleTimer);
      }
      reject(new Error(`Suspense boundary hung (> ${maxWaitMs}ms)`));
    }, maxWaitMs);
  });

  const workPromise = new Promise<T>((resolve, reject) => {
    const runLoad = async () => {
      try {
        if (throttleMs > 0) {
          await new Promise<void>((resolveDelay, rejectDelay) => {
            throttleTimer = setTimeout(() => {
              if (timedOut) {
                rejectDelay(new Error("aborted"));
                return;
              }
              resolveDelay();
            }, throttleMs);
          });
        }
        if (timedOut) {
          reject(new Error("aborted"));
          return;
        }
        resolve(await load());
      } catch (error) {
        reject(error);
      }
    };
    void runLoad();
  });

  try {
    return await Promise.race([workPromise, hangPromise]);
  } finally {
    if (hangTimer !== undefined) {
      clearTimeout(hangTimer);
    }
    if (throttleTimer !== undefined) {
      clearTimeout(throttleTimer);
    }
  }
}

export function auditSkeletonMarkup(markup: string): {
  ok: boolean;
  failures: string[];
} {
  const failures: string[] = [];

  if (!markup.includes("animate-pulse")) {
    failures.push("missing animate-pulse (visible loading feedback)");
  }

  if (!markup.includes('aria-busy="true"')) {
    failures.push("missing aria-busy");
  }

  if (!/data-testid="[^"]*skeleton/.test(markup)) {
    failures.push("missing skeleton data-testid");
  }

  const fixedHeightTokens = markup.match(/\bh-\[[^\]]+\]|\bh-\d+(?:\.\d+)?/g) ?? [];
  if (fixedHeightTokens.length < 3) {
    failures.push("insufficient fixed-height placeholders (layout shift risk)");
  }

  return { ok: failures.length === 0, failures };
}

/** Ensures skeleton reserves vertical space — no zero-height fallback flash. */
export function auditSkeletonLayoutStability(source: string): {
  ok: boolean;
  failures: string[];
} {
  const failures: string[] = [];

  if (!source.includes("LoadingSkeleton") && !source.includes("animate-pulse")) {
    failures.push("missing LoadingSkeleton or pulse animation");
  }

  if (!source.includes("aria-busy")) {
    failures.push("missing aria-busy on skeleton container");
  }

  const heightClasses = source.match(/\bh-\[[^\]]+\]|\bh-\d+(?:\.\d+)?/g) ?? [];
  if (heightClasses.length < 4) {
    failures.push("too few explicit height classes for CLS prevention");
  }

  if (!/bg-muted|bg-card/.test(source)) {
    failures.push("missing dark-mode-safe surface token (bg-muted/bg-card)");
  }

  return { ok: failures.length === 0, failures };
}

export function countSuspenseBoundaries(pageSource: string): number {
  return (pageSource.match(/<Suspense/g) ?? []).length;
}
