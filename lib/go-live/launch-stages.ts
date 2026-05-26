import type { GoLiveLaunchStage, GoLiveLaunchStatus, GoLiveLaunchMode, GoLiveRiskLevel, GoLiveBlockerSeverity } from "@prisma/client";

export const LAUNCH_STAGES: GoLiveLaunchStage[] = [
  "DISCOVERY",
  "DATA_MIGRATION",
  "CATALOG_SETUP",
  "CHANNEL_INTEGRATIONS",
  "PRODUCTION_VALIDATION",
  "PACKING_VALIDATION",
  "DELIVERY_VALIDATION",
  "STAFF_TRAINING",
  "FINANCIAL_VALIDATION",
  "SIMULATION",
  "SOFT_LAUNCH",
  "FULL_GO_LIVE",
  "POST_LAUNCH_MONITORING",
];

export const STAGE_LABEL: Record<GoLiveLaunchStage, string> = {
  DISCOVERY: "Discovery",
  DATA_MIGRATION: "Data migration",
  CATALOG_SETUP: "Catalog setup",
  CHANNEL_INTEGRATIONS: "Channel integrations",
  PRODUCTION_VALIDATION: "Production validation",
  PACKING_VALIDATION: "Packing validation",
  DELIVERY_VALIDATION: "Delivery validation",
  STAFF_TRAINING: "Staff training",
  FINANCIAL_VALIDATION: "Financial validation",
  SIMULATION: "Simulation",
  SOFT_LAUNCH: "Soft launch",
  FULL_GO_LIVE: "Full go-live",
  POST_LAUNCH_MONITORING: "Post-launch monitoring",
};

export const STAGE_DESCRIPTION: Record<GoLiveLaunchStage, string> = {
  DISCOVERY: "Confirm business profile, owners, and success criteria.",
  DATA_MIGRATION: "Move historical data into KitchenOS via the Import Center.",
  CATALOG_SETUP: "Menus, products, modifiers, pricing, and tax codes.",
  CHANNEL_INTEGRATIONS: "Connect WooCommerce, Shopify, Uber, and other channels.",
  PRODUCTION_VALIDATION: "Verify production sheet, kitchen flow, and prep batches.",
  PACKING_VALIDATION: "Print labels, verify packing checklist, run packing dry-run.",
  DELIVERY_VALIDATION: "Routes, drivers, dispatch, and delivery windows.",
  STAFF_TRAINING: "Roles assigned and training completion logged.",
  FINANCIAL_VALIDATION: "Billing, payment methods, taxes, refunds, and exports.",
  SIMULATION: "Run lunch rush / catering / multi-location simulations.",
  SOFT_LAUNCH: "Limited launch — internal customers, capped throughput, selected channels.",
  FULL_GO_LIVE: "Full traffic, all channels enabled.",
  POST_LAUNCH_MONITORING: "Watch the first 7 days, log incidents, capture KPIs.",
};

export const LAUNCH_STATUS_LABEL: Record<GoLiveLaunchStatus, string> = {
  NOT_STARTED: "Not started",
  IN_PROGRESS: "In progress",
  NEEDS_REVIEW: "Needs review",
  BLOCKED: "Blocked",
  READY: "Ready",
  APPROVED: "Approved",
  LIVE: "Live",
  POST_LAUNCH_MONITORING: "Post-launch monitoring",
  ROLLBACK_MODE: "Rollback mode",
  COMPLETED: "Completed",
};

export const LAUNCH_STATUS_TONE: Record<
  GoLiveLaunchStatus,
  "neutral" | "info" | "success" | "warning" | "danger"
> = {
  NOT_STARTED: "neutral",
  IN_PROGRESS: "info",
  NEEDS_REVIEW: "warning",
  BLOCKED: "danger",
  READY: "info",
  APPROVED: "success",
  LIVE: "success",
  POST_LAUNCH_MONITORING: "info",
  ROLLBACK_MODE: "danger",
  COMPLETED: "neutral",
};

export const LAUNCH_MODE_LABEL: Record<GoLiveLaunchMode, string> = {
  PILOT: "Pilot",
  SOFT: "Soft launch",
  FULL: "Full launch",
  PHASED: "Phased rollout",
};

export const RISK_LEVEL_LABEL: Record<GoLiveRiskLevel, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  CRITICAL: "Critical",
};

export const RISK_LEVEL_TONE: Record<
  GoLiveRiskLevel,
  "neutral" | "info" | "success" | "warning" | "danger"
> = {
  LOW: "success",
  MEDIUM: "info",
  HIGH: "warning",
  CRITICAL: "danger",
};

export const BLOCKER_SEVERITY_LABEL: Record<GoLiveBlockerSeverity, string> = {
  INFO: "Info",
  WARNING: "Warning",
  HIGH_RISK: "High risk",
  CRITICAL: "Critical",
};

export const BLOCKER_SEVERITY_TONE: Record<
  GoLiveBlockerSeverity,
  "neutral" | "info" | "success" | "warning" | "danger"
> = {
  INFO: "info",
  WARNING: "warning",
  HIGH_RISK: "warning",
  CRITICAL: "danger",
};

export function stageRank(stage: GoLiveLaunchStage): number {
  return LAUNCH_STAGES.indexOf(stage);
}

export function isTerminalStage(stage: GoLiveLaunchStage): boolean {
  return stage === "POST_LAUNCH_MONITORING" || stage === "FULL_GO_LIVE";
}
