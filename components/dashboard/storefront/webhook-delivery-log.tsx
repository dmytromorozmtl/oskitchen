"use client";

import { formatDistanceToNow } from "date-fns";
import { CheckCircle2, RotateCw, XCircle } from "lucide-react";
import { useFormStatus } from "react-dom";

import { redeliverPagePublishWebhookFormAction } from "@/actions/storefront-webhook-delivery";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { WebhookDeliveryLogEntry } from "@/services/storefront/webhook-delivery-log-service";
import { cn } from "@/lib/utils";

function RedeliverButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="ghost" size="sm" className="h-8 rounded-full text-xs" disabled={pending}>
      <RotateCw className={cn("mr-1 h-3 w-3", pending && "animate-spin")} aria-hidden />
      Redeliver
    </Button>
  );
}

export function WebhookDeliveryLog({
  entries,
  canRedeliver,
}: {
  entries: WebhookDeliveryLogEntry[];
  canRedeliver: boolean;
}) {
  if (entries.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No deliveries logged yet. Publish a page with a webhook URL configured to see attempts here.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border/80">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Status</TableHead>
            <TableHead>Delivery ID</TableHead>
            <TableHead>Page</TableHead>
            <TableHead>Host</TableHead>
            <TableHead className="text-right">When</TableHead>
            {canRedeliver ? <TableHead className="w-[100px]" /> : null}
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((row) => {
            const when = formatDistanceToNow(new Date(row.createdAt), { addSuffix: true });
            return (
              <TableRow key={row.id}>
                <TableCell>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 text-xs font-medium",
                      row.status === "delivered" ? "text-emerald-600" : "text-destructive",
                    )}
                  >
                    {row.status === "delivered" ? (
                      <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                    ) : (
                      <XCircle className="h-3.5 w-3.5" aria-hidden />
                    )}
                    {row.status === "delivered" ? "Delivered" : "Failed"}
                  </span>
                </TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">{row.deliveryId}</TableCell>
                <TableCell className="text-sm">
                  <span className="font-medium">{row.pageSlug}</span>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{row.urlHost}</TableCell>
                <TableCell className="text-right text-xs text-muted-foreground" title={row.createdAt}>
                  {when}
                </TableCell>
                {canRedeliver ? (
                  <TableCell>
                    <form action={redeliverPagePublishWebhookFormAction}>
                      <input type="hidden" name="eventId" value={row.id} />
                      <RedeliverButton />
                    </form>
                  </TableCell>
                ) : null}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
