import type { Metadata } from "next";

import { PayrollExportForm } from "@/components/labor/payroll-export-form";

export const metadata: Metadata = { title: "Payroll Export" };

export default function PayrollPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Payroll Export</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Generate payroll summary for a date range from time clock entries. Download as CSV.
        </p>
      </div>
      <PayrollExportForm />
    </div>
  );
}
