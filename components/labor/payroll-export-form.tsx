"use client";

import { useState } from "react";

export function PayrollExportForm() {
  const [start, setStart] = useState(
    new Date(Date.now() - 14 * 86_400_000).toISOString().slice(0, 10),
  );
  const [end, setEnd] = useState(new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(false);

  function handleExport() {
    setLoading(true);
    window.location.href = `/api/export/payroll?start=${start}&end=${end}`;
    setTimeout(() => setLoading(false), 1000);
  }

  return (
    <div className="rounded-xl border bg-card p-6 space-y-4 max-w-md">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Start Date</label>
          <input
            type="date"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            className="mt-1 w-full h-10 rounded-xl border px-3 text-sm bg-background"
          />
        </div>
        <div>
          <label className="text-sm font-medium">End Date</label>
          <input
            type="date"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            className="mt-1 w-full h-10 rounded-xl border px-3 text-sm bg-background"
          />
        </div>
      </div>
      <button
        type="button"
        onClick={handleExport}
        disabled={loading}
        className="w-full rounded-xl bg-primary text-primary-foreground px-4 py-2.5 text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
      >
        {loading ? "Downloading..." : "Download Payroll CSV"}
      </button>
    </div>
  );
}
