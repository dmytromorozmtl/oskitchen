/**
 * Pure helpers for AP automation workflow (Blueprint P2-104).
 */

export type ApWorkflowStage = "intake" | "po_match" | "approval" | "payment" | "complete";

export type ApWorkflowStageSummary = {
  stage: ApWorkflowStage;
  label: string;
  count: number;
  totalAmount: number;
  description: string;
};

export type InvoiceIntakeRow = {
  invoiceId: string;
  invoiceNumber: string;
  supplierName: string;
  totalAmount: number;
  source: "ocr" | "manual";
  status: string;
  receivedAt: string;
};

export type PoMatchRow = {
  invoiceId: string;
  invoiceNumber: string;
  purchaseOrderId: string | null;
  poNumber: string | null;
  supplierName: string;
  matchStatus: "unmatched" | "matched" | "variance";
  varianceAmount: number;
  recommendation: string;
};

export type PaymentReleaseRow = {
  invoiceId: string;
  invoiceNumber: string;
  supplierName: string;
  amount: number;
  dueDate: string | null;
  status: "approved" | "queued" | "paid";
  daysUntilDue: number | null;
};

export type ApAutomationReport = {
  stageSummaryCount: number;
  invoiceIntakeCount: number;
  poMatchCount: number;
  paymentReleaseCount: number;
  pendingAmount: number;
  approvedAmount: number;
  stageSummaries: ApWorkflowStageSummary[];
  invoiceIntake: InvoiceIntakeRow[];
  poMatches: PoMatchRow[];
  paymentRelease: PaymentReleaseRow[];
};

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

const STAGE_LABELS: Record<ApWorkflowStage, string> = {
  intake: "Invoice intake",
  po_match: "PO matching",
  approval: "Approval",
  payment: "Payment release",
  complete: "Complete",
};

export function buildApWorkflowStageSummaries(
  rows: Array<{ stage: ApWorkflowStage; amount: number }>,
): ApWorkflowStageSummary[] {
  const grouped = new Map<ApWorkflowStage, { count: number; totalAmount: number }>();

  for (const row of rows) {
    const current = grouped.get(row.stage) ?? { count: 0, totalAmount: 0 };
    current.count += 1;
    current.totalAmount = round2(current.totalAmount + row.amount);
    grouped.set(row.stage, current);
  }

  const stages: ApWorkflowStage[] = ["intake", "po_match", "approval", "payment", "complete"];

  return stages.map((stage) => {
    const data = grouped.get(stage) ?? { count: 0, totalAmount: 0 };
    return {
      stage,
      label: STAGE_LABELS[stage],
      count: data.count,
      totalAmount: data.totalAmount,
      description:
        stage === "intake"
          ? "Invoices awaiting PO match"
          : stage === "po_match"
            ? "Matched to PO — variance review"
            : stage === "approval"
              ? "Awaiting manager approval"
              : stage === "payment"
                ? "Approved — payment queue"
                : "Paid and closed",
    };
  });
}

export function buildInvoiceIntakeQueue(
  invoices: Array<{
    invoiceId: string;
    invoiceNumber: string;
    supplierName: string;
    totalAmount: number;
    source: "ocr" | "manual";
    status: string;
    receivedAt: string;
  }>,
): InvoiceIntakeRow[] {
  return invoices
    .map((row) => ({
      ...row,
      totalAmount: round2(row.totalAmount),
    }))
    .sort((a, b) => b.receivedAt.localeCompare(a.receivedAt));
}

export function buildPoMatchQueue(
  rows: Array<{
    invoiceId: string;
    invoiceNumber: string;
    purchaseOrderId: string | null;
    poNumber: string | null;
    supplierName: string;
    varianceAmount: number;
    status: string;
  }>,
): PoMatchRow[] {
  return rows
    .map((row) => {
      const matchStatus: PoMatchRow["matchStatus"] =
        row.status === "MATCHED" && row.varianceAmount === 0
          ? "matched"
          : row.status === "MATCHED" || row.purchaseOrderId
            ? "variance"
            : "unmatched";

      const recommendation =
        matchStatus === "unmatched"
          ? "Match invoice to open PO — verify supplier and line items."
          : matchStatus === "variance"
            ? "Review qty/price variance before approval — typical tolerance ±5%."
            : "PO matched — ready for approval.";

      return {
        invoiceId: row.invoiceId,
        invoiceNumber: row.invoiceNumber,
        purchaseOrderId: row.purchaseOrderId,
        poNumber: row.poNumber,
        supplierName: row.supplierName,
        matchStatus,
        varianceAmount: round2(Math.abs(row.varianceAmount)),
        recommendation,
      };
    })
    .sort((a, b) => {
      const order = { unmatched: 0, variance: 1, matched: 2 };
      return order[a.matchStatus] - order[b.matchStatus];
    });
}

