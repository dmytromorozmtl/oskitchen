import {
  buildApAutomationDemoReport,
  buildApAutomationReport,
  buildInvoiceIntakeQueue,
  buildPaymentReleaseQueue,
  buildPoMatchQueue,
  type ApAutomationReport,
  type ApWorkflowStage,
} from "@/lib/accounting/ap-automation-p2-104-operations";
import { AP_AUTOMATION_P2_104_POLICY_ID } from "@/lib/accounting/ap-automation-p2-104-policy";
import { getAPSummary, listInvoices } from "@/services/accounting/ap-service";

export type ApAutomationSnapshot = ApAutomationReport & {
  policyId: typeof AP_AUTOMATION_P2_104_POLICY_ID;
  mode: "live" | "demo";
  analyzedAt: string;
};

function mapStatusToStage(status: string): ApWorkflowStage {
  switch (status) {
    case "PENDING":
      return "intake";
    case "MATCHED":
      return "po_match";
    case "APPROVED":
      return "payment";
    case "PAID":
      return "complete";
    default:
      return "intake";
  }
}

export async function loadApAutomationSnapshot(userId: string): Promise<ApAutomationSnapshot> {
  try {
    const [invoices, summary] = await Promise.all([
      listInvoices(userId),
      getAPSummary(userId),
    ]);

    if (invoices.length > 0 || summary.pendingCount > 0) {
      const invoiceIntake = buildInvoiceIntakeQueue(
        invoices
          .filter((inv) => inv.status === "PENDING")
          .map((inv) => ({
            invoiceId: inv.id,
            invoiceNumber: inv.invoiceNumber,
            supplierName: inv.supplier.name,
            totalAmount: Number(inv.totalAmount),
            source: inv.notes?.includes("OCR") ? ("ocr" as const) : ("manual" as const),
            status: inv.status,
            receivedAt: inv.invoiceDate.toISOString().slice(0, 10),
          })),
      );

      const poMatches = buildPoMatchQueue(
        invoices
          .filter((inv) => inv.status === "PENDING" || inv.status === "MATCHED")
          .map((inv) => {
            const poLine = inv.lineItems.find((l) => l.purchaseOrderId);
            const varianceAmount = inv.lineItems.reduce(
              (sum, l) => sum + Math.abs(Number(l.variancePrice ?? 0)),
              0,
            );
            return {
              invoiceId: inv.id,
              invoiceNumber: inv.invoiceNumber,
              purchaseOrderId: poLine?.purchaseOrderId ?? null,
              poNumber: poLine?.purchaseOrderId ? `PO-${poLine.purchaseOrderId.slice(0, 8)}` : null,
              supplierName: inv.supplier.name,
              varianceAmount,
              status: inv.status,
            };
          }),
      );

      const paymentRelease = buildPaymentReleaseQueue(
        invoices
          .filter((inv) => inv.status === "APPROVED" || inv.status === "PAID")
          .map((inv) => ({
            invoiceId: inv.id,
            invoiceNumber: inv.invoiceNumber,
            supplierName: inv.supplier.name,
            amount: Number(inv.totalAmount),
            dueDate: inv.dueDate?.toISOString().slice(0, 10) ?? null,
            status: inv.status,
          })),
      );

      const stageRows = invoices.map((inv) => ({
        stage: mapStatusToStage(inv.status),
        amount: Number(inv.totalAmount),
      }));

      const report = buildApAutomationReport({
        stageRows,
        invoiceIntake,
        poMatches,
        paymentRelease,
      });

      return {
        policyId: AP_AUTOMATION_P2_104_POLICY_ID,
        mode: "live",
        analyzedAt: new Date().toISOString(),
        ...report,
      };
    }
  } catch {
    // Fall through to demo fixture
  }

  const report = buildApAutomationDemoReport();

  return {
    policyId: AP_AUTOMATION_P2_104_POLICY_ID,
    mode: "demo",
    analyzedAt: new Date().toISOString(),
    ...report,
  };
}
