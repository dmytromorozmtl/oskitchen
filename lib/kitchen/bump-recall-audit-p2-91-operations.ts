/**
 * Pure helpers for bump/recall audit (Blueprint P2-91).
 */

import { AUDIT_ACTIONS } from "@/lib/audit/audit-actions";
import { isKdsTicketOverdue, KDS_OVERDUE_SECONDS } from "@/lib/kitchen/kds-queue-clarity-era18";

export const BUMP_RECALL_STATION_KEYWORDS: Readonly<Record<string, readonly string[]>> = {
  grill: ["burger", "steak", "chicken", "rib", "bbq", "grill"],
  fry: ["fries", "wing", "fried", "tempura", "nugget"],
  cold: ["salad", "ceviche", "poke", "cold"],
  bar: ["coffee", "latte", "cocktail", "soda", "beer", "wine"],
  expo: ["expo", "plating", "assembly"],
  packing: ["pack", "bag", "label", "to-go", "delivery"],
};

export const REMAKE_REASON_OPERATOR_RECALL = "operator_recall" as const;
export const REMAKE_REASON_LATE_TICKET = "late_ticket_remake" as const;

export type BumpRecallEventKind = "bump" | "recall";

export type BumpRecallAuditEvent = {
  id: string;
  kind: BumpRecallEventKind;
  orderId: string | null;
  actorUserId: string | null;
  actorEmail: string | null;
  actorRole: string | null;
  station: string;
  elapsedSeconds: number;
  lateTicket: boolean;
  remakeReason: string | null;
  createdAt: string;
};

export type StationTimeSummary = {
  station: string;
  bumpCount: number;
  recallCount: number;
  avgElapsedSeconds: number;
  lateCount: number;
};

export type BumpRecallAuditReport = {
  bumpCount: number;
  recallCount: number;
  lateTicketCount: number;
  uniqueOperators: number;
  stationSummaries: StationTimeSummary[];
  recentEvents: BumpRecallAuditEvent[];
};

export function inferStationFromOrderItems(items: readonly string[]): string {
  const haystack = items.join(" ").toLowerCase();
  for (const [station, keywords] of Object.entries(BUMP_RECALL_STATION_KEYWORDS)) {
    if (keywords.some((keyword) => haystack.includes(keyword))) {
      return station;
    }
  }
  return "expo";
}

export function buildBumpAuditMetadata(input: {
  actorUserId: string;
  actorRole: string;
  station: string;
  elapsedSeconds: number;
  orderStatusBefore?: string | null;
  itemCount?: number;
}): Record<string, unknown> {
  return {
    bumpedByUserId: input.actorUserId,
    bumpedByRole: input.actorRole,
    station: input.station,
    elapsedSecondsAtBump: input.elapsedSeconds,
    lateTicket: isKdsTicketOverdue(input.elapsedSeconds),
    overdueThresholdSeconds: KDS_OVERDUE_SECONDS,
    orderStatusBefore: input.orderStatusBefore ?? null,
    itemCount: input.itemCount ?? 0,
  };
}

export function buildRecallAuditMetadata(input: {
  actorUserId: string;
  actorRole: string;
  station: string;
  elapsedSeconds: number;
  orderStatusBefore?: string | null;
}): Record<string, unknown> {
  const lateTicket = isKdsTicketOverdue(input.elapsedSeconds);
  return {
    recalledByUserId: input.actorUserId,
    recalledByRole: input.actorRole,
    station: input.station,
    elapsedSecondsAtRecall: input.elapsedSeconds,
    lateTicket,
    overdueThresholdSeconds: KDS_OVERDUE_SECONDS,
    remakeReason: lateTicket ? REMAKE_REASON_LATE_TICKET : REMAKE_REASON_OPERATOR_RECALL,
    orderStatusBefore: input.orderStatusBefore ?? null,
  };
}

function readMetadataString(metadata: Record<string, unknown>, key: string): string | null {
  const value = metadata[key];
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function readMetadataNumber(metadata: Record<string, unknown>, key: string): number {
  const value = metadata[key];
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function readMetadataBoolean(metadata: Record<string, unknown>, key: string): boolean {
  return metadata[key] === true;
}

export function parseBumpRecallAuditRow(row: {
  id: string;
  action: string;
  entityId: string | null;
  userId: string | null;
  actorEmail: string | null;
  actorRole: string | null;
  createdAt: Date;
  metadataJson: unknown;
}): BumpRecallAuditEvent | null {
  const action = row.action.toUpperCase();
  const kind: BumpRecallEventKind | null =
    action === AUDIT_ACTIONS.KITCHEN_ORDER_BUMPED
      ? "bump"
      : action === AUDIT_ACTIONS.KITCHEN_ORDER_RECALLED
        ? "recall"
        : null;
  if (!kind) return null;

  const metadata =
    row.metadataJson && typeof row.metadataJson === "object" && !Array.isArray(row.metadataJson)
      ? (row.metadataJson as Record<string, unknown>)
      : {};

  const elapsedSeconds =
    kind === "bump"
      ? readMetadataNumber(metadata, "elapsedSecondsAtBump")
      : readMetadataNumber(metadata, "elapsedSecondsAtRecall");

  return {
    id: row.id,
    kind,
    orderId: row.entityId,
    actorUserId:
      readMetadataString(metadata, kind === "bump" ? "bumpedByUserId" : "recalledByUserId") ??
      row.userId,
    actorEmail: row.actorEmail,
    actorRole:
      readMetadataString(metadata, kind === "bump" ? "bumpedByRole" : "recalledByRole") ??
      row.actorRole,
    station: readMetadataString(metadata, "station") ?? "expo",
    elapsedSeconds,
    lateTicket: readMetadataBoolean(metadata, "lateTicket"),
    remakeReason: kind === "recall" ? readMetadataString(metadata, "remakeReason") : null,
    createdAt: row.createdAt.toISOString(),
  };
}

export function aggregateBumpRecallReport(events: readonly BumpRecallAuditEvent[]): BumpRecallAuditReport {
  const stationMap = new Map<string, StationTimeSummary>();
  const operators = new Set<string>();
  let bumpCount = 0;
  let recallCount = 0;
  let lateTicketCount = 0;

  for (const event of events) {
    if (event.kind === "bump") bumpCount += 1;
    else recallCount += 1;
    if (event.lateTicket) lateTicketCount += 1;
    if (event.actorUserId) operators.add(event.actorUserId);

    const existing = stationMap.get(event.station) ?? {
      station: event.station,
      bumpCount: 0,
      recallCount: 0,
      avgElapsedSeconds: 0,
      lateCount: 0,
    };
    if (event.kind === "bump") existing.bumpCount += 1;
    else existing.recallCount += 1;
    if (event.lateTicket) existing.lateCount += 1;
    const totalEvents = existing.bumpCount + existing.recallCount;
    existing.avgElapsedSeconds = Math.round(
      (existing.avgElapsedSeconds * (totalEvents - 1) + event.elapsedSeconds) / totalEvents,
    );
    stationMap.set(event.station, existing);
  }

  return {
    bumpCount,
    recallCount,
    lateTicketCount,
    uniqueOperators: operators.size,
    stationSummaries: [...stationMap.values()].sort((a, b) => b.bumpCount - a.bumpCount),
    recentEvents: [...events].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    ),
  };
}

export function formatElapsedSeconds(seconds: number): string {
  if (seconds <= 0) return "0s";
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  if (minutes === 0) return `${remainder}s`;
  return `${minutes}m ${remainder}s`;
}
