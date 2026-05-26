import type { PartnerMemberRole } from "@prisma/client";

export const PARTNER_MEMBER_ROLE_LABEL: Record<PartnerMemberRole, string> = {
  PARTNER_OWNER: "Partner owner",
  PARTNER_MANAGER: "Partner manager",
  IMPLEMENTATION_SPECIALIST: "Implementation specialist",
  ONBOARDING_SPECIALIST: "Onboarding specialist",
  SUPPORT_AGENT: "Support agent",
  CONSULTANT: "Consultant",
  TRAINER: "Trainer",
  FINANCE_MANAGER: "Finance manager",
  VIEWER: "Viewer",
};
