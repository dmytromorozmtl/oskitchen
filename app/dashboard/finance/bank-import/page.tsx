import { BankImportClient } from "@/components/finance/bank-import-client";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { isCopilotLlmConfigured } from "@/lib/ai/copilot-llm-routing";
import { listRecentBankImports } from "@/services/finance/bank-statement-import-service";

export const dynamic = "force-dynamic";

export default async function BankImportPage() {
  const { dataUserId } = await getTenantActor();
  const [recentImports, aiConfigured] = await Promise.all([
    listRecentBankImports(dataUserId),
    Promise.resolve(isCopilotLlmConfigured()),
  ]);

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-24">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Bank Statement Import</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Upload CSV, PDF, or a photo of your bank statement. OS Kitchen categorizes each line and auto-matches deposits to orders and payments to supplier invoices.
        </p>
        <p className="mt-2 text-xs text-muted-foreground" role="status">
          AI-assisted categorization and matching — confidence scores are estimates, not guarantees.
          Please verify each transaction before committing imports; parsed data may be incorrect.
        </p>
      </div>

      <BankImportClient recentImports={recentImports} aiConfigured={aiConfigured} />
    </div>
  );
}
