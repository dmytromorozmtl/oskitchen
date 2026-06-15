"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { fail, ok } from "@/lib/action-result";
import { requireRewardsMutation } from "@/lib/crm/require-rewards-mutation";
import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { safeError } from "@/lib/security";
import { parseRestaurantLoyaltyConfig } from "@/lib/loyalty/restaurant-loyalty-settings";
import {
  loadLoyalty2Program,
  previewLoyalty2Earn,
  saveLoyalty2Program,
} from "@/services/loyalty/loyalty-2.0-service";

const saveSchema = z.object({
  pointsPerDollar: z.coerce.number().min(0).max(100),
  redeemPointsThreshold: z.coerce.number().int().min(1),
  redeemValueCents: z.coerce.number().int().min(1),
  programActive: z
    .union([z.literal("true"), z.literal("false"), z.boolean()])
    .transform((v) => v === true || v === "true"),
  configJson: z.string(),
});

const previewSchema = z.object({
  orderTotal: z.coerce.number().min(0),
  linesJson: z.string().optional(),
  visitCount: z.coerce.number().int().min(0).optional(),
});

export async function saveLoyalty2ProgramAction(formData: FormData) {
  try {
    const access = await requireRewardsMutation({
      required: "loyalty.manage",
      operation: "loyalty.2.save",
      module: "loyalty",
    });
    if (!access.ok) return fail(access.error);

    const parsed = saveSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message ?? "Invalid program");
    }

    let configRaw: unknown;
    try {
      configRaw = JSON.parse(parsed.data.configJson) as unknown;
    } catch {
      return fail("Invalid rules JSON.");
    }

    const config = parseRestaurantLoyaltyConfig(configRaw);
    const { dataUserId } = await requireTenantActor();

    await saveLoyalty2Program(dataUserId, {
      config,
      pointsPerDollar: parsed.data.pointsPerDollar,
      redeemPointsThreshold: parsed.data.redeemPointsThreshold,
      redeemValueCents: parsed.data.redeemValueCents,
      programActive: parsed.data.programActive,
    });

    revalidatePath("/dashboard/loyalty/program-builder");
    revalidatePath("/dashboard/customers/loyalty");

    return ok({ message: "Loyalty 2.0 program saved." });
  } catch (e) {
    return fail(safeError(e));
  }
}

export async function previewLoyalty2ProgramAction(formData: FormData) {
  try {
    const parsed = previewSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message ?? "Invalid preview");
    }

    const { dataUserId } = await requireTenantActor();
    const program = await loadLoyalty2Program(dataUserId);

    let lines: { title: string; productId: string | null; quantity: number; lineTotal: number }[] =
      [];
    if (parsed.data.linesJson) {
      try {
        const raw = JSON.parse(parsed.data.linesJson) as unknown;
        if (Array.isArray(raw)) {
          lines = raw.map((row) => {
            const o = row as Record<string, unknown>;
            return {
              title: String(o.title ?? "Item"),
              productId: typeof o.productId === "string" ? o.productId : null,
              quantity: Number(o.quantity) || 1,
              lineTotal: Number(o.lineTotal) || 0,
            };
          });
        }
      } catch {
        return fail("Invalid lines JSON.");
      }
    }

    const preview = previewLoyalty2Earn(program, {
      orderTotal: parsed.data.orderTotal,
      lines,
      visitCount: parsed.data.visitCount ?? 10,
      lifetimePointsBefore: 600,
    });

    return ok({ preview });
  } catch (e) {
    return fail(safeError(e));
  }
}
