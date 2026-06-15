import { notFound } from "next/navigation";

import { B2bConsolidatedPayPortalClient } from "@/components/pay/b2b-consolidated-pay-portal-client";
import { resolveB2bConsolidatedPayView } from "@/services/integrations/shopify-b2b-consolidated-pay-service";

export const dynamic = "force-dynamic";

export default async function B2bConsolidatedPayPortalPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ paid?: string; canceled?: string }>;
}) {
  const { token } = await params;
  const query = await searchParams;
  const view = await resolveB2bConsolidatedPayView(token);
  if (!view) notFound();

  return (
    <div className="min-h-screen bg-muted/40 px-4 py-16">
      <div className="mx-auto max-w-lg">
        <B2bConsolidatedPayPortalClient
          token={token}
          view={view}
          paidFromRedirect={query.paid === "1"}
          canceled={query.canceled === "1"}
        />
      </div>
    </div>
  );
}