export function buildPaymentReleaseQueue(
  rows: Array<{
    invoiceId: string;
    invoiceNumber: string;
    supplierName: string;
    amount: number;
    dueDate: string | null;
    status: string;
  }>,
): PaymentReleaseRow[] {
  const now = Date.now();

  return rows
    .map((row) => {
      const daysUntilDue =
        row.dueDate != null
          ? Math.ceil((new Date(row.dueDate).getTime() - now) / (1000 * 60 * 60 * 24))
          : null;

      const status: PaymentReleaseRow["status"] =
        row.status === "PAID" ? "paid" : row.status === "APPROVED" ? "queued" : "approved";

      return {
        invoiceId: row.invoiceId,
        invoiceNumber: row.invoiceNumber,
        supplierName: row.supplierName,
        amount: round2(row.amount),
        dueDate: row.dueDate,
        status,
        daysUntilDue,
      };
    })
    .sort((a, b) => (a.daysUntilDue ?? 999) - (b.daysUntilDue ?? 999));
}

export function buildApAutomationReport(input: {
  stageRows: Array<{ stage: ApWorkflowStage; amount: number }>;
  invoiceIntake: InvoiceIntakeRow[];
  poMatches: PoMatchRow[];
  paymentRelease: PaymentReleaseRow[];
}): ApAutomationReport {
  const stageSummaries = buildApWorkflowStageSummaries(input.stageRows);
  const pendingAmount = round2(
    input.invoiceIntake.reduce((sum, r) => sum + r.totalAmount, 0) +
      input.poMatches
        .filter((r) => r.matchStatus !== "matched")
        .reduce((sum, r) => sum + r.varianceAmount, 0),
  );
  const approvedAmount = round2(
    input.paymentRelease
      .filter((r) => r.status === "queued" || r.status === "approved")
      .reduce((sum, r) => sum + r.amount, 0),
  );

  return {
    stageSummaryCount: stageSummaries.filter((s) => s.count > 0).length,
    invoiceIntakeCount: input.invoiceIntake.length,
    poMatchCount: input.poMatches.length,
    paymentReleaseCount: input.paymentRelease.length,
    pendingAmount,
    approvedAmount,
    stageSummaries,
    invoiceIntake: input.invoiceIntake,
    poMatches: input.poMatches,
    paymentRelease: input.paymentRelease,
  };
}

/** Demo fixture — deterministic AP workflow without DB. */
export const AP_AUTOMATION_DEMO_INTAKE = [
  {
    invoiceId: "inv-001",
    invoiceNumber: "SYSCO-8842",
    supplierName: "Sysco",
    totalAmount: 1240.5,
    source: "ocr" as const,
    status: "PENDING",
    receivedAt: "2026-03-08",
  },
  {
    invoiceId: "inv-002",
    invoiceNumber: "USF-2201",
    supplierName: "US Foods",
    totalAmount: 890.0,
    source: "manual" as const,
    status: "PENDING",
    receivedAt: "2026-03-07",
  },
] as const;

export const AP_AUTOMATION_DEMO_PO_MATCHES = [
  {
    invoiceId: "inv-003",
    invoiceNumber: "RD-4410",
    purchaseOrderId: "po-101",
    poNumber: "PO-2026-0101",
    supplierName: "Restaurant Depot",
    varianceAmount: 12.4,
    status: "MATCHED",
  },
  {
    invoiceId: "inv-004",
    invoiceNumber: "LOCAL-992",
    purchaseOrderId: null,
    poNumber: null,
    supplierName: "Local Produce Co",
    varianceAmount: 0,
    status: "PENDING",
  },
] as const;

export const AP_AUTOMATION_DEMO_PAYMENTS = [
  {
    invoiceId: "inv-005",
    invoiceNumber: "SYSCO-8801",
    supplierName: "Sysco",
    amount: 2100.0,
    dueDate: "2026-03-15",
    status: "APPROVED",
  },
  {
    invoiceId: "inv-006",
    invoiceNumber: "USF-2190",
    supplierName: "US Foods",
    amount: 675.5,
    dueDate: "2026-03-20",
    status: "PAID",
  },
] as const;

export function buildApAutomationDemoReport(): ApAutomationReport {
  const invoiceIntake = buildInvoiceIntakeQueue([...AP_AUTOMATION_DEMO_INTAKE]);
  const poMatches = buildPoMatchQueue([...AP_AUTOMATION_DEMO_PO_MATCHES]);
  const paymentRelease = buildPaymentReleaseQueue([...AP_AUTOMATION_DEMO_PAYMENTS]);

  const stageRows: Array<{ stage: ApWorkflowStage; amount: number }> = [
    ...invoiceIntake.map((r) => ({ stage: "intake" as const, amount: r.totalAmount })),
    ...poMatches.map((r) => ({ stage: "po_match" as const, amount: r.varianceAmount || 100 })),
    ...paymentRelease
      .filter((r) => r.status === "queued")
      .map((r) => ({ stage: "payment" as const, amount: r.amount })),
    ...paymentRelease
      .filter((r) => r.status === "paid")
      .map((r) => ({ stage: "complete" as const, amount: r.amount })),
  ];

  return buildApAutomationReport({
    stageRows,
    invoiceIntake,
    poMatches,
    paymentRelease,
  });
}
