import type { Metadata } from "next";

import { AccountingDepthPanel } from "@/components/accounting/accounting-depth-panel";
import {
  ACCOUNTING_DEPTH_P3_149_HEADLINE,
  ACCOUNTING_DEPTH_P3_149_POLICY_ID,
  ACCOUNTING_DEPTH_P3_149_ROUTE,
} from "@/lib/accounting/accounting-depth-p3-149-policy";

export const metadata: Metadata = {
  title: "Accounting depth — R365 parity",
  description:
    "R365 parity accounting depth at /dashboard/accounting/depth — chart of accounts, journal entries, GL sync, reconciliation, and period close.",
};

export default function AccountingDepthPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-6">
      <AccountingDepthPanel />
      <p className="sr-only">
        Policy {ACCOUNTING_DEPTH_P3_149_POLICY_ID} · {ACCOUNTING_DEPTH_P3_149_HEADLINE} ·{" "}
        {ACCOUNTING_DEPTH_P3_149_ROUTE}
      </p>
    </div>
  );
}
