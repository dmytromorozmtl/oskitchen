"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  computeShiftCloseoutLivePreview,
  formatShiftCloseoutMoney,
  shiftCloseoutNeedsVarianceNote,
  shiftVarianceLabel,
  shiftVarianceToneClassName,
} from "@/lib/pos/pos-shift-closeout-preview";
import type { OpenShiftCloseoutPreview } from "@/services/pos/pos-shift-service";

type StaffOption = { id: string; name: string };

type PosShiftCloseFormProps = {
  staff: StaffOption[];
  previews: OpenShiftCloseoutPreview[];
  formAction: (formData: FormData) => void | Promise<void>;
};

export function PosShiftCloseForm({ staff, previews, formAction }: PosShiftCloseFormProps) {
  const [shiftId, setShiftId] = React.useState(previews[0]?.shiftId ?? "");
  const [closingCashInput, setClosingCashInput] = React.useState("");

  const selected = previews.find((preview) => preview.shiftId === shiftId) ?? previews[0] ?? null;

  React.useEffect(() => {
    if (previews.length === 0) {
      setShiftId("");
      return;
    }
    if (!previews.some((preview) => preview.shiftId === shiftId)) {
      setShiftId(previews[0]!.shiftId);
    }
  }, [previews, shiftId]);

  const livePreview = selected
    ? computeShiftCloseoutLivePreview({
        cashSalesTotal: selected.cashSalesTotal,
        expectedCash: selected.expectedCash,
        closingCashInput,
      })
    : null;

  const needsNote = livePreview ? shiftCloseoutNeedsVarianceNote(livePreview) : false;

  return (
    <form action={formAction} className="space-y-4" data-testid="pos-shift-close-form">
      <div className="space-y-2">
        <Label htmlFor="shiftId">Open shift</Label>
        {previews.length === 0 ? (
          <p className="text-sm text-muted-foreground">No open shifts.</p>
        ) : (
          <select
            id="shiftId"
            name="shiftId"
            required
            value={shiftId}
            onChange={(event) => {
              setShiftId(event.target.value);
              setClosingCashInput("");
            }}
            className="flex h-11 w-full rounded-xl border border-input bg-background px-3 text-sm shadow-sm"
            data-testid="pos-shift-close-select"
          >
            {previews.map((preview) => (
              <option key={preview.shiftId} value={preview.shiftId}>
                {preview.registerName} · {preview.openedAtIso.slice(0, 16).replace("T", " ")}
              </option>
            ))}
          </select>
        )}
      </div>

      {selected ? (
        <div
          className="rounded-xl border border-border/80 bg-muted/30 p-4 text-sm"
          data-testid="pos-shift-closeout-preview"
        >
          <p className="font-medium text-foreground">Closeout preview</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Cash sales only — card and terminal sales are excluded from expected drawer cash.
          </p>
          <dl className="mt-3 grid gap-2 sm:grid-cols-2">
            <div className="flex justify-between gap-2 sm:block">
              <dt className="text-muted-foreground">Opening float</dt>
              <dd className="font-medium tabular-nums">{formatShiftCloseoutMoney(selected.openingCash)}</dd>
            </div>
            <div className="flex justify-between gap-2 sm:block">
              <dt className="text-muted-foreground">
                Cash sales ({selected.cashTransactionCount})
              </dt>
              <dd className="font-medium tabular-nums">
                {formatShiftCloseoutMoney(selected.cashSalesTotal)}
              </dd>
            </div>
            <div className="flex justify-between gap-2 sm:block sm:col-span-2">
              <dt className="text-muted-foreground">Expected in drawer</dt>
              <dd className="font-semibold tabular-nums">
                {formatShiftCloseoutMoney(selected.expectedCash)}
              </dd>
            </div>
          </dl>
          {livePreview ? (
            <div
              className="mt-3 flex flex-wrap items-baseline justify-between gap-2 border-t border-border/60 pt-3"
              data-testid="pos-shift-variance-row"
            >
              <span className="text-muted-foreground">Variance</span>
              <span
                className={`text-base font-semibold tabular-nums ${shiftVarianceToneClassName(livePreview.tone)}`}
              >
                {livePreview.variance === null
                  ? shiftVarianceLabel(livePreview.tone)
                  : `${livePreview.variance >= 0 ? "+" : ""}${formatShiftCloseoutMoney(livePreview.variance)} · ${shiftVarianceLabel(livePreview.tone)}`}
              </span>
            </div>
          ) : null}
          {needsNote ? (
            <p className="mt-2 text-xs text-amber-700 dark:text-amber-500">
              Non-zero variance — add a note below before closing (manager review).
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="staffIdClose">Closed by</Label>
        <select
          id="staffIdClose"
          name="staffId"
          required
          className="flex h-11 w-full rounded-xl border border-input bg-background px-3 text-sm shadow-sm"
        >
          {staff.map((member) => (
            <option key={member.id} value={member.id}>
              {member.name}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="closingCash">Closing cash counted</Label>
        <Input
          id="closingCash"
          name="closingCash"
          type="number"
          step="0.01"
          min="0"
          required
          className="rounded-xl tabular-nums"
          value={closingCashInput}
          onChange={(event) => setClosingCashInput(event.target.value)}
          placeholder={selected ? formatShiftCloseoutMoney(selected.expectedCash) : "0.00"}
          data-testid="pos-shift-closing-cash-input"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="notesClose">Notes</Label>
        <Input
          id="notesClose"
          name="notes"
          className="rounded-xl"
          placeholder={needsNote ? "Explain variance for audit trail" : "Optional"}
        />
      </div>
      <Button
        type="submit"
        variant="secondary"
        className="rounded-full"
        disabled={previews.length === 0}
      >
        Close shift
      </Button>
    </form>
  );
}
