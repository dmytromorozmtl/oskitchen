"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

import { saveChannelHandoffSettings } from "@/actions/channel-command-center";
import type { ChannelHandoffSettings } from "@/lib/channels/channel-handoff";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export function ChannelHandoffForm({ initial }: { initial: ChannelHandoffSettings }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  return (
    <form
      className="space-y-4 rounded-xl border border-border/70 bg-card/80 p-4"
      action={(fd) =>
        start(async () => {
          await saveChannelHandoffSettings({
            autoSendValidOrdersToOrderHub: fd.get("autoSendValidOrdersToOrderHub") === "on",
            autoSendToProduction: fd.get("autoSendToProduction") === "on",
            requireManualReview: {
              unmatchedProduct: fd.get("rr_unmatched") === "on",
              missingFulfillment: fd.get("rr_fulfillment") === "on",
              cateringOrEvent: fd.get("rr_catering") === "on",
              addressInvalid: fd.get("rr_address") === "on",
              paymentUnpaid: fd.get("rr_payment") === "on",
              highValueOrderMinTotal: Number(fd.get("rr_high_value") || 300),
            },
          });
          router.refresh();
        })
      }
    >
      <div className="flex items-center gap-2">
        <input
          id="autoSendValidOrdersToOrderHub"
          name="autoSendValidOrdersToOrderHub"
          type="checkbox"
          defaultChecked={initial.autoSendValidOrdersToOrderHub ?? true}
          className="h-4 w-4 rounded border border-input"
        />
        <Label htmlFor="autoSendValidOrdersToOrderHub" className="font-normal">
          Auto-send valid external rows to Order Hub (external table)
        </Label>
      </div>
      <div className="flex items-center gap-2">
        <input
          id="autoSendToProduction"
          name="autoSendToProduction"
          type="checkbox"
          defaultChecked={initial.autoSendToProduction ?? false}
          className="h-4 w-4 rounded border border-input"
        />
        <Label htmlFor="autoSendToProduction" className="font-normal">
          Auto-send to production (off by default — requires mapped products)
        </Label>
      </div>
      <p className="text-xs font-medium text-muted-foreground">Require manual review when…</p>
      <div className="grid gap-2 sm:grid-cols-2">
        {(
          [
            { name: "rr_unmatched", label: "Unmatched product", def: initial.requireManualReview?.unmatchedProduct },
            { name: "rr_fulfillment", label: "Missing fulfillment", def: initial.requireManualReview?.missingFulfillment },
            { name: "rr_catering", label: "Catering / event", def: initial.requireManualReview?.cateringOrEvent },
            { name: "rr_address", label: "Invalid address", def: initial.requireManualReview?.addressInvalid },
            { name: "rr_payment", label: "Unpaid", def: initial.requireManualReview?.paymentUnpaid },
          ] as const
        ).map((row) => (
          <div key={row.name} className="flex items-center gap-2">
            <input
              id={row.name}
              name={row.name}
              type="checkbox"
              defaultChecked={row.def ?? true}
              className="h-4 w-4 rounded border border-input"
            />
            <Label htmlFor={row.name} className="font-normal text-sm">
              {row.label}
            </Label>
          </div>
        ))}
      </div>
      <div className="space-y-1">
        <Label htmlFor="rr_high_value">High-value review threshold (same currency as orders)</Label>
        <input
          id="rr_high_value"
          name="rr_high_value"
          type="number"
          min={0}
          step={1}
          defaultValue={initial.requireManualReview?.highValueOrderMinTotal ?? 300}
          className="w-full max-w-xs rounded-lg border border-input bg-background px-3 py-2 text-sm"
        />
      </div>
      <Button type="submit" size="sm" className="rounded-full" disabled={pending}>
        Save handoff rules
      </Button>
    </form>
  );
}
