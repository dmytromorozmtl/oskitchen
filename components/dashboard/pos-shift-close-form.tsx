"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  canSubmitShiftCloseWithPreview,
  computeShiftCloseoutLivePreview,
  formatShiftCloseoutMoney,
  shiftCloseoutNeedsVarianceNote,
  shiftVarianceLabel,
  shiftVarianceToneClassName,
} from "@/lib/pos/pos-shift-closeout-preview";
import { resolveShiftVarianceGuidance } from "@/lib/pos/pos-shift-close-focus-era18";
import { posShiftCloseVarianceToneLabel } from "@/lib/pos/pos-shift-close-clarity-era19";
import { PosShiftCloseChecklist } from "@/components/dashboard/pos-shift-close-checklist";
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
  const [notes, setNotes] = React.useState("");
  const [varianceAcknowledged, setVarianceAcknowledged] = React.useState(false);

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

  React.useEffect(() => {
    setVarianceAcknowledged(false);
    setNotes("");
  }, [shiftId, closingCashInput]);

  const livePreview = selected
    ? computeShiftCloseoutLivePreview({
        cashSalesTotal: selected.cashSalesTotal,
        expectedCash: selected.expectedCash,
        closingCashInput,
      })
    : null;

  const needsNote = livePreview ? shiftCloseoutNeedsVarianceNote(livePreview) : false;
  const varianceGuidance = livePreview ? resolveShiftVarianceGuidance(livePreview.tone) : null;
  const canSubmit = canSubmitShiftCloseWithPreview({
    preview: livePreview,
    varianceAcknowledged,
    notes,
  });

  return (
    <form action={formAction} className="space-y-4" data-testid="pos-shift-close-form">
      <PosShiftCloseChecklist
        hasOpenShift={previews.length > 0}
        preview={livePreview}
        varianceAcknowledged={varianceAcknowledged}
        notes={notes}
      />

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
          {livePreview && posShiftCloseVarianceToneLabel(livePreview.tone) ? (
            <p
              className="mt-2 text-xs font-medium text-muted-foreground"
              data-testid="pos-shift-variance-tone-label"
            >
              {posShiftCloseVarianceToneLabel(livePreview.tone)}
            </p>
          ) : null}
          {needsNote ? (
            <p className="mt-2 text-xs text-amber-700 dark:text-amber-500">
              Non-zero variance — acknowledge and explain before closing.
            </p>
          ) : null}
          {varianceGuidance ? (
            <p
              className={`mt-2 text-xs ${
                livePreview?.tone === "balanced"
                  ? "text-green-700 dark:text-green-500"
                  : "text-muted-foreground"
              }`}
              data-testid="pos-shift-variance-guidance"
            >
              {varianceGuidance}
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
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Label htmlFor="closingCash">Closing cash counted</Label>
          {selected ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 rounded-full text-xs"
              onClick={() => setClosingCashInput(selected.expectedCash.toFixed(2))}
              data-testid="pos-shift-use-expected-cash"
            >
              Use expected ({formatShiftCloseoutMoney(selected.expectedCash)})
            </Button>
          ) : null}
        </div>
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
        <Label htmlFor="notesClose">
          Notes{needsNote ? " (required for variance)" : ""}
        </Label>
        <Input
          id="notesClose"
          name="notes"
          className="rounded-xl"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          required={needsNote}
          placeholder={needsNote ? "Explain variance for audit trail" : "Optional"}
          data-testid="pos-shift-close-notes"
        />
      </div>

      {needsNote ? (
        <div
          className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50/80 p-3 dark:border-amber-900 dark:bg-amber-950/30"
          data-testid="pos-shift-variance-ack"
        >
          <Checkbox
            id="varianceAcknowledged"
            checked={varianceAcknowledged}
            onCheckedChange={(checked) => setVarianceAcknowledged(checked === true)}
            data-testid="pos-shift-variance-ack-checkbox"
          />
          <div className="space-y-1">
            <Label htmlFor="varianceAcknowledged" className="text-sm font-medium leading-snug">
              I acknowledge this cash variance and have counted the drawer.
            </Label>
            <p className="text-xs text-muted-foreground">
              Manager review only — not an automated approval.
            </p>
            {varianceAcknowledged ? (
              <input type="hidden" name="varianceAcknowledged" value="1" />
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="sticky bottom-3 z-10 -mx-1 rounded-2xl border border-border/80 bg-background/95 p-3 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none">
        <Button
          type="submit"
          variant="secondary"
          className="w-full rounded-full sm:w-auto"
          disabled={previews.length === 0 || !canSubmit}
          data-testid="pos-shift-close-submit"
        >
          Close shift
        </Button>
      </div>
    </form>
  );
}
