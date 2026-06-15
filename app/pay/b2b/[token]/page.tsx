import { notFound } from "next/navigation";

import { B2bPayPortalClient } from "@/components/pay/b2b-pay-portal-client";
import { resolveB2bPayPortalView } from "@/services/integrations/shopify-b2b-invoice-pay-portal-service";

export const dynamic = "force-dynamic";

export default async function B2bPayPortalPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ paid?: string; canceled?: string }>;
}) {
  const { token } = await params;
  const query = await searchParams;
  const view = await resolveB2bPayPortalView(token);
  if (!view) notFound();

  return (
    <div className="min-h-screen bg-muted/40 px-4 py-16">
      <div className="mx-auto max-w-lg">
        <B2bPayPortalClient
          token={token}
          view={view}
          paidFromRedirect={query.paid === "1"}
          canceled={query.canceled === "1"}
        />
      </div>
    </div>
  );
}
