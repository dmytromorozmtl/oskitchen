"use client";

import { getActionError } from "@/lib/action-result";

import type { OrderStatus } from "@prisma/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { updateOrderKitchenNotes, updateOrderStatus } from "@/actions/orders";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

function transitionButtonLabel(target: OrderStatus): string {
  switch (target) {
    case "PENDING":
      return "Back to pending";
    case "CONFIRMED":
      return "Confirm order";
    case "PREPARING":
      return "Send to production";
    case "READY":
      return "Mark ready";
    case "COMPLETED":
      return "Complete order";
    case "CANCELLED":
      return "Cancel order";
  }
}

function needsDestructiveConfirm(target: OrderStatus): boolean {
  return target === "COMPLETED" || target === "CANCELLED";
}

export function OrderStatusActions({
  orderId,
  allowedStatuses,
}: {
  orderId: string;
  allowedStatuses: OrderStatus[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [fixHref, setFixHref] = useState<string | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<OrderStatus | null>(null);

  function applyStatus(target: OrderStatus) {
    setError(null);
    setFixHref(null);
    startTransition(async () => {
      const res = await updateOrderStatus(orderId, target);
      if ("error" in res && res.error) {
        setError(getActionError(res) ?? "Something went wrong");
        setFixHref("fixHref" in res && typeof res.fixHref === "string" ? res.fixHref : null);
        setConfirmTarget(null);
        return;
      }
      setConfirmTarget(null);
      router.refresh();
    });
  }

  return (
    <div className="space-y-3">
      {error ? (
        <div className="rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          <p>{error}</p>
          {fixHref ? (
            <Link href={fixHref} className="mt-1 inline-block font-medium underline">
              Open fix
            </Link>
          ) : null}
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {allowedStatuses.map((s) =>
          needsDestructiveConfirm(s) ? (
            <Button
              key={s}
              type="button"
              variant={s === "CANCELLED" ? "destructive" : "default"}
              size="sm"
              className="rounded-full"
              disabled={pending}
              onClick={() => setConfirmTarget(s)}
            >
              {transitionButtonLabel(s)}
            </Button>
          ) : (
            <Button
              key={s}
              type="button"
              variant="secondary"
              size="sm"
              className="rounded-full"
              disabled={pending}
              onClick={() => applyStatus(s)}
            >
              {transitionButtonLabel(s)}
            </Button>
          ),
        )}
      </div>

      <AlertDialog open={confirmTarget !== null} onOpenChange={(o) => !o && setConfirmTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmTarget === "CANCELLED" ? "Cancel this order?" : "Mark order complete?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmTarget === "CANCELLED"
                ? "The customer will see this order as cancelled. You can still view history on this page."
                : "Completing finalizes fulfillment in the pipeline. Ensure production, packing, and payment rules are satisfied."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Back</AlertDialogCancel>
            <Button
              type="button"
              disabled={pending}
              variant={confirmTarget === "CANCELLED" ? "destructive" : "default"}
              onClick={() => {
                if (confirmTarget) applyStatus(confirmTarget);
              }}
            >
              Confirm
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export function OrderKitchenNotesEditor({
  orderId,
  initialNotes,
}: {
  orderId: string;
  initialNotes: string | null;
}) {
  const router = useRouter();
  const [value, setValue] = useState(initialNotes ?? "");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  return (
    <div className="space-y-2">
      <Textarea
        value={value}
        onChange={(e) => {
          setSaved(false);
          setValue(e.target.value);
        }}
        rows={4}
        placeholder="Station notes, substitutions, VIP handling — not shown to the customer."
        className="resize-y"
      />
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {saved ? <p className="text-xs text-muted-foreground">Saved.</p> : null}
      <Button
        type="button"
        size="sm"
        className="rounded-full"
        disabled={pending}
        onClick={() => {
          setError(null);
          setSaved(false);
          startTransition(async () => {
            const res = await updateOrderKitchenNotes(orderId, value);
            if ("error" in res && res.error) {
              setError(getActionError(res) ?? "Something went wrong");
              return;
            }
            setSaved(true);
            router.refresh();
          });
        }}
      >
        Save internal notes
      </Button>
    </div>
  );
}
