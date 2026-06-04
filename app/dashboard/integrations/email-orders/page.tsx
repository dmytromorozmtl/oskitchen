import Link from "next/link";

import { EmailOrdersIntakePanel } from "@/components/integrations/email-orders-intake-panel";
import { BetaBadge } from "@/components/integrations/beta-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { isEmailOrdersAssistConfigured } from "@/services/integrations/email-orders-intake-service";

export const dynamic = "force-dynamic";

export default async function EmailOrdersIntegrationPage() {
  const aiAssistAvailable = isEmailOrdersAssistConfigured();

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-2xl font-semibold">Email orders</h1>
        <BetaBadge />
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pasted email intake</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p className="text-muted-foreground">
            Manual intake channel — always available without credentials. Duplicate emails are skipped
            via content hash.
          </p>
          <EmailOrdersIntakePanel aiAssistAvailable={aiAssistAvailable} />
          <Link href="/dashboard/orders" className="text-xs text-primary underline">
            Order hub →
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
