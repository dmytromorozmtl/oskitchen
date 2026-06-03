"use client";

import { useState } from "react";

type ExportType = "pnl" | "pnl-csv" | "invoices" | "sales";

export function AccountingExportPanel({
  provider,
  pnlFormat,
}: {
  provider: "quickbooks" | "xero";
  pnlFormat: "iif" | "csv";
}) {
  const [period, setPeriod] = useState<"month" | "quarter">("month");
  const [type, setType] = useState<ExportType>("pnl");

  const base = provider === "quickbooks" ? "/api/export/quickbooks" : "/api/export/xero";
  const pnlType = pnlFormat === "csv" ? "pnl-csv" : "pnl";
  const resolvedType = type === "pnl" ? pnlType : type;
  const href =
    type === "sales" && provider === "quickbooks"
      ? `${base}?type=sales&period=${period}&format=iif`
      : `${base}?type=${resolvedType}&period=${period}`;

  return (
    <div className="space-y-3 text-sm">
      <div className="flex flex-wrap gap-2">
        <label className="flex items-center gap-2">
          <span className="text-muted-foreground">Period</span>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as "month" | "quarter")}
            className="h-9 rounded-lg border px-2"
          >
            <option value="month">This month</option>
            <option value="quarter">This quarter</option>
          </select>
        </label>
        <label className="flex items-center gap-2">
          <span className="text-muted-foreground">Export</span>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as ExportType)}
            className="h-9 rounded-lg border px-2"
          >
            <option value="pnl">P&L ({pnlFormat.toUpperCase()})</option>
            <option value="invoices">Invoices (CSV)</option>
            {provider === "quickbooks" ? (
              <option value="sales">Sales journal (IIF)</option>
            ) : null}
          </select>
        </label>
      </div>
      <a href={href} className="inline-flex rounded-xl border px-3 py-1.5 text-sm hover:bg-muted">
        Download{" "}
        {type === "pnl" ? "P&L" : type === "sales" ? "sales journal" : "invoices"} — {period}
      </a>
    </div>
  );
}
