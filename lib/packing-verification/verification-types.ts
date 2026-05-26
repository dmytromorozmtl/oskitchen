import type {
  PackingVerificationItemStatus,
  PackingVerificationSessionMode,
  PackingVerificationSessionStatus,
} from "@prisma/client";

export type {
  PackingVerificationItemStatus,
  PackingVerificationSessionMode,
  PackingVerificationSessionStatus,
};

export type VerificationTokenType =
  | "ORDER_PUBLIC_TOKEN"
  | "ORDER_ID"
  | "WAVE_ID"
  | "ROUTE_ID"
  | "UNKNOWN";

export type VerificationScanSource = "CAMERA" | "MANUAL" | "ORDER_LOOKUP" | "CUSTOMER_SEARCH";
