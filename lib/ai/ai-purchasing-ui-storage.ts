import { prisma } from "@/lib/prisma";
import { parseAiPurchasingUiState } from "@/lib/ai/ai-purchasing-dashboard-builders";
import type { AiPurchasingUiState } from "@/lib/ai/ai-purchasing-dashboard-types";
import { EMPTY_AI_PURCHASING_UI_STATE } from "@/lib/ai/ai-purchasing-dashboard-types";

const STORAGE_KEY = "aiPurchasing";

export async function loadAiPurchasingUiState(ownerUserId: string): Promise<AiPurchasingUiState> {
  const kitchen = await prisma.kitchenSettings.findUnique({
    where: { userId: ownerUserId },
    select: { settingsCenterJson: true },
  });
  const center = kitchen?.settingsCenterJson;
  if (!center || typeof center !== "object" || Array.isArray(center)) {
    return EMPTY_AI_PURCHASING_UI_STATE;
  }
  return parseAiPurchasingUiState((center as Record<string, unknown>)[STORAGE_KEY]);
}

export async function saveAiPurchasingUiState(
  ownerUserId: string,
  state: AiPurchasingUiState,
): Promise<void> {
  const kitchen = await prisma.kitchenSettings.findUnique({
    where: { userId: ownerUserId },
    select: { settingsCenterJson: true },
  });

  const existing =
    kitchen?.settingsCenterJson &&
    typeof kitchen.settingsCenterJson === "object" &&
    !Array.isArray(kitchen.settingsCenterJson)
      ? { ...(kitchen.settingsCenterJson as Record<string, unknown>) }
      : {};

  existing[STORAGE_KEY] = state;

  await prisma.kitchenSettings.upsert({
    where: { userId: ownerUserId },
    create: { userId: ownerUserId, settingsCenterJson: existing },
    update: { settingsCenterJson: existing },
  });
}
