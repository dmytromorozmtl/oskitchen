import { beforeEach, describe, expect, it, vi } from "vitest";

const requireMutationPermission = vi.hoisted(() => vi.fn());
const requireTenantActor = vi.hoisted(() => vi.fn());
const recordAuditLog = vi.hoisted(() => vi.fn());
const importBankTransactions = vi.hoisted(() => vi.fn());
const reconcileTransaction = vi.hoisted(() => vi.fn());

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

vi.mock("@/lib/permissions/mutation-access", () => ({
  requireMutationPermission,
}));

vi.mock("@/lib/scope/require-tenant-actor", () => ({
  requireTenantActor,
}));

vi.mock("@/lib/audit-log", () => ({
  recordAuditLog,
}));

vi.mock("@/services/accounting/bank-reconciliation-service", () => ({
  importBankTransactions,
  reconcileTransaction,
}));

import {
  importBankCsvAction,
  reconcileBankTxAction,
} from "@/actions/accounting/bank-reconciliation";

const TX_ID = "11111111-1111-4111-8111-111111111111";
const MATCH_ID = "22222222-2222-4222-8222-222222222222";

const deniedActor = {
  sessionUserId: "staff-1",
  dataUserId: "owner-1",
  workspaceId: "ws-1",
  workspaceRole: "STAFF" as const,
  staffRoleType: "LINE_COOK" as const,
  email: "cook@example.com",
  granted: new Set<string>(),
};

describe("bank reconciliation actions RBAC", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireTenantActor.mockResolvedValue({ dataUserId: "owner-1" });
    importBankTransactions.mockResolvedValue(undefined);
    reconcileTransaction.mockResolvedValue(undefined);
  });

  it("denies importBankCsvAction without reports.read.financial and audits", async () => {
    requireMutationPermission.mockResolvedValue({
      ok: false,
      error: "Forbidden",
      actor: deniedActor,
    });

    const formData = new FormData();
    formData.set(
      "csv",
      "date,description,amount,type\n2026-05-27,Deposit,100.00,DEPOSIT",
    );

    await importBankCsvAction(formData);

    expect(requireMutationPermission).toHaveBeenCalledWith("reports.read.financial");
    expect(requireTenantActor).not.toHaveBeenCalled();
    expect(importBankTransactions).not.toHaveBeenCalled();
    expect(recordAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "accounting.bank_reconciliation.permission_denied",
        metadata: expect.objectContaining({
          operation: "accounting.bank_reconciliation.import_csv",
          requiredPermission: "reports.read.financial",
        }),
      }),
    );
  });

  it("denies reconcileBankTxAction without reports.read.financial and audits", async () => {
    requireMutationPermission.mockResolvedValue({
      ok: false,
      error: "Forbidden",
      actor: deniedActor,
    });

    const formData = new FormData();
    formData.set("txId", TX_ID);
    formData.set("matchType", "order");
    formData.set("matchId", MATCH_ID);

    await reconcileBankTxAction(formData);

    expect(requireMutationPermission).toHaveBeenCalledWith("reports.read.financial");
    expect(reconcileTransaction).not.toHaveBeenCalled();
    expect(recordAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: expect.objectContaining({
          operation: "accounting.bank_reconciliation.reconcile",
        }),
      }),
    );
  });

  it("allows importBankCsvAction when reports.read.financial is granted", async () => {
    requireMutationPermission.mockResolvedValue({ ok: true, actor: deniedActor });

    const formData = new FormData();
    formData.set(
      "csv",
      "date,description,amount,type\n2026-05-27,Deposit,100.00,DEPOSIT",
    );

    await importBankCsvAction(formData);

    expect(requireTenantActor).toHaveBeenCalled();
    expect(importBankTransactions).toHaveBeenCalledWith(
      "owner-1",
      expect.arrayContaining([
        expect.objectContaining({ description: "Deposit", amount: 100 }),
      ]),
    );
  });

  it("allows reconcileBankTxAction when reports.read.financial is granted", async () => {
    requireMutationPermission.mockResolvedValue({ ok: true, actor: deniedActor });

    const formData = new FormData();
    formData.set("txId", TX_ID);
    formData.set("matchType", "invoice");
    formData.set("matchId", MATCH_ID);

    await reconcileBankTxAction(formData);

    expect(reconcileTransaction).toHaveBeenCalledWith(
      TX_ID,
      "owner-1",
      "invoice",
      MATCH_ID,
    );
  });
});
