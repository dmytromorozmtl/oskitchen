import { hasPermission } from "@/lib/permissions/guards";
import type { PermissionKey } from "@/lib/permissions/permissions";

export type PosNavLink = {
  href: string;
  label: string;
  match?: "exact" | "prefix";
};

export function buildPosSubnavLinks(granted: ReadonlySet<PermissionKey>): PosNavLink[] {
  if (!hasPermission(granted, "pos.access")) {
    return [];
  }

  const links: PosNavLink[] = [
    { href: "/dashboard/pos", label: "Overview", match: "exact" },
    { href: "/dashboard/pos/terminal", label: "Terminal" },
    { href: "/dashboard/pos/tablet", label: "Tablet" },
    { href: "/dashboard/pos/mobile", label: "Mobile" },
    { href: "/dashboard/pos/tabs", label: "Tabs" },
    { href: "/dashboard/pos/handheld", label: "Handheld" },
  ];

  if (hasPermission(granted, "pos.register.manage")) {
    links.push({ href: "/dashboard/pos/registers", label: "Registers" });
  }

  if (hasPermission(granted, "pos.shift.open") || hasPermission(granted, "pos.shift.close")) {
    links.push(
      { href: "/dashboard/pos/cash", label: "Cash" },
      { href: "/dashboard/pos/shifts", label: "Shifts" },
    );
  }

  links.push(
    { href: "/dashboard/pos/transactions", label: "Transactions" },
    { href: "/dashboard/pos/receipts", label: "Receipts" },
    { href: "/dashboard/pos/reports", label: "Reports" },
  );

  if (hasPermission(granted, "pos.hardware.manage")) {
    links.push({ href: "/dashboard/pos/settings", label: "POS settings" });
  }

  return links;
}
