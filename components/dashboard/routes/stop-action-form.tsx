"use client";

import { useTransition } from "react";

import {
  reorderStopAction,
  updateStopStatusAction,
} from "@/actions/delivery-route";
import { Button } from "@/components/ui/button";
import { STOP_STATUSES, STOP_STATUS_LABEL } from "@/lib/routes/route-status";
import type { DeliveryStopStatus } from "@prisma/client";

export function StopStatusForm({
  routeId,
  stopId,
  currentStatus,
}: {
  routeId: string;
  stopId: string;
  currentStatus: DeliveryStopStatus;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="flex flex-wrap items-center gap-2"
      action={(formData) => {
        startTransition(async () => {
          await updateStopStatusAction(formData);
        });
      }}
    >
      <input type="hidden" name="routeId" value={routeId} />
      <input type="hidden" name="stopId" value={stopId} />
      <select
        name="to"
        defaultValue={currentStatus}
        className="h-9 rounded-md border border-input bg-background px-2 text-sm"
      >
        {STOP_STATUSES.map((s) => (
          <option key={s} value={s}>
            {STOP_STATUS_LABEL[s]}
          </option>
        ))}
      </select>
      <select
        name="failedReason"
        defaultValue=""
        className="h-9 rounded-md border border-input bg-background px-2 text-sm"
      >
        <option value="">Failed reason (if FAILED)</option>
        <option value="CUSTOMER_UNAVAILABLE">Customer unavailable</option>
        <option value="WRONG_ADDRESS">Wrong address</option>
        <option value="DRIVER_ISSUE">Driver issue</option>
        <option value="ORDER_NOT_PACKED">Order not packed</option>
        <option value="WEATHER_TRAFFIC">Weather / traffic</option>
        <option value="PAYMENT_ISSUE">Payment issue</option>
        <option value="OTHER">Other</option>
      </select>
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Saving…" : "Update"}
      </Button>
    </form>
  );
}

export function ReorderStopForm({
  routeId,
  stopId,
  currentIndex,
  total,
}: {
  routeId: string;
  stopId: string;
  currentIndex: number;
  total: number;
}) {
  const [pending, startTransition] = useTransition();

  function submitTo(toIndex: number) {
    const fd = new FormData();
    fd.set("routeId", routeId);
    fd.set("stopId", stopId);
    fd.set("toIndex", String(Math.max(0, Math.min(toIndex, total - 1))));
    startTransition(async () => {
      await reorderStopAction(fd);
    });
  }

  return (
    <div className="flex items-center gap-1">
      <Button
        type="button"
        size="icon"
        variant="ghost"
        disabled={pending || currentIndex === 0}
        onClick={() => submitTo(currentIndex - 1)}
        aria-label="Move stop up"
      >
        ↑
      </Button>
      <Button
        type="button"
        size="icon"
        variant="ghost"
        disabled={pending || currentIndex >= total - 1}
        onClick={() => submitTo(currentIndex + 1)}
        aria-label="Move stop down"
      >
        ↓
      </Button>
    </div>
  );
}
