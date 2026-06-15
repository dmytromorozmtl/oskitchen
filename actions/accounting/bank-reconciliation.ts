"use server";


import { revalidatePath } from "next/cache";
import { z } from "zod";

import { recordAuditLog } from "@/lib/audit-log";
import { requireMutationPermission } from "@/lib/permissions/mutation-access";
import type { PermissionKey } from "@/lib/permissions/permissions";
import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import {
  importBankTransactions,
  reconcileTransaction,
} from "@/services/accounting/bank-reconciliation-service";

const importCsvSchema = z.object({
  csv: z.string().min(1),
});

const reconcileSchema = z.object({
  txId: z.string().uuid(),
  matchType: z.enum(["order", "invoice"]),
  matchId: z.string().uuid(),
});

async function requireBankReconciliationPermission(
  permission: PermissionKey,
  operation: string,
): Promise<{ ok: true } | { ok: false }> {
  const access = await requireMutationPermission(permission);
  if (!access.ok) {
    await recordAuditLog({
      userId: access.actor?.sessionUserId ?? null,
      workspaceId: access.actor?.workspaceId ?? null,
      action: "accounting.bank_reconciliation.permission_denied",
      entityType: "BankTransaction",
      metadata: { operation, requiredPermission: permission },
    });
    return { ok: false };
  }
  return { ok: true };
}

export async function importBankCsvAction(formData: FormData): Promise<void> {
  const parsed = importCsvSchema.safeParse({ csv: String(formData.get("csv") ?? "") });
  if (!parsed.success) return;

  const gate = await requireBankReconciliationPermission(
    "reports.read.financial",
    "accounting.bank_reconciliation.import_csv",
  );
  if (!gate.ok) return;

  const { dataUserId } = await requireTenantActor();
  const lines = parsed.data.csv.trim().split("\n").slice(1);
  const transactions = lines
    .map((line) => {
      const [date, description, amount, type, category] = line.split(",").map((s) => s.trim());
      if (!date || !description) return null;
      return {
        date,
        description,
        amount: Number(amount) || 0,
        type: type || "DEPOSIT",
        category: category || undefined,
      };
    })
    .filter(Boolean) as Array<{
    date: string;
    description: string;
    amount: number;
    type: string;
    category?: string;
  }>;

  if (transactions.length) {
    await importBankTransactions(dataUserId, transactions);
  }
  revalidatePath("/dashboard/accounting/bank-reconciliation");
}

export async function reconcileBankTxAction(formData: FormData): Promise<void> {
  const parsed = reconcileSchema.safeParse({
    txId: formData.get("txId"),
    matchType: formData.get("matchType") ?? "order",
    matchId: formData.get("matchId"),
  });
  if (!parsed.success) return;

  const gate = await requireBankReconciliationPermission(
    "reports.read.financial",
    "accounting.bank_reconciliation.reconcile",
  );
  if (!gate.ok) return;

  const { dataUserId } = await requireTenantActor();
  await reconcileTransaction(
    parsed.data.txId,
    dataUserId,
    parsed.data.matchType,
    parsed.data.matchId,
  );
  revalidatePath("/dashboard/accounting/bank-reconciliation");
}
