import type { BrandTemplateKey } from "@/lib/brands/brand-template-defaults";
import { getBrandTemplateDefaults } from "@/lib/brands/brand-template-defaults";
import { brandSetupProgress } from "@/lib/brands/brand-helpers";
import {
  VIRTUAL_BRAND_PATH,
  VIRTUAL_BRAND_POLICY_ID,
  VIRTUAL_BRAND_PROVISION_TARGET_MINUTES,
  VIRTUAL_BRAND_TEMPLATES,
  type VirtualBrandTemplateKey,
} from "@/lib/enterprise/virtual-brand-policy";
import type {
  VirtualBrandCloneSource,
  VirtualBrandLaunchChecklistItem,
  VirtualBrandManagerDashboard,
  VirtualBrandProvisionResult,
  VirtualBrandProvisionStep,
  VirtualBrandRow,
  VirtualBrandTemplateCard,
} from "@/lib/enterprise/virtual-brand-types";

const TEMPLATE_LABELS: Record<VirtualBrandTemplateKey, string> = {
  ghost_kitchen: "Ghost kitchen",
  cloud_kitchen: "Cloud kitchen",
  meal_prep: "Meal prep virtual",
  catering: "Catering virtual",
};

export type VirtualBrandRawInput = {
  workspaceId: string;
  virtualBrands: VirtualBrandRow[];
  cloneSources: VirtualBrandCloneSource[];
  analyzedAt?: Date;
};

export function buildVirtualBrandProvisionSteps(): VirtualBrandProvisionStep[] {
  return [
    {
      id: "pick_template",
      label: "Pick template",
      estimatedMinutes: 1,
      description: "Ghost, cloud, meal-prep, or catering virtual concept with defaults.",
    },
    {
      id: "name_brand",
      label: "Name & slug",
      estimatedMinutes: 1,
      description: "Guest-facing label and vanity slug — auto-suggested from name.",
    },
    {
      id: "auto_provision",
      label: "Auto-provision",
      estimatedMinutes: 2,
      description: "Brand record, starter menu, storefront link, optional menu clone.",
    },
    {
      id: "launch_checklist",
      label: "Launch checklist",
      estimatedMinutes: 1,
      description: "Logo, publish storefront, map delivery channels.",
    },
  ];
}

export function buildVirtualBrandTemplateCards(): VirtualBrandTemplateCard[] {
  return VIRTUAL_BRAND_TEMPLATES.map((key) => {
    const defaults = getBrandTemplateDefaults(key as BrandTemplateKey);
    return {
      key,
      label: TEMPLATE_LABELS[key],
      description: defaults.descriptionHint,
      estimatedMinutes: VIRTUAL_BRAND_PROVISION_TARGET_MINUTES,
      href: `${VIRTUAL_BRAND_PATH}?template=${key}`,
    };
  });
}

export function buildVirtualBrandLaunchChecklist(input: {
  hasLogo: boolean;
  hasColor: boolean;
  menuCount: number;
  menuItemCount: number;
  storefrontCount: number;
  storefrontPublished: boolean;
  brandId: string;
  menuId: string;
  storefrontId: string | null;
}): VirtualBrandLaunchChecklistItem[] {
  return [
    {
      id: "description",
      label: "Add brand story & positioning",
      done: true,
      href: `/dashboard/brands/${input.brandId}`,
    },
    {
      id: "logo",
      label: "Upload logo & brand colors",
      done: input.hasLogo && input.hasColor,
      href: `/dashboard/brands/${input.brandId}`,
    },
    {
      id: "menu",
      label: "Add menu items or clone catalog",
      done: input.menuItemCount > 0,
      href: `/dashboard/menus/${input.menuId}`,
    },
    {
      id: "storefront",
      label: "Publish guest storefront",
      done: input.storefrontPublished,
      href: input.storefrontId
        ? `/dashboard/storefront/settings?storefrontId=${input.storefrontId}`
        : "/dashboard/storefront/settings",
    },
    {
      id: "channels",
      label: "Map delivery marketplace channels",
      done: false,
      href: "/dashboard/integrations",
    },
  ];
}

export function buildVirtualBrandProvisionResult(input: {
  brandId: string;
  menuId: string;
  storefrontId: string | null;
  slug: string;
  templateKey: VirtualBrandTemplateKey;
  hasLogo: boolean;
  hasColor: boolean;
  menuCount: number;
  menuItemCount: number;
  storefrontCount: number;
  storefrontPublished: boolean;
}): VirtualBrandProvisionResult {
  const setupProgress = brandSetupProgress({
    hasLogo: input.hasLogo,
    hasColor: input.hasColor,
    menuCount: input.menuCount,
    storefrontCount: input.storefrontCount,
    hasDescription: true,
  });

  return {
    brandId: input.brandId,
    menuId: input.menuId,
    storefrontId: input.storefrontId,
    slug: input.slug,
    templateKey: input.templateKey,
    setupProgress,
    steps: buildVirtualBrandProvisionSteps(),
    checklist: buildVirtualBrandLaunchChecklist(input),
  };
}

export function buildVirtualBrandManagerDashboard(input: VirtualBrandRawInput): VirtualBrandManagerDashboard {
  const progressSum = input.virtualBrands.reduce((sum, row) => sum + row.setupProgress, 0);
  const avgSetupProgress =
    input.virtualBrands.length > 0 ? Math.round((progressSum / input.virtualBrands.length) * 100) / 100 : 0;
  const brandsReadyToLaunch = input.virtualBrands.filter((row) => row.setupProgress >= 0.8).length;

  return {
    policyId: VIRTUAL_BRAND_POLICY_ID,
    workspaceId: input.workspaceId,
    generatedAtIso: (input.analyzedAt ?? new Date()).toISOString(),
    provisionTargetMinutes: VIRTUAL_BRAND_PROVISION_TARGET_MINUTES,
    templates: buildVirtualBrandTemplateCards(),
    provisionSteps: buildVirtualBrandProvisionSteps(),
    virtualBrands: input.virtualBrands,
    cloneSources: input.cloneSources,
    summary: {
      virtualBrandCount: input.virtualBrands.length,
      avgSetupProgress,
      brandsReadyToLaunch,
      cloneSourceCount: input.cloneSources.length,
    },
    basePath: VIRTUAL_BRAND_PATH,
  };
}
