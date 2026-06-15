"use client";

import { useMemo, useState, useTransition } from "react";
import { Percent, Split, Users, UtensilsCrossed } from "lucide-react";
import { toast } from "sonner";

import {
  assignTabItemParticipantAction,
  clearTabSplitAssignmentsAction,
} from "@/actions/pos/bill-split";
import { getActionError } from "@/lib/action-result";
import {
  BILL_SPLIT_MODE_LABEL,
  BILL_SPLIT_MODES,
  billSplitTotals,
  computeBillSplit,
  defaultParticipants,
  seatParticipants,
  type BillSplitLineItem,
  type BillSplitMode,
  type BillSplitParticipant,
  unassignedItemCount,
} from "@/lib/pos/bill-splitting";
import { posTouchButtonClass } from "@/lib/pos/touch-targets";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type BillSplitPanelProps = {
  tabId: string;
  tabName: string;
  items: BillSplitLineItem[];
  tipTotal: number;
  taxRate?: number;
  onItemsChange?: (items: BillSplitLineItem[]) => void;
};

const MODE_ICONS: Record<BillSplitMode, typeof Split> = {
  equal: Split,
  percentage: Percent,
  seat: Users,
  item: UtensilsCrossed,
};

export function BillSplitPanel({
  tabId,
  tabName,
  items,
  tipTotal,
  taxRate = 0.08,
  onItemsChange,
}: BillSplitPanelProps) {
  const [mode, setMode] = useState<BillSplitMode>("equal");
  const [guestCount, setGuestCount] = useState(2);
  const [participants, setParticipants] = useState<BillSplitParticipant[]>(() => defaultParticipants(2));
  const [pending, startTransition] = useTransition();

  const lineItems = useMemo(
    () =>
      items.map((item) => ({
        id: item.id,
        label: item.label,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
        participantId: item.participantId ?? null,
      })),
    [items],
  );

  const activeParticipants = useMemo(() => {
    if (mode === "seat") return seatParticipants(guestCount);
    if (mode === "equal" || mode === "item") return defaultParticipants(guestCount);
    return participants;
  }, [guestCount, mode, participants]);

  const shares = useMemo(
    () =>
      computeBillSplit({
        mode,
        items: lineItems,
        participants: activeParticipants,
        taxRate,
        tipTotal,
      }),
    [activeParticipants, lineItems, mode, taxRate, tipTotal],
  );

  const totals = billSplitTotals(shares);
  const unassigned = unassignedItemCount(lineItems);

  function updateGuestCount(next: number) {
    const safe = Math.max(1, Math.min(next, 12));
    setGuestCount(safe);
    setParticipants(defaultParticipants(safe));
  }

  function updateParticipantPercentage(participantId: string, percentage: number) {
    setParticipants((prev) =>
      prev.map((participant) =>
        participant.id === participantId
          ? { ...participant, percentage: Math.max(0, percentage) }
          : participant,
      ),
    );
  }

  function assignItem(itemId: string, participantId: string | null) {
    startTransition(async () => {
      const result = await assignTabItemParticipantAction({ tabId, itemId, participantId });
      const error = getActionError(result);
      if (error) {
        toast.error(error);
        return;
      }
      onItemsChange?.(
        lineItems.map((item) =>
          item.id === itemId ? { ...item, participantId } : item,
        ),
      );
    });
  }

  function clearAssignments() {
    startTransition(async () => {
      const result = await clearTabSplitAssignmentsAction({ tabId });
      const error = getActionError(result);
      if (error) {
        toast.error(error);
        return;
      }
      onItemsChange?.(lineItems.map((item) => ({ ...item, participantId: null })));
      toast.success("Split assignments cleared");
    });
  }

  if (!lineItems.length) return null;

  return (
    <section
      className="space-y-4 rounded-2xl border border-border/70 bg-card p-4"
      data-testid="bill-split-panel"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold">Split bill</h3>
          <p className="text-xs text-muted-foreground">
            {tabName} · equal, percentage, seat, and item splits with tax and tip allocation.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="rounded-full"
          disabled={pending}
          onClick={clearAssignments}
        >
          Clear assignments
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {BILL_SPLIT_MODES.map((splitMode) => {
          const Icon = MODE_ICONS[splitMode];
          return (
            <button
              key={splitMode}
              type="button"
              data-testid={`bill-split-mode-${splitMode}`}
              onClick={() => setMode(splitMode)}
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm",
                mode === splitMode
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground",
                posTouchButtonClass,
              )}
            >
              <Icon className="h-4 w-4" aria-hidden />
              {BILL_SPLIT_MODE_LABEL[splitMode]}
            </button>
          );
        })}
      </div>

      {mode !== "percentage" ? (
        <div className="flex items-center gap-3 text-sm">
          <span className="text-muted-foreground">
            {mode === "seat" ? "Seats" : "Guests"}
          </span>
          <input
            type="number"
            min={1}
            max={12}
            value={guestCount}
            onChange={(event) => updateGuestCount(Number(event.target.value))}
            className="h-10 w-20 rounded-lg border px-2"
            data-testid="bill-split-guest-count"
          />
        </div>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2">
          {participants.map((participant) => (
            <label key={participant.id} className="flex items-center justify-between gap-2 rounded-xl border px-3 py-2 text-sm">
              <span>{participant.label}</span>
              <input
                type="number"
                min={0}
                max={100}
                value={participant.percentage ?? 0}
                onChange={(event) =>
                  updateParticipantPercentage(participant.id, Number(event.target.value))
                }
                className="h-9 w-20 rounded-lg border px-2 text-right"
              />
            </label>
          ))}
        </div>
      )}

      {(mode === "item" || mode === "seat") && (
        <div className="space-y-2">
          {unassigned > 0 ? (
            <p className="text-xs text-amber-700">
              {unassigned} item(s) unassigned — they currently roll into the first {mode === "seat" ? "seat" : "guest"}.
            </p>
          ) : null}
          {lineItems.map((item) => (
            <div key={item.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border px-3 py-2 text-sm">
              <div>
                <span className="font-medium">{item.label}</span>
                <span className="ml-2 text-muted-foreground">${item.totalPrice.toFixed(2)}</span>
              </div>
              <select
                value={item.participantId ?? ""}
                disabled={pending}
                onChange={(event) =>
                  assignItem(item.id, event.target.value ? event.target.value : null)
                }
                className="h-10 rounded-lg border px-2"
                data-testid="bill-split-item-assign"
              >
                <option value="">Unassigned</option>
                {activeParticipants.map((participant) => (
                  <option key={participant.id} value={participant.id}>
                    {participant.label}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-2">
        {shares.map((share) => (
          <div
            key={share.participantId}
            className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/60 px-3 py-2"
            data-testid="bill-split-share"
          >
            <div>
              <p className="font-medium">{share.label}</p>
              <p className="text-xs text-muted-foreground">
                Subtotal ${share.subtotal.toFixed(2)} · Tax ${share.tax.toFixed(2)} · Tip ${share.tip.toFixed(2)}
              </p>
            </div>
            <Badge variant="outline" className="rounded-full tabular-nums">
              ${share.total.toFixed(2)}
            </Badge>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-3 text-sm">
        <span className="text-muted-foreground">Split total</span>
        <span className="font-semibold tabular-nums">${totals.total.toFixed(2)}</span>
      </div>
    </section>
  );
}
