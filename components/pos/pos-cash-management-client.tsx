"use client";

import { useMemo, useState, useTransition } from "react";
import { Banknote, Calculator, ClipboardList, DoorOpen } from "lucide-react";

import { posCloseShiftFormAction, posOpenShiftFormAction } from "@/actions/pos";
import { recordCashCountAction } from "@/actions/pos/cash";
import { PosShiftCloseForm } from "@/components/dashboard/pos-shift-close-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  buildCashCloseReport,
  isPosCashManagementStep,
  POS_CASH_MANAGEMENT_STEPS,
  type CashDrawerCountRecord,
  type PosCashManagementStep,
} from "@/lib/pos/pos-cash-management";
import {
  classifyShiftVariance,
  computeShiftCloseoutLivePreview,
  formatShiftCloseoutMoney,
  formatShiftVarianceDisplay,
  shiftVarianceBadgeClassName,
  shiftVarianceLabel,
} from "@/lib/pos/pos-shift-closeout-preview";
import { posTouchButtonClass } from "@/lib/pos/touch-targets";
import type { ClosedShiftSummary, OpenShiftCloseoutPreview } from "@/services/pos/pos-shift-service";
import { cn } from "@/lib/utils";

type PosCashManagementClientProps = {
  registers: Array<{ id: string; name: string }>;
  staff: Array<{ id: string; name: string }>;
  openShifts: OpenShiftCloseoutPreview[];
  closedShifts: ClosedShiftSummary[];
  recentCounts: CashDrawerCountRecord[];
  canOpen: boolean;
  canClose: boolean;
  initialStep?: string | null;
};

const STEP_META: Record<
  PosCashManagementStep,
  { label: string; icon: typeof DoorOpen; description: string }
> = {
  open: {
    label: "Open",
    icon: DoorOpen,
    description: "Start drawer with opening float.",
  },
  count: {
    label: "Count",
    icon: Calculator,
    description: "Mid-shift blind count without closing.",
  },
  close: {
    label: "Close",
    icon: Banknote,
    description: "Final count, variance ack, close shift.",
  },
  report: {
    label: "Report",
    icon: ClipboardList,
    description: "Printable cash close reports.",
  },
};

