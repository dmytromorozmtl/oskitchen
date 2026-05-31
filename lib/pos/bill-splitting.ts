/**
 * Pure bill split calculations for POS tabs — equal, percentage, seat, and item modes.
 */

export type BillSplitMode = "equal" | "percentage" | "seat" | "item";

export const BILL_SPLIT_MODES: BillSplitMode[] = ["equal", "percentage", "seat", "item"];

export const BILL_SPLIT_MODE_LABEL: Record<BillSplitMode, string> = {
  equal: "Split equally",
  percentage: "Split by percentage",
  seat: "Split by seat",
  item: "Split by item",
};

export type BillSplitLineItem = {
  id: string;
  label: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  participantId?: string | null;
};

export type BillSplitParticipant = {
  id: string;
  label: string;
  percentage?: number;
};

export type BillSplitShare = {
  participantId: string;
  label: string;
  subtotal: number;
  tax: number;
  tip: number;
  total: number;
  itemIds: string[];
};

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

export function defaultParticipants(count: number, prefix = "Guest"): BillSplitParticipant[] {
  const safe = Math.max(1, Math.min(count, 12));
  return Array.from({ length: safe }, (_, index) => ({
    id: `${prefix.toLowerCase()}-${index + 1}`,
    label: `${prefix} ${index + 1}`,
    percentage: round2(100 / safe),
  }));
}

export function seatParticipants(count: number): BillSplitParticipant[] {
  return defaultParticipants(count, "Seat");
}

export function normalizeParticipantPercentages(
  participants: BillSplitParticipant[],
): BillSplitParticipant[] {
  const total = participants.reduce((sum, participant) => sum + (participant.percentage ?? 0), 0);
  if (total <= 0) {
    const even = round2(100 / Math.max(participants.length, 1));
    return participants.map((participant) => ({ ...participant, percentage: even }));
  }
  return participants.map((participant) => ({
    ...participant,
    percentage: round2(((participant.percentage ?? 0) / total) * 100),
  }));
}

function allocateProportional(
  amount: number,
  weights: number[],
): number[] {
  if (amount <= 0 || weights.length === 0) return weights.map(() => 0);
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  if (totalWeight <= 0) {
    const even = round2(amount / weights.length);
    return weights.map((_, index) =>
      index === weights.length - 1 ? round2(amount - even * (weights.length - 1)) : even,
    );
  }

  let allocated = 0;
  return weights.map((weight, index) => {
    if (index === weights.length - 1) return round2(amount - allocated);
    const share = round2((amount * weight) / totalWeight);
    allocated = round2(allocated + share);
    return share;
  });
}

function buildShareMap(participants: BillSplitParticipant[]): Map<string, BillSplitShare> {
  return new Map(
    participants.map((participant) => [
      participant.id,
      {
        participantId: participant.id,
        label: participant.label,
        subtotal: 0,
        tax: 0,
        tip: 0,
        total: 0,
        itemIds: [],
      },
    ]),
  );
}

export function computeBillSplit(input: {
  mode: BillSplitMode;
  items: BillSplitLineItem[];
  participants: BillSplitParticipant[];
  taxRate?: number;
  tipTotal?: number;
}): BillSplitShare[] {
  const taxRate = input.taxRate ?? 0.08;
  const tipTotal = input.tipTotal ?? 0;
  const participants =
    input.mode === "percentage"
      ? normalizeParticipantPercentages(input.participants)
      : input.participants;

  if (!participants.length) return [];

  const shares = buildShareMap(participants);
  const billSubtotal = round2(input.items.reduce((sum, item) => sum + item.totalPrice, 0));

  if (input.mode === "item" || input.mode === "seat") {
    const fallbackId = participants[0]?.id;
    for (const item of input.items) {
      const participantId = item.participantId && shares.has(item.participantId)
        ? item.participantId
        : fallbackId;
      if (!participantId) continue;
      const share = shares.get(participantId)!;
      share.subtotal = round2(share.subtotal + item.totalPrice);
      share.itemIds.push(item.id);
    }
  } else if (input.mode === "percentage") {
    for (const participant of participants) {
      const share = shares.get(participant.id)!;
      share.subtotal = round2((billSubtotal * (participant.percentage ?? 0)) / 100);
    }
  } else {
    const evenSubtotal = round2(billSubtotal / participants.length);
    let assigned = 0;
    participants.forEach((participant, index) => {
      const share = shares.get(participant.id)!;
      share.subtotal =
        index === participants.length - 1
          ? round2(billSubtotal - assigned)
          : evenSubtotal;
      assigned = round2(assigned + share.subtotal);
    });
  }

  const subtotalWeights = participants.map((participant) => shares.get(participant.id)!.subtotal);
  const taxParts = allocateProportional(round2(billSubtotal * taxRate), subtotalWeights);
  const tipParts = allocateProportional(tipTotal, subtotalWeights);

  return participants.map((participant, index) => {
    const share = shares.get(participant.id)!;
    share.tax = taxParts[index] ?? 0;
    share.tip = tipParts[index] ?? 0;
    share.total = round2(share.subtotal + share.tax + share.tip);
    return share;
  });
}

export function billSplitTotals(shares: BillSplitShare[]): {
  subtotal: number;
  tax: number;
  tip: number;
  total: number;
} {
  return shares.reduce(
    (acc, share) => ({
      subtotal: round2(acc.subtotal + share.subtotal),
      tax: round2(acc.tax + share.tax),
      tip: round2(acc.tip + share.tip),
      total: round2(acc.total + share.total),
    }),
    { subtotal: 0, tax: 0, tip: 0, total: 0 },
  );
}

export function unassignedItemCount(items: BillSplitLineItem[]): number {
  return items.filter((item) => !item.participantId).length;
}
