"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Download, FileJson, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import type { RevenueAttestationListRow } from "@/services/commercial/revenue-attestation-service";
import { formatCurrency } from "@/lib/utils";

type CapitalRevenueAttestationPanelProps = {
  recentAttestations: RevenueAttestationListRow[];
  hasOrderData: boolean;
};

export function CapitalRevenueAttestationPanel({
  recentAttestations,
  hasOrderData,
}: CapitalRevenueAttestationPanelProps) {
  const router = useRouter();
  const [months, setMonths] = useState<3 | 6 | 12>(12);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <Card id="revenue-attestation" className="scroll-mt-24 border-border/80">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <ShieldCheck className="h-4 w-4" />
          Verified revenue export (Phase 2 BETA)
        </CardTitle>
        <CardDescription>
          Download a signed JSON summary of KitchenOS gross order revenue for lender conversations. Not a
          credit decision or bank deposit attestation.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-xs text-muted-foreground">
          Signatures use HMAC-SHA256. Lenders can POST the downloaded JSON to{" "}
          <code className="rounded bg-muted px-1">/api/capital/revenue-attestation/verify</code>. Exports
          expire after 30 days.
        </p>

        {!hasOrderData ? (
          <p className="rounded-lg border border-dashed border-border/80 px-3 py-2 text-sm text-muted-foreground">
            Generate exports after you have revenue-eligible orders in the selected window.
          </p>
        ) : (
          <div className="flex flex-wrap items-end gap-3">
            <div className="space-y-2">
              <Label htmlFor="attestationMonths">Period</Label>
              <select
                id="attestationMonths"
                className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={months}
                onChange={(e) => setMonths(Number(e.target.value) as 3 | 6 | 12)}
              >
                <option value={3}>Trailing 3 months</option>
                <option value={6}>Trailing 6 months</option>
                <option value={12}>Trailing 12 months</option>
              </select>
            </div>
            <Button
              type="button"
              className="rounded-full"
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  setMessage(null);
                  setError(null);
                  const res = await fetch("/api/capital/revenue-attestation/generate", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ months }),
                  });
                  const json = (await res.json()) as {
                    ok?: boolean;
                    error?: string;
                    downloadUrl?: string;
                  };
                  if (!res.ok || !json.downloadUrl) {
                    setError(json.error ?? "Could not generate attestation.");
                    return;
                  }
                  setMessage("Attestation generated — download started.");
                  window.location.href = json.downloadUrl;
                  router.refresh();
                })
              }
            >
              {pending ? "Generating…" : "Generate signed export"}
            </Button>
          </div>
        )}

        {message ? <p className="text-sm text-primary">{message}</p> : null}
        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        {recentAttestations.length > 0 ? (
          <div className="space-y-2 rounded-lg border border-border/70 p-3 text-sm">
            <p className="font-medium">Recent exports</p>
            {recentAttestations.map((row) => (
              <div key={row.id} className="flex flex-wrap items-center justify-between gap-2 text-muted-foreground">
                <span>
                  {row.periodStart} → {row.periodEnd} ·{" "}
                  {formatCurrency(row.grossOrderRevenue, row.currency)} · {row.orderCount} orders
                </span>
                <div className="flex items-center gap-2">
                  {row.expired ? <Badge variant="outline">Expired</Badge> : null}
                  <Button asChild size="sm" variant="outline" className="rounded-full">
                    <Link href={`/api/capital/revenue-attestation/${row.id}/download`}>
                      <Download className="h-3.5 w-3.5" />
                      <span className="ml-1">JSON</span>
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <FileJson className="h-4 w-4" />
            No signed exports yet.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
