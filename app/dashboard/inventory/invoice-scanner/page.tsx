import { InvoiceScannerClient } from "@/components/inventory/invoice-scanner-client";
import { AiHonestyBanner } from "@/components/ui/ai-honesty-label";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { isCopilotLlmConfigured } from "@/lib/ai/copilot-llm-routing";
import {
  listInvoiceScanHistory,
} from "@/services/ai/invoice-scanner-service";

export const dynamic = "force-dynamic";

export default async function InvoiceScannerPage() {
  const { dataUserId } = await getTenantActor();
  const [history, aiConfigured] = await Promise.all([
    listInvoiceScanHistory(dataUserId),
    Promise.resolve(isCopilotLlmConfigured()),
  ]);

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-24">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Invoice Scanner</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Photograph a supplier invoice to create a supply receipt and update inventory stock.
        </p>
      </div>

      <AiHonestyBanner moduleId="invoice-scanner" compact />

      <InvoiceScannerClient history={history} aiConfigured={aiConfigured} />
    </div>
  );
}
