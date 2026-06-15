import { notFound } from "next/navigation";

import { QrOrderingClient } from "@/components/qr/qr-ordering-client";
import { resolveQROrderingContext } from "@/services/qr/qr-ordering-service";

export const dynamic = "force-dynamic";

export default async function QrTableOrderPage({
  params,
}: {
  params: Promise<{ slug: string; tableId: string }>;
}) {
  const { slug, tableId } = await params;
  const context = await resolveQROrderingContext(slug, tableId);
  if (!context || context.products.length === 0) notFound();

  return <QrOrderingClient context={context} />;
}
