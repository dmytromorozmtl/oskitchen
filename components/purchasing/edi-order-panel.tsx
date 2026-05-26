"use client";

import { useState } from "react";
import { toast } from "sonner";

type PoRow = {
  id: string;
  orderNumber: string;
  supplierName: string;
  status: string;
};

export function EdiOrderPanel({
  purchaseOrders,
}: {
  purchaseOrders: PoRow[];
}) {
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [statusByPo, setStatusByPo] = useState<Record<string, string>>({});

  async function submitEdi(poId: string, distributor: "SYSCO" | "US_FOODS") {
    setPendingId(poId);
    const res = await fetch("/api/purchasing/edi/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ purchaseOrderId: poId, distributor }),
    });
    const json = (await res.json()) as { message?: string; error?: string; status?: string };
    setPendingId(null);

    if (!res.ok || json.error) {
      toast.error(json.error ?? "EDI submit failed");
      return;
    }

    setStatusByPo((s) => ({ ...s, [poId]: json.status ?? "SUBMITTED" }));
    toast.success(json.message ?? "EDI 850 queued");
  }

  if (purchaseOrders.length === 0) {
    return <p className="text-sm text-muted-foreground">No purchase orders ready for EDI.</p>;
  }

  return (
    <ul className="text-sm space-y-3">
      {purchaseOrders.map((po) => (
        <li key={po.id} className="border-b py-2">
          <p className="font-medium">
            {po.orderNumber} — {po.supplierName}
          </p>
          <p className="text-xs text-muted-foreground">
            Status: {statusByPo[po.id] ?? po.status}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={pendingId === po.id}
              onClick={() => void submitEdi(po.id, "SYSCO")}
              className="rounded-lg border px-2 py-1 text-xs disabled:opacity-50"
            >
              {pendingId === po.id ? "Sending…" : "Send via Sysco"}
            </button>
            <button
              type="button"
              disabled={pendingId === po.id}
              onClick={() => void submitEdi(po.id, "US_FOODS")}
              className="rounded-lg border px-2 py-1 text-xs disabled:opacity-50"
            >
              Send via US Foods
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
