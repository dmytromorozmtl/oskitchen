import type { BusinessType } from "@prisma/client";

export function verificationPageTitle(bt: BusinessType | null | undefined): string {
  switch (bt) {
    case "RESTAURANT":
      return "Takeout verification";
    case "CAFE":
      return "Pickup verification";
    case "BAKERY":
      return "Pickup & label check";
    case "CATERING":
      return "Loadout verification";
    case "BAR":
      return "Event loadout check";
    case "GHOST_KITCHEN":
    case "CLOUD_KITCHEN":
    case "MULTI_BRAND":
      return "Order verification";
    default:
      return "Packing verification";
  }
}

export function verificationPageSubtitle(): string {
  return "Scan or enter a guest token, walk the checklist line by line, and leave a tamper-evident audit trail.";
}
