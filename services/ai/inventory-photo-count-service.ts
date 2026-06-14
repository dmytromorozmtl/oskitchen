import OpenAI from "openai";

import { assertAiAllowed } from "@/lib/ai/assert-ai-allowed";
import { recordAIUsage, estimateTokens } from "@/lib/ai/budget-guard";
import {
  matchDetectionsToIngredients,
  parseShelfCountJson,
} from "@/lib/inventory/inventory-ai-photo-count-p2-63-scoring";
import {
  INVENTORY_PHOTO_COUNT_NOTES_MARKER,
  INVENTORY_PHOTO_COUNT_POLICY_ID,
  type MatchedShelfCountLine,
  type ShelfPhotoCountResult,
} from "@/lib/inventory/inventory-photo-count-types";
import { prisma } from "@/lib/prisma";
import {
  ingredientListWhereForOwner,
  inventoryCountByIdWhereForOwner,
} from "@/lib/scope/workspace-resource-scope";
import {
  getInventoryCountDetail,
  submitCountItem,
} from "@/services/inventory/count-service";

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

export type ApplyShelfCountsResult = {
  appliedCount: number;
  skippedCount: number;
  lines: MatchedShelfCountLine[];
};

export async function scanShelfPhotoForCounts(
  imageBase64: string,
  userId: string,
  workspaceId: string,
): Promise<ShelfPhotoCountResult> {
  if (!openai) {
    return {
      detections: [],
      shelfLabel: null,
      confidence: 0,
      policyId: INVENTORY_PHOTO_COUNT_POLICY_ID,
    };
  }

  const limit = await assertAiAllowed({
    userId,
    workspaceId,
    kind: "ai_ocr",
    estimatedText: imageBase64.slice(0, 4000),
  });
  if (!limit.ok) {
    return {
      detections: [],
      shelfLabel: null,
      confidence: 0,
      policyId: INVENTORY_PHOTO_COUNT_POLICY_ID,
    };
  }

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You count visible inventory items on restaurant storage shelves from photos. Return JSON only: { shelfLabel, confidence, items: [{ label, quantity, confidence }] }. quantity must be a non-negative integer count of visible units/packages.",
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Count every distinct inventory item visible on this shelf photo.",
          },
          {
            type: "image_url",
            image_url: { url: `data:image/jpeg;base64,${imageBase64}` },
          },
        ],
      },
    ],
    max_tokens: 1200,
    temperature: 0.1,
  });

  const content = response.choices[0]?.message?.content ?? "{}";
  const cleaned = content.replace(/```json|```/g, "").trim();
  let parsed: Record<string, unknown> = {};
  try {
    parsed = JSON.parse(cleaned) as Record<string, unknown>;
  } catch {
    parsed = {};
  }

  const mapped = parseShelfCountJson(parsed);

  void recordAIUsage(workspaceId, estimateTokens(content), "inventory_photo_count");

  return {
    detections: mapped.detections,
    shelfLabel: mapped.shelfLabel,
    confidence: mapped.confidence,
    policyId: INVENTORY_PHOTO_COUNT_POLICY_ID,
  };
}

export async function matchShelfCountsForUser(
  userId: string,
  detections: ShelfPhotoCountResult["detections"],
): Promise<MatchedShelfCountLine[]> {
  const ingredientWhere = await ingredientListWhereForOwner(userId);
  const ingredients = await prisma.ingredient.findMany({
    where: { AND: [ingredientWhere, { active: true }] },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return matchDetectionsToIngredients(detections, ingredients);
}

export async function applyShelfCountsToInventoryCount(
  userId: string,
  countId: string,
  lines: readonly MatchedShelfCountLine[],
): Promise<ApplyShelfCountsResult> {
  const count = await getInventoryCountDetail(countId, userId);
  if (!count) throw new Error("Inventory count not found.");
  if (count.status !== "IN_PROGRESS") throw new Error("Count is not in progress.");

  let appliedCount = 0;
  let skippedCount = 0;

  for (const line of lines) {
    if (!line.ingredientId) {
      skippedCount += 1;
      continue;
    }

    const countItem = count.items.find((item) => item.ingredientId === line.ingredientId);
    if (!countItem) {
      skippedCount += 1;
      continue;
    }

    await submitCountItem(
      countItem.id,
      userId,
      line.quantity,
      `${INVENTORY_PHOTO_COUNT_NOTES_MARKER}: ${line.detectedLabel}`,
    );
    appliedCount += 1;
  }

  return { appliedCount, skippedCount, lines: [...lines] };
}

export async function resolveOwnerUserIdForWorkspace(workspaceId: string): Promise<string> {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { ownerUserId: true },
  });
  if (!workspace?.ownerUserId) {
    throw new Error(`Workspace not found: ${workspaceId}`);
  }
  return workspace.ownerUserId;
}

export async function assertCountAccessible(countId: string, userId: string): Promise<void> {
  const count = await prisma.inventoryCount.findFirst({
    where: await inventoryCountByIdWhereForOwner(userId, countId),
    select: { id: true },
  });
  if (!count) throw new Error("Inventory count not found.");
}

export { parseShelfCountJson, matchDetectionsToIngredients };
