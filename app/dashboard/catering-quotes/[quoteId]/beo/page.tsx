import Link from "next/link";
import { notFound } from "next/navigation";

import { CateringBeoDocumentView } from "@/components/catering/catering-beo-document";
import { Button } from "@/components/ui/button";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { buildCateringBeoForQuote } from "@/services/catering/catering-beo-service";

export default async function CateringQuoteBeoPage({
  params,
}: {
  params: Promise<{ quoteId: string }>;
}) {
  const { quoteId } = await params;
  const { dataUserId } = await getTenantActor();
  const beo = await buildCateringBeoForQuote({ userId: dataUserId }, quoteId);
  if (!beo) notFound();

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2 print:hidden">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/dashboard/catering-quotes/${quoteId}`}>← Back to quote</Link>
        </Button>
        <p className="text-xs text-muted-foreground">
          Print this page for kitchen and service staff — Banquet Event Order (BEO)
        </p>
      </div>
      <CateringBeoDocumentView beo={beo} />
    </div>
  );
}
