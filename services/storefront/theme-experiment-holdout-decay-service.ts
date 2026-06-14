import { prisma } from "@/lib/prisma";
import { toJsonValue } from "@/lib/prisma/json";
import { mergeGa4ParityIntoJson } from "@/lib/storefront/ga4-parity-json";
import { isPostWinnerHoldoutActive, readPostWinnerHoldoutPercent } from "@/lib/storefront/theme-experiment-holdout";
import { getThemeExperimentVersion } from "@/lib/storefront/theme-experiment-version";
import { enqueueThemeExperimentEdgeSync } from "@/services/storefront/storefront-edge-sync-job-service";

const DECAY_SCHEDULE = [10, 5, 0] as const;
const DECAY_INTERVAL_MS = 10 * 24 * 60 * 60 * 1000;

function readHoldoutDecayStep(raw: unknown): number {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return 0;
  const v = (raw as Record<string, unknown>).holdoutDecayStep;
  return typeof v === "number" ? Math.max(0, Math.floor(v)) : 0;
}

function readHoldoutDecayAt(raw: unknown): string | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const v = (raw as Record<string, unknown>).holdoutDecayAt;
  return typeof v === "string" ? v : null;
}

/** Step holdout 10% → 5% → 0% over ~30 days after conclude. */
export async function runThemeExperimentHoldoutDecayCycle(): Promise<{
  checked: number;
  decayed: number;
}> {
  const storefronts = await prisma.storefrontSettings.findMany({
    where: { enabled: true },
    select: { id: true, storeSlug: true, themeExperimentJson: true },
  });

  let checked = 0;
  let decayed = 0;

  for (const sf of storefronts) {
    if (!isPostWinnerHoldoutActive(sf.themeExperimentJson)) continue;
    checked++;

    const current = readPostWinnerHoldoutPercent(sf.themeExperimentJson);
    if (current <= 0) continue;

    const step = readHoldoutDecayStep(sf.themeExperimentJson);
    const lastAt = readHoldoutDecayAt(sf.themeExperimentJson);
    if (lastAt && Date.now() - new Date(lastAt).getTime() < DECAY_INTERVAL_MS) continue;

    const nextHoldout = DECAY_SCHEDULE[Math.min(step, DECAY_SCHEDULE.length - 1)] ?? 0;
    if (nextHoldout >= current && step >= DECAY_SCHEDULE.length - 1) continue;

    const base =
      sf.themeExperimentJson && typeof sf.themeExperimentJson === "object" && !Array.isArray(sf.themeExperimentJson)
        ? { ...(sf.themeExperimentJson as Record<string, unknown>) }
        : {};

    base.postWinnerHoldoutPercent = nextHoldout;
    base.holdoutDecayStep = step + 1;
    base.holdoutDecayAt = new Date().toISOString();
    base.version = getThemeExperimentVersion(sf.themeExperimentJson) + 1;
    base.updatedAt = new Date().toISOString();

    await prisma.storefrontSettings.update({
      where: { id: sf.id },
      data: { themeExperimentJson: base as object },
    });

    await enqueueThemeExperimentEdgeSync({
      storefrontId: sf.id,
      storeSlug: sf.storeSlug,
      themeExperimentJson: base,
    });

    decayed++;
  }

  return { checked, decayed };
}
