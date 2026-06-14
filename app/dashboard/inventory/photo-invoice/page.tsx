import { InvoiceAiAccuracyMetricsStrip } from "@/components/dashboard/inventory/invoice-ai-accuracy-metrics-strip";
import { InvoiceScannerClient } from "@/components/inventory/invoice-scanner-client";
import { AiHonestyBanner } from "@/components/ui/ai-honesty-label";
import { PHOTO_INVOICE_AI_P2_68_POLICY_ID } from "@/lib/ai/photo-invoice-ai-p2-68-policy";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { isCopilotLlmConfigured } from "@/lib/ai/copilot-llm-routing";
import { listInvoiceScanHistory } from "@/services/ai/invoice-scanner-service";

export const dynamic = "force-dynamic";

/** P2-68 — photo invoice AI: paper receipt → supplier document (Poster POS parity). */
export default async function PhotoInvoicePage() {
  const { dataUserId } = await getTenantActor();
  const [history, aiConfigured] = await Promise.all([
    listInvoiceScanHistory(dataUserId),
    Promise.resolve(isCopilotLlmConfigured()),
  ]);

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-24">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Photo invoice AI</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Poster POS parity — snap a paper receipt, AI extracts line items, and save a PENDING
          supplier invoice document. Policy {PHOTO_INVOICE_AI_P2_68_POLICY_ID}
        </p>
      </div>

      <AiHonestyBanner moduleId="invoice-scanner" compact />

      <InvoiceAiAccuracyMetricsStrip />

      <InvoiceScannerClient history={history} aiConfigured={aiConfigured} />
    </div>
  );
}
