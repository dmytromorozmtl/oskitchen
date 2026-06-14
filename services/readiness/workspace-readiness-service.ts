import type { KitchenSettings } from "@prisma/client";

export type ReadinessCategoryId =
  | "profile"
  | "menus"
  | "products"
  | "channels"
  | "staff"
  | "operations";

export type ReadinessCategory = {
  id: ReadinessCategoryId;
  label: string;
  score: number;
  missing: string[];
  href: string;
};

export type WorkspaceReadiness = {
  overall: number;
  categories: ReadinessCategory[];
};

type ReadinessInput = {
  settings: KitchenSettings | null;
  menuCount: number;
  productCount: number;
  channelCount: number;
  integrationConnectedCount: number;
  staffCount: number;
  activeOrders: number;
};

function clamp(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

export function computeWorkspaceReadiness(input: ReadinessInput): WorkspaceReadiness {
  const missingProfile: string[] = [];
  if (!input.settings?.businessName?.trim()) missingProfile.push("Business name");
  if (!input.settings?.businessType) missingProfile.push("Business type");
  if (!input.settings?.timezone?.trim()) missingProfile.push("Timezone");
  if (!input.settings?.currency?.trim()) missingProfile.push("Currency");
  const profileScore = clamp(100 - missingProfile.length * 20);

  const missingMenus: string[] = [];
  if (input.menuCount === 0) missingMenus.push("Create at least one menu");
  const menusScore = input.menuCount > 0 ? 100 : 35;

  const missingProducts: string[] = [];
  if (input.productCount === 0) missingProducts.push("Add menu items / SKUs");
  const productsScore = input.productCount > 0 ? 100 : 30;

  const missingChannels: string[] = [];
  if (input.channelCount === 0 && input.integrationConnectedCount === 0) {
    missingChannels.push("Flag a sales channel or connect an integration");
  }
  const channelsScore =
    input.channelCount > 0 || input.integrationConnectedCount > 0 ? 100 : 40;

  const missingStaff: string[] = [];
  if (input.staffCount === 0) missingStaff.push("Optional: invite staff for assignments");
  const staffScore = input.staffCount > 0 ? 100 : 70;

  const missingOps: string[] = [];
  if (input.activeOrders === 0) missingOps.push("No active orders — run a test order when ready");
  const operationsScore = input.activeOrders > 0 ? 100 : 55;

  const categories: ReadinessCategory[] = [
    {
      id: "profile",
      label: "Workspace profile",
      score: profileScore,
      missing: missingProfile,
      href: "/dashboard/settings/workspace",
    },
    {
      id: "menus",
      label: "Menus",
      score: menusScore,
      missing: missingMenus,
      href: "/dashboard/menus",
    },
    {
      id: "products",
      label: "Menu items",
      score: productsScore,
      missing: missingProducts,
      href: "/dashboard/products",
    },
    {
      id: "channels",
      label: "Channels & integrations",
      score: channelsScore,
      missing: missingChannels,
      href: "/dashboard/sales-channels",
    },
    {
      id: "staff",
      label: "Staff",
      score: staffScore,
      missing: missingStaff,
      href: "/dashboard/staff",
    },
    {
      id: "operations",
      label: "Live operations",
      score: operationsScore,
      missing: missingOps,
      href: "/dashboard/orders/new",
    },
  ];

  const overall = clamp(
    categories.reduce((acc, c) => acc + c.score, 0) / Math.max(1, categories.length),
  );

  return { overall, categories };
}
