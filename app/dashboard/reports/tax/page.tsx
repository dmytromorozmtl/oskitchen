import Link from "next/link";

import { PageShell } from "@/components/layout/page-shell";
import { isTaxJarConfigured } from "@/services/accounting/tax-service";

export default function TaxReportsPage() {
  return (
    <PageShell narrow>
      <h1 className="text-2xl font-semibold tracking-tight">Tax reports</h1>
      <p className="mt-2 text-sm text-muted-foreground">TaxJar jurisdiction reports and checkout tax calculation.</p>
      <p className="mt-4 text-sm">
        TaxJar:{" "}
        <span className={isTaxJarConfigured() ? "font-medium text-green-600" : "font-medium text-amber-600"}>
          {isTaxJarConfigured() ? "Configured" : "Set TAXJAR_API_KEY"}
        </span>
      </p>
      <p className="mt-6 text-sm">
        <Link href="/dashboard/reports" className="text-primary underline-offset-4 hover:underline">
          ← Reports
        </Link>
      </p>
    </PageShell>
  );
}
