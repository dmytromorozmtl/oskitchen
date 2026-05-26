import { isSuperAdminEmail } from "@/lib/platform-owner";

export type CateringQuotePermission =
  | "catering_quote.read.list"
  | "catering_quote.read.detail"
  | "catering_quote.read.cost_margin"
  | "catering_quote.read.internal_notes"
  | "catering_quote.create"
  | "catering_quote.update"
  | "catering_quote.update.pricing"
  | "catering_quote.update.lines"
  | "catering_quote.update.fees"
  | "catering_quote.update.status"
  | "catering_quote.share.public_link"
  | "catering_quote.revoke.public_link"
  | "catering_quote.convert"
  | "catering_quote.archive"
  | "catering_quote.template.manage"
  | "catering_quote.followup.manage"
  | "catering_quote.production.read"
  | "catering_quote.packing.read"
  | "catering_quote.route.read";

export type CateringQuoteActorScope = {
  isOwner: boolean;
  role?: string | null;
  email?: string | null;
};

export function isSuperAdminCatering(scope: CateringQuoteActorScope): boolean {
  return isSuperAdminEmail(scope.email);
}

export function canDoCateringQuote(scope: CateringQuoteActorScope, permission: CateringQuotePermission): boolean {
  if (isSuperAdminCatering(scope)) return true;
  if (scope.isOwner) return true;
  const role = (scope.role ?? "").toLowerCase();

  switch (permission) {
    case "catering_quote.read.list":
    case "catering_quote.read.detail":
    case "catering_quote.create":
    case "catering_quote.update":
    case "catering_quote.update.pricing":
    case "catering_quote.update.lines":
    case "catering_quote.update.fees":
    case "catering_quote.update.status":
    case "catering_quote.share.public_link":
    case "catering_quote.revoke.public_link":
    case "catering_quote.convert":
    case "catering_quote.followup.manage":
    case "catering_quote.template.manage":
      return ["manager", "admin", "sales"].includes(role);
    case "catering_quote.read.cost_margin":
      return ["manager", "admin", "sales", "accountant"].includes(role);
    case "catering_quote.read.internal_notes":
      return ["manager", "admin", "sales"].includes(role);
    case "catering_quote.archive":
      return ["manager", "admin"].includes(role);
    case "catering_quote.production.read":
      return ["manager", "admin", "kitchen", "production", "kitchen_lead"].includes(role);
    case "catering_quote.packing.read":
      return ["manager", "admin", "packer", "packing"].includes(role);
    case "catering_quote.route.read":
      return ["manager", "admin", "driver", "dispatcher"].includes(role);
  }
}
