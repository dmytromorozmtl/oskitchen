import {
  formatKdsElapsedClock,
  formatKdsTicketNumber,
  isKdsTicketOverdue,
  isKdsTicketReady,
  KDS_OVERDUE_SECONDS,
} from "@/lib/kitchen/kds-queue-clarity-era18";
import { KDS_EXPO_VIEW_ROUTE } from "@/lib/kitchen/kds-expo-view-policy";

export { KDS_EXPO_VIEW_ROUTE };

export type ExpoViewLane = "ready" | "waiting" | "delayed";

export type ExpoViewTicketInput = {
  id: string;
  kind: "order" | "work_item";
  title: string;
  subtitle: string | null;
  status: string;
  elapsedSeconds: number;
  dueAtIso: string | null;
  tableName: string | null;
  itemSummary: string | null;
  priority: string;
};

export type ExpoViewTicket = ExpoViewTicketInput & {
  lane: ExpoViewLane;
  ticketNumber: string;
  elapsedLabel: string;
  isOverdue: boolean;
};

export type ExpoViewLaneSnapshot = {
  lane: ExpoViewLane;
  label: string;
  count: number;
  tickets: ExpoViewTicket[];
};

export type ExpoViewSnapshot = {
  generatedAtIso: string;
  totalTickets: number;
  lanes: ExpoViewLaneSnapshot[];
};

const READY_STATUSES = new Set(["READY", "HANDOFF", "COMPLETED", "DONE"]);
const WAITING_STATUSES = new Set([
  "TO_PREP",
  "IN_PROGRESS",
  "PREPARING",
  "CONFIRMED",
  "REQUESTED",
  "PACK_HANDOFF",
  "HOLD",
  "QUEUED",
]);

const LANE_LABELS: Record<ExpoViewLane, string> = {
  ready: "Ready",
  waiting: "Waiting",
  delayed: "Delayed",
};

export function isExpoReadyStatus(status: string): boolean {
  return isKdsTicketReady(status) || READY_STATUSES.has(status);
}

export function isExpoWaitingStatus(status: string): boolean {
  return WAITING_STATUSES.has(status);
}

export function isExpoTicketDelayed(
  ticket: Pick<ExpoViewTicketInput, "elapsedSeconds" | "dueAtIso" | "status">,
  nowMs: number = Date.now(),
  overdueThresholdSeconds = KDS_OVERDUE_SECONDS,
): boolean {
  if (isKdsTicketOverdue(ticket.elapsedSeconds, overdueThresholdSeconds)) {
    return true;
  }
  if (ticket.dueAtIso) {
    const due = Date.parse(ticket.dueAtIso);
    if (Number.isFinite(due) && due < nowMs && !READY_STATUSES.has(ticket.status)) {
      return true;
    }
  }
  return false;
}

export function resolveExpoLane(
  ticket: Pick<ExpoViewTicketInput, "status" | "elapsedSeconds" | "dueAtIso">,
  nowMs: number = Date.now(),
): ExpoViewLane {
  if (isExpoTicketDelayed(ticket, nowMs)) {
    return "delayed";
  }
  if (isExpoReadyStatus(ticket.status)) {
    return "ready";
  }
  return "waiting";
}

function enrichTicket(ticket: ExpoViewTicketInput, nowMs: number): ExpoViewTicket {
  const lane = resolveExpoLane(ticket, nowMs);
  const isOverdue = lane === "delayed";
  return {
    ...ticket,
    lane,
    ticketNumber: formatKdsTicketNumber(ticket.id),
    elapsedLabel: formatKdsElapsedClock(ticket.elapsedSeconds),
    isOverdue,
  };
}

export function buildExpoViewSnapshot(
  tickets: ExpoViewTicketInput[],
  options?: { now?: Date },
): ExpoViewSnapshot {
  const nowMs = (options?.now ?? new Date()).getTime();
  const enriched = tickets
    .map((ticket) => enrichTicket(ticket, nowMs))
    .sort((a, b) => b.elapsedSeconds - a.elapsedSeconds);

  const lanes: ExpoViewLaneSnapshot[] = (["ready", "waiting", "delayed"] as const).map((lane) => {
    const rows = enriched.filter((ticket) => ticket.lane === lane);
    return {
      lane,
      label: LANE_LABELS[lane],
      count: rows.length,
      tickets: rows,
    };
  });

  return {
    generatedAtIso: new Date(nowMs).toISOString(),
    totalTickets: enriched.length,
    lanes,
  };
}
