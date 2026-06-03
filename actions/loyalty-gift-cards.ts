"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { fail, ok } from "@/lib/action-result";
import { requireRewardsMutation } from "@/lib/crm/require-rewards-mutation";
import { parseGiftCardProgramSettings } from "@/lib/loyalty/gift-cards-settings";
import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { safeError } from "@/lib/security";
import {
  issueDigitalGiftCard,
  issuePhysicalGiftCardBatch,
  markPhysicalGiftCardsPrinted,
  saveGiftCardProgram,
} from "@/services/loyalty/gift-cards-service";

const saveProgramSchema = z.object({
  digitalEnabled: z
    .union([z.literal("true"), z.literal("false"), z.boolean()])
    .transform((v) => v === true || v === "true"),
  physicalEnabled: z
    .union([z.literal("true"), z.literal("false"), z.boolean()])
    .transform((v) => v === true || v === "true"),
  denominations: z.string(),
  physicalCodePrefix: z.string().max(6),
});

const digitalSchema = z.object({
  amount: z.coerce.number().positive().max(10_000),
  recipientEmail: z
    .union([z.string().email(), z.literal("")])
    .optional()
    .transform((v) => (v ? v : undefined)),
  notes: z
    .union([z.string().max(2000), z.literal("")])
    .optional()
    .transform((v) => (v ? v : undefined)),
});

const physicalBatchSchema = z.object({
  amount: z.coerce.number().positive().max(10_000),
  count: z.coerce.number().int().min(1).max(50),
  label: z
    .union([z.string().max(120), z.literal("")])
    .optional()
    .transform((v) => (v ? v : undefined)),
});

const markPrintedSchema = z.object({
  batchId: z.string().min(4).max(64),
});

function revalidateGiftCardPaths() {
  revalidatePath("/dashboard/loyalty/gift-cards");
  revalidatePath("/dashboard/gift-cards");
}

export async function saveGiftCardProgramAction(formData: FormData) {
  try {
    const access = await requireRewardsMutation({
      required: "giftcards.manage",
      operation: "loyalty.gift_cards.save_program",
      module: "gift_cards",
    });
    if (!access.ok) return fail(access.error);

    const raw = Object.fromEntries(formData) as Record<string, FormDataEntryValue>;
    if (!raw.digitalEnabled) raw.digitalEnabled = "false";
    if (!raw.physicalEnabled) raw.physicalEnabled = "false";
    const parsed = saveProgramSchema.safeParse(raw);
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message ?? "Invalid program settings");
    }

    const denominations = parsed.data.denominations
      .split(/[,;\s]+/)
      .map((s) => Math.round(Number(s)))
      .filter((n) => Number.isFinite(n) && n > 0);

    const program = parseGiftCardProgramSettings({
      digitalEnabled: parsed.data.digitalEnabled,
      physicalEnabled: parsed.data.physicalEnabled,
      denominations,
      physicalCodePrefix: parsed.data.physicalCodePrefix,
    });

    const { dataUserId } = await requireTenantActor();
    await saveGiftCardProgram(dataUserId, program);
    revalidateGiftCardPaths();
    return ok({ saved: true });
  } catch (e) {
    return fail(safeError(e));
  }
}

export async function issueDigitalGiftCardAction(formData: FormData) {
  try {
    const access = await requireRewardsMutation({
      required: "giftcards.manage",
      operation: "loyalty.gift_cards.issue_digital",
      module: "gift_cards",
    });
    if (!access.ok) return fail(access.error);

    const parsed = digitalSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message ?? "Invalid digital card");
    }

    const { dataUserId } = await requireTenantActor();
    const card = await issueDigitalGiftCard(dataUserId, parsed.data);
    revalidateGiftCardPaths();
    return ok({ code: card.code, id: card.id });
  } catch (e) {
    return fail(safeError(e));
  }
}

export async function issuePhysicalGiftCardBatchAction(formData: FormData) {
  try {
    const access = await requireRewardsMutation({
      required: "giftcards.manage",
      operation: "loyalty.gift_cards.issue_physical_batch",
      module: "gift_cards",
    });
    if (!access.ok) return fail(access.error);

    const parsed = physicalBatchSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message ?? "Invalid physical batch");
    }

    const { dataUserId } = await requireTenantActor();
    const result = await issuePhysicalGiftCardBatch(dataUserId, parsed.data);
    revalidateGiftCardPaths();
    return ok({
      batchId: result.batchId,
      codes: result.cards.map((c) => c.code),
    });
  } catch (e) {
    return fail(safeError(e));
  }
}

export async function markPhysicalBatchPrintedAction(formData: FormData) {
  try {
    const access = await requireRewardsMutation({
      required: "giftcards.manage",
      operation: "loyalty.gift_cards.mark_printed",
      module: "gift_cards",
    });
    if (!access.ok) return fail(access.error);

    const parsed = markPrintedSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message ?? "Invalid batch id");
    }

    const { dataUserId } = await requireTenantActor();
    const updated = await markPhysicalGiftCardsPrinted(dataUserId, parsed.data.batchId);
    revalidateGiftCardPaths();
    return ok({ updated });
  } catch (e) {
    return fail(safeError(e));
  }
}
