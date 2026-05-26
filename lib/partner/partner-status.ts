import type { PartnerClientStatus, PartnerImplementationStage, PartnerOrgType } from "@prisma/client";

export const PARTNER_ORG_TYPE_LABEL: Record<PartnerOrgType, string> = {
  AGENCY: "Agency",
  CONSULTANCY: "Consultancy",
  IMPLEMENTATION_FIRM: "Implementation firm",
  RESELLER: "Reseller",
  FRANCHISE_GROUP: "Franchise group",
  REGIONAL_OPERATOR: "Regional operator",
  ENTERPRISE_DEPLOYMENT: "Enterprise deployment",
  WHITE_LABEL: "White-label",
  SUPPORT_CONTRACTOR: "Support contractor",
  OTHER: "Other",
};

export const PARTNER_CLIENT_STATUS_LABEL: Record<PartnerClientStatus, string> = {
  PROSPECT: "Prospect",
  IMPLEMENTING: "Implementing",
  LIVE: "Live",
  PAUSED: "Paused",
};

export const PARTNER_IMPLEMENTATION_STAGE_LABEL: Record<PartnerImplementationStage, string> = {
  DISCOVERY: "Discovery",
  CONTRACT_SIGNED: "Contract signed",
  DATA_MIGRATION: "Data migration",
  MENU_SETUP: "Menu setup",
  INTEGRATIONS: "Integrations",
  STAFF_SETUP: "Staff setup",
  TRAINING: "Training",
  QA: "QA",
  SOFT_LAUNCH: "Soft launch",
  GO_LIVE: "Go-live",
  STABILIZATION: "Stabilization",
  EXPANSION: "Expansion",
};
