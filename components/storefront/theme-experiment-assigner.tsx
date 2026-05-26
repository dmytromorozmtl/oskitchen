"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { readThemeExperimentArmFromCookie } from "@/lib/storefront/experiment-arm-client";
import { ingestStorefrontFirstPartyEvent } from "@/lib/storefront/storefront-first-party-ingest";
import type { ThemeExperimentArm } from "@/lib/storefront/theme-experiment";

function exposureStorageKey(storeSlug: string) {
  return `kos_exp_exposure_${storeSlug}`;
}

async function trackExperimentExposure(storeSlug: string, arm: ThemeExperimentArm) {
  await ingestStorefrontFirstPartyEvent({
    storeSlug,
    eventName: "experiment.exposure",
    path: typeof window !== "undefined" ? window.location.pathname : "/",
    metadata: { experimentArm: arm },
  });
}

async function trackThemeApply(storeSlug: string, arm: ThemeExperimentArm) {
  if (arm !== "draft") return;
  await ingestStorefrontFirstPartyEvent({
    storeSlug,
    eventName: "theme_apply",
    path: typeof window !== "undefined" ? window.location.pathname : "/",
    metadata: { experimentArm: arm },
  });
}

/**
 * Assigns kos_ab_theme when needed. Edge middleware sets cookie first (5B);
 * this component is the app fallback (5D) and fires exposure / theme_apply analytics (5E).
 */
export function ThemeExperimentAssigner({
  storeSlug,
  enabled,
  edgeMode = false,
}: {
  storeSlug: string;
  enabled: boolean;
  /** THEME_EXPERIMENT_EDGE=1 — cookie may already be set by middleware. */
  edgeMode?: boolean;
}) {
  const router = useRouter();
  const ran = React.useRef(false);

  React.useEffect(() => {
    if (!enabled || ran.current) return;
    if (typeof document === "undefined") return;
    ran.current = true;

    const existing = readThemeExperimentArmFromCookie();
    if (existing) {
      const key = exposureStorageKey(storeSlug);
      if (!sessionStorage.getItem(key)) {
        sessionStorage.setItem(key, "1");
        void trackExperimentExposure(storeSlug, existing).then(() =>
          trackThemeApply(storeSlug, existing),
        );
      }
      return;
    }

    if (edgeMode) {
      /** Edge config miss or first paint before middleware cookie — retry assign API once. */
      const t = window.setTimeout(() => {
        if (readThemeExperimentArmFromCookie()) return;
        void assignViaApi(storeSlug, router);
      }, 400);
      return () => window.clearTimeout(t);
    }

    void assignViaApi(storeSlug, router);
  }, [enabled, storeSlug, router, edgeMode]);

  return null;
}

async function assignViaApi(storeSlug: string, router: ReturnType<typeof useRouter>) {
  const res = await fetch("/api/storefront/theme-experiment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ storeSlug }),
  });
  const json = (await res.json().catch(() => ({}))) as { arm?: string };
  const arm: ThemeExperimentArm = json.arm === "draft" ? "draft" : "published";
  const key = exposureStorageKey(storeSlug);
  if (!sessionStorage.getItem(key)) {
    sessionStorage.setItem(key, "1");
    await trackExperimentExposure(storeSlug, arm);
    await trackThemeApply(storeSlug, arm);
  }
  router.refresh();
}
