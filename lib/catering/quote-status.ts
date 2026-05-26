import type { CateringQuoteStatus } from "@prisma/client";

export const CATERING_QUOTE_STATUS_VALUES = [
  "DRAFT",
  "READY_TO_SEND",
  "SENT",
  "VIEWED",
  "NEEDS_REVISION",
  "ACCEPTED",
  "DECLINED",
  "REJECTED",
  "EXPIRED",
  "CONVERTED_TO_ORDER",
  "CANCELLED",
  "ARCHIVED",
] as const satisfies readonly CateringQuoteStatus[];

export const CATERING_QUOTE_STATUS_LABEL: Record<CateringQuoteStatus, string> = {
  DRAFT: "Draft",
  READY_TO_SEND: "Ready to send",
  SENT: "Sent",
  VIEWED: "Viewed",
  NEEDS_REVISION: "Needs revision",
  ACCEPTED: "Accepted",
  DECLINED: "Declined",
  REJECTED: "Rejected",
  EXPIRED: "Expired",
  CONVERTED_TO_ORDER: "Converted",
  CANCELLED: "Cancelled",
  ARCHIVED: "Archived",
};

export const CATERING_QUOTE_STATUS_BADGE: Record<CateringQuoteStatus, "default" | "secondary" | "outline" | "destructive"> = {
  DRAFT: "outline",
  READY_TO_SEND: "secondary",
  SENT: "default",
  VIEWED: "default",
  NEEDS_REVISION: "outline",
  ACCEPTED: "secondary",
  DECLINED: "destructive",
  REJECTED: "destructive",
  EXPIRED: "outline",
  CONVERTED_TO_ORDER: "secondary",
  CANCELLED: "destructive",
  ARCHIVED: "outline",
};

/**
 * Pipeline column ordering. `DECLINED` is included as a legacy alias of
 * `REJECTED` so old rows still slot into the lost column.
 */
export const PIPELINE_COLUMNS: { id: string; label: string; statuses: CateringQuoteStatus[] }[] = [
  { id: "lead", label: "Lead / Draft", statuses: ["DRAFT"] },
  { id: "ready", label: "Ready to send", statuses: ["READY_TO_SEND"] },
  { id: "sent", label: "Sent", statuses: ["SENT"] },
  { id: "viewed", label: "Viewed", statuses: ["VIEWED"] },
  { id: "revise", label: "Needs revision", statuses: ["NEEDS_REVISION"] },
  { id: "accepted", label: "Accepted", statuses: ["ACCEPTED"] },
  { id: "lost", label: "Rejected / Lost", statuses: ["REJECTED", "DECLINED"] },
  { id: "expired", label: "Expired", statuses: ["EXPIRED"] },
  { id: "converted", label: "Converted", statuses: ["CONVERTED_TO_ORDER"] },
];

export const TERMINAL_STATUSES: readonly CateringQuoteStatus[] = [
  "CONVERTED_TO_ORDER",
  "CANCELLED",
  "ARCHIVED",
];

/**
 * Allowed status transitions. Designed to keep the pipeline honest:
 *  - DRAFT can move forward (READY_TO_SEND), be sent directly, be cancelled.
 *  - SENT/VIEWED can move to ACCEPTED / REJECTED / NEEDS_REVISION / EXPIRED.
 *  - ACCEPTED can only move to CONVERTED_TO_ORDER or CANCELLED.
 *  - CONVERTED_TO_ORDER and ARCHIVED are terminal except for ARCHIVED→DRAFT.
 */
export function canTransitionQuoteStatus(from: CateringQuoteStatus, to: CateringQuoteStatus): boolean {
  if (from === to) return false;
  switch (from) {
    case "DRAFT":
      return ["READY_TO_SEND", "SENT", "CANCELLED", "ARCHIVED"].includes(to);
    case "READY_TO_SEND":
      return ["DRAFT", "SENT", "CANCELLED", "ARCHIVED"].includes(to);
    case "SENT":
      return ["VIEWED", "ACCEPTED", "REJECTED", "DECLINED", "NEEDS_REVISION", "EXPIRED", "CANCELLED", "ARCHIVED"].includes(to);
    case "VIEWED":
      return ["ACCEPTED", "REJECTED", "DECLINED", "NEEDS_REVISION", "EXPIRED", "CANCELLED", "ARCHIVED"].includes(to);
    case "NEEDS_REVISION":
      return ["DRAFT", "READY_TO_SEND", "SENT", "CANCELLED", "ARCHIVED"].includes(to);
    case "ACCEPTED":
      return ["CONVERTED_TO_ORDER", "CANCELLED", "ARCHIVED"].includes(to);
    case "REJECTED":
    case "DECLINED":
      return ["ARCHIVED", "DRAFT"].includes(to);
    case "EXPIRED":
      return ["DRAFT", "READY_TO_SEND", "ARCHIVED"].includes(to);
    case "CONVERTED_TO_ORDER":
      return ["ARCHIVED"].includes(to);
    case "CANCELLED":
      return ["ARCHIVED", "DRAFT"].includes(to);
    case "ARCHIVED":
      return ["DRAFT"].includes(to);
  }
}
