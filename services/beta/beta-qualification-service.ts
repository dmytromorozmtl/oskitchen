import type { BetaProgramStage } from "@prisma/client";

const ORDER: BetaProgramStage[] = [
  "NEW",
  "REVIEWING",
  "QUALIFIED",
  "WAITLISTED",
  "APPROVED",
  "INVITED",
  "ONBOARDING",
  "ACTIVATED",
  "POWER_USER",
  "CONVERTED",
  "CHURNED",
  "REJECTED",
];

/** Returns true if transition is allowed (soft rules — founders can override in UI later). */
export function isAllowedProgramTransition(from: BetaProgramStage, to: BetaProgramStage): boolean {
  if (from === to) return true;
  if (to === "REJECTED" || to === "CHURNED") return true;
  const i = ORDER.indexOf(from);
  const j = ORDER.indexOf(to);
  if (i < 0 || j < 0) return true;
  // Allow ±3 hops to avoid blocking legitimate skips (e.g. straight to INVITED).
  return Math.abs(j - i) <= 4 || j > i;
}

export function defaultTimestampsForStage(
  stage: BetaProgramStage,
): Partial<{
  approvedAt: Date;
  rejectedAt: Date;
  invitedAt: Date;
  onboardedAt: Date;
  convertedToCustomerAt: Date;
  churnedAt: Date;
}> {
  const now = new Date();
  switch (stage) {
    case "APPROVED":
      return { approvedAt: now };
    case "REJECTED":
      return { rejectedAt: now };
    case "INVITED":
      return { invitedAt: now };
    case "ONBOARDING":
      return { onboardedAt: now };
    case "CONVERTED":
      return { convertedToCustomerAt: now };
    case "CHURNED":
      return { churnedAt: now };
    default:
      return {};
  }
}
