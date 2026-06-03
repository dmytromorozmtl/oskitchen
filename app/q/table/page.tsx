import Link from "next/link";

import { QrTableSelfServiceClient } from "@/components/qr/qr-table-self-service-client";
import { resolveQROrderingContext } from "@/services/qr/qr-ordering-service";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Table ordering",
  description: "Scan · order · pay · kitchen — full table self-service.",
};

export default async function QrTableSelfServicePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const store = typeof sp.store === "string" ? sp.store.trim() : "";
  const table = typeof sp.table === "string" ? sp.table.trim() : "";

  if (!store || !table) {
    return (
      <div className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-4 text-center">
        <h1 className="text-xl font-semibold">Invalid table link</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Use a valid QR code with <code className="text-xs">store</code> and{" "}
          <code className="text-xs">table</code> parameters.
        </p>
        <p className="mt-4 text-xs text-muted-foreground">
          Example: <code>/q/table?store=my-cafe&amp;table=12</code>
        </p>
      </div>
    );
  }

  const context = await resolveQROrderingContext(store, table);
  if (!context) {
    return (
      <div className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-4 text-center">
        <h1 className="text-xl font-semibold">Menu unavailable</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This table or storefront is not published.
        </p>
        <Link href={`/q/${encodeURIComponent(store)}/${encodeURIComponent(table)}`} className="mt-4 text-sm underline">
          Try classic QR menu
        </Link>
      </div>
    );
  }

  return <QrTableSelfServiceClient context={context} />;
}