export function PosCashManagementClient(props: PosCashManagementClientProps) {
  const defaultStep: PosCashManagementStep = props.openShifts.length
    ? "count"
    : props.canOpen
      ? "open"
      : "report";
  const [step, setStep] = useState<PosCashManagementStep>(
    isPosCashManagementStep(props.initialStep) ? props.initialStep : defaultStep,
  );
  const [countShiftId, setCountShiftId] = useState(props.openShifts[0]?.shiftId ?? "");
  const [countStaffId, setCountStaffId] = useState(props.staff[0]?.id ?? "");
  const [countedCashInput, setCountedCashInput] = useState("");
  const [countNotes, setCountNotes] = useState("");
  const [countStatus, setCountStatus] = useState<string | null>(null);
  const [selectedReportId, setSelectedReportId] = useState(props.closedShifts[0]?.shiftId ?? "");
  const [pending, startTransition] = useTransition();

  const selectedOpenShift =
    props.openShifts.find((shift) => shift.shiftId === countShiftId) ?? props.openShifts[0] ?? null;

  const countPreview = selectedOpenShift
    ? computeShiftCloseoutLivePreview({
        cashSalesTotal: selectedOpenShift.cashSalesTotal,
        expectedCash: selectedOpenShift.expectedCash,
        closingCashInput: countedCashInput,
      })
    : null;

  const selectedReport = useMemo(
    () => props.closedShifts.find((shift) => shift.shiftId === selectedReportId) ?? props.closedShifts[0] ?? null,
    [props.closedShifts, selectedReportId],
  );

  const reportText = selectedReport ? buildCashCloseReport(selectedReport) : "";

  function submitCount() {
    if (!selectedOpenShift || countPreview?.closingCash == null) {
      setCountStatus("Enter a valid counted cash amount.");
      return;
    }
    if (!countStaffId) {
      setCountStatus("Select staff before recording the count.");
      return;
    }

    startTransition(async () => {
      const res = await recordCashCountAction({
        shiftId: selectedOpenShift.shiftId,
        staffMemberId: countStaffId,
        countedCash: countPreview.closingCash!,
        notes: countNotes.trim() || undefined,
      });
      if (!res.ok) {
        setCountStatus(res.error);
        return;
      }
      setCountedCashInput("");
      setCountNotes("");
      setCountStatus(
        `Count recorded — expected ${formatShiftCloseoutMoney(res.expectedCash)}, counted ${formatShiftCloseoutMoney(res.countedCash)}, variance ${formatShiftVarianceDisplay(res.variance)}.`,
      );
    });
  }

  function printReport() {
    if (!reportText) return;
    const popup = window.open("", "_blank", "noopener,noreferrer,width=480,height=640");
    if (!popup) return;
    popup.document.write(`<pre style="font:14px/1.5 monospace;padding:16px;">${reportText}</pre>`);
    popup.document.close();
    popup.focus();
    popup.print();
  }

  return (
    <div className="space-y-6" data-testid="pos-cash-management-root">
      <div className="flex flex-wrap gap-2">
        {POS_CASH_MANAGEMENT_STEPS.map((key) => {
          const meta = STEP_META[key];
          const Icon = meta.icon;
          const disabled =
            (key === "open" && !props.canOpen) ||
            ((key === "count" || key === "close") && !props.canClose) ||
            (key === "count" && props.openShifts.length === 0) ||
            (key === "close" && props.openShifts.length === 0);
          return (
            <button
              key={key}
              type="button"
              disabled={disabled}
              onClick={() => setStep(key)}
              data-testid={`pos-cash-step-${key}`}
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors",
                posTouchButtonClass,
                step === key
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border/70 bg-card text-foreground hover:bg-muted/50",
                disabled && "cursor-not-allowed opacity-50",
              )}
            >
              <Icon className="h-4 w-4" aria-hidden />
              {meta.label}
            </button>
          );
        })}
      </div>

      {step === "open" && props.canOpen ? (
        <Card className="border-border/80 shadow-sm" data-testid="pos-cash-open-panel">
          <CardHeader>
            <CardTitle>Open drawer</CardTitle>
            <CardDescription>{STEP_META.open.description}</CardDescription>
          </CardHeader>
          <CardContent>
            {props.registers.length === 0 ? (
              <p className="text-sm text-muted-foreground">Create a register before opening cash.</p>
            ) : (
              <form action={posOpenShiftFormAction} className="grid max-w-md gap-3">
                <div className="space-y-2">
                  <Label htmlFor="registerId">Register</Label>
                  <select
                    id="registerId"
                    name="registerId"
                    required
                    className="flex h-11 w-full rounded-xl border border-input bg-background px-3 text-sm"
                  >
                    {props.registers.map((register) => (
                      <option key={register.id} value={register.id}>
                        {register.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="staffId">Opened by</Label>
                  <select
                    id="staffId"
                    name="staffId"
                    required
                    className="flex h-11 w-full rounded-xl border border-input bg-background px-3 text-sm"
                  >
                    {props.staff.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="openingCash">Opening float</Label>
                  <Input id="openingCash" name="openingCash" type="number" step="0.01" defaultValue="200" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Input id="notes" name="notes" placeholder="Optional drawer note" />
                </div>
                <Button type="submit" className="rounded-full">
                  Open shift
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      ) : null}

      {step === "count" && props.canClose ? (
        <Card className="border-border/80 shadow-sm" data-testid="pos-cash-count-panel">
          <CardHeader>
            <CardTitle>Mid-shift count</CardTitle>
            <CardDescription>{STEP_META.count.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {props.openShifts.length === 0 ? (
              <p className="text-sm text-muted-foreground">Open a shift before recording a drawer count.</p>
            ) : (
              <>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="countShiftId">Open shift</Label>
                    <select
                      id="countShiftId"
                      value={countShiftId}
                      onChange={(event) => {
                        setCountShiftId(event.target.value);
                        setCountedCashInput("");
                      }}
                      className="flex h-11 w-full rounded-xl border border-input bg-background px-3 text-sm"
                    >
                      {props.openShifts.map((shift) => (
                        <option key={shift.shiftId} value={shift.shiftId}>
                          {shift.registerName} · {shift.openedAtIso.slice(0, 16).replace("T", " ")}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="countStaffId">Counted by</Label>
                    <select
                      id="countStaffId"
                      value={countStaffId}
                      onChange={(event) => setCountStaffId(event.target.value)}
                      className="flex h-11 w-full rounded-xl border border-input bg-background px-3 text-sm"
                    >
                      {props.staff.map((member) => (
                        <option key={member.id} value={member.id}>
                          {member.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {selectedOpenShift ? (
                  <div className="rounded-xl border border-border/80 bg-muted/30 p-4 text-sm">
                    <dl className="grid gap-2 sm:grid-cols-3">
                      <div>
                        <dt className="text-muted-foreground">Opening float</dt>
                        <dd className="font-medium tabular-nums">
                          {formatShiftCloseoutMoney(selectedOpenShift.openingCash)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Cash sales</dt>
                        <dd className="font-medium tabular-nums">
                          {formatShiftCloseoutMoney(selectedOpenShift.cashSalesTotal)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Expected now</dt>
                        <dd className="font-medium tabular-nums">
                          {formatShiftCloseoutMoney(selectedOpenShift.expectedCash)}
                        </dd>
                      </div>
                    </dl>
                  </div>
                ) : null}

                <div className="grid max-w-md gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="countedCash">Counted cash in drawer</Label>
                    <Input
                      id="countedCash"
                      type="number"
                      step="0.01"
                      min="0"
                      value={countedCashInput}
                      onChange={(event) => setCountedCashInput(event.target.value)}
                      data-testid="pos-cash-count-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="countNotes">Notes</Label>
                    <Input
                      id="countNotes"
                      value={countNotes}
                      onChange={(event) => setCountNotes(event.target.value)}
                    />
                  </div>
                </div>

                {countPreview ? (
                  <div className="flex flex-wrap items-center gap-2 text-sm" data-testid="pos-cash-count-preview">
                    <span className="text-muted-foreground">Variance</span>
                    <Badge className={shiftVarianceBadgeClassName(countPreview.tone)}>
                      {shiftVarianceLabel(countPreview.tone)}
                    </Badge>
                    <span className="tabular-nums">{formatShiftVarianceDisplay(countPreview.variance)}</span>
                  </div>
                ) : null}

                {countStatus ? <p className="text-sm text-muted-foreground">{countStatus}</p> : null}

                <Button
                  type="button"
                  className="rounded-full"
                  disabled={pending || !countPreview?.closingCash}
                  onClick={submitCount}
                  data-testid="pos-cash-count-submit"
                >
                  Record count
                </Button>

                {props.recentCounts.length > 0 ? (
                  <div className="space-y-2 border-t border-border/70 pt-4">
                    <p className="text-sm font-medium">Recent counts</p>
                    <ul className="space-y-2 text-sm">
                      {props.recentCounts.map((row) => (
                        <li key={row.id} className="flex flex-wrap items-center justify-between gap-2">
                          <span>
                            {row.registerName} · {row.countedAtIso.slice(0, 16).replace("T", " ")}
                          </span>
                          <span className="tabular-nums text-muted-foreground">
                            {formatShiftVarianceDisplay(row.variance)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </>
            )}
          </CardContent>
        </Card>
      ) : null}

      {step === "close" && props.canClose ? (
        <Card className="border-border/80 shadow-sm" data-testid="pos-cash-close-panel">
          <CardHeader>
            <CardTitle>Close drawer</CardTitle>
            <CardDescription>{STEP_META.close.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <PosShiftCloseForm
              staff={props.staff}
              previews={props.openShifts}
              formAction={posCloseShiftFormAction}
            />
          </CardContent>
        </Card>
      ) : null}

      {step === "report" ? (
        <Card className="border-border/80 shadow-sm" data-testid="pos-cash-report-panel">
          <CardHeader>
            <CardTitle>Cash close report</CardTitle>
            <CardDescription>{STEP_META.report.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {props.closedShifts.length === 0 ? (
              <p className="text-sm text-muted-foreground">Close a shift to generate cash reports.</p>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="reportShiftId">Closed shift</Label>
                  <select
                    id="reportShiftId"
                    value={selectedReportId}
                    onChange={(event) => setSelectedReportId(event.target.value)}
                    className="flex h-11 w-full rounded-xl border border-input bg-background px-3 text-sm"
                    data-testid="pos-cash-report-select"
                  >
                    {props.closedShifts.map((shift) => (
                      <option key={shift.shiftId} value={shift.shiftId}>
                        {shift.registerName} · closed {shift.closedAtIso.slice(0, 10)}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedReport ? (
                  <>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className={shiftVarianceBadgeClassName(classifyShiftVariance(selectedReport.variance))}>
                        {shiftVarianceLabel(classifyShiftVariance(selectedReport.variance))}
                      </Badge>
                      <span className="text-sm tabular-nums text-muted-foreground">
                        Variance {formatShiftVarianceDisplay(selectedReport.variance)}
                      </span>
                    </div>
                    <pre
                      className="max-h-72 overflow-auto rounded-xl border border-border/80 bg-muted/20 p-4 text-xs leading-relaxed"
                      data-testid="pos-cash-report-text"
                    >
                      {reportText}
                    </pre>
                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-full"
                      onClick={printReport}
                      data-testid="pos-cash-report-print"
                    >
                      Print report
                    </Button>
                  </>
                ) : null}
              </>
            )}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
