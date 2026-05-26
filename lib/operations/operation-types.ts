/**
 * Cross-module FoodOps vocabulary — complements `lib/orders/*` (order-specific)
 * and Today payloads without replacing Prisma enums.
 */

import type { OrderLifecycleStage } from "@/lib/orders/order-lifecycle-types";

export type OperationalDomain =
  | "orders"
  | "production"
  | "packing"
  | "fulfillment"
  | "integrations"
  | "inventory"
  | "crm"
  | "support"
  | "billing"
  | "platform";

export type OperationalEntityKind =
  | "ORDER"
  | "CUSTOMER"
  | "PRODUCT"
  | "ROUTE"
  | "TASK"
  | "WEBHOOK"
  | "IMPORT"
  | "INTEGRATION"
  | "TICKET"
  | "WORKSPACE";

export type OperationalEntityRef = {
  kind: OperationalEntityKind;
  id: string;
  label?: string | null;
};

export type OperationalActorRef = {
  userId: string;
  displayName?: string | null;
  role?: string | null;
};

export type OperationalNextAction = {
  label: string;
  href: string;
  intent?: string;
};

export type OperationalTaskView = {
  domain: OperationalDomain;
  title: string;
  summary?: string | null;
  stage?: OrderLifecycleStage | null;
  statusLabel: string;
  priorityScore: number;
  dueAt?: Date | null;
  owner?: OperationalActorRef | null;
  entity?: OperationalEntityRef;
  primaryAction: OperationalNextAction;
  secondaryAction?: OperationalNextAction;
};
