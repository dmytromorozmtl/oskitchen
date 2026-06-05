import type { VIRTUAL_BRAND_POLICY_ID, VirtualBrandTemplateKey } from "@/lib/enterprise/virtual-brand-policy";

export type VirtualBrandProvisionStepId =
  | "pick_template"
  | "name_brand"
  | "auto_provision"
  | "launch_checklist";

export type VirtualBrandProvisionStep = {
  id: VirtualBrandProvisionStepId;
  label: string;
  estimatedMinutes: number;
  description: string;
};

export type VirtualBrandTemplateCard = {
  key: VirtualBrandTemplateKey;
  label: string;
  description: string;
  estimatedMinutes: number;
  href: string;
};

export type VirtualBrandRow = {
  brandId: string;
  name: string;
  slug: string;
  conceptKind: string;
  menuCount: number;
  storefrontCount: number;
  setupProgress: number;
  createdAtIso: string;
};

export type VirtualBrandCloneSource = {
  menuId: string;
  title: string;
  productCount: number;
};

export type VirtualBrandLaunchChecklistItem = {
  id: string;
  label: string;
  done: boolean;
  href: string;
};

export type VirtualBrandProvisionResult = {
  brandId: string;
  menuId: string;
  storefrontId: string | null;
  slug: string;
  templateKey: VirtualBrandTemplateKey;
  setupProgress: number;
  steps: VirtualBrandProvisionStep[];
  checklist: VirtualBrandLaunchChecklistItem[];
};

export type VirtualBrandManagerDashboard = {
  policyId: typeof VIRTUAL_BRAND_POLICY_ID;
  workspaceId: string;
  generatedAtIso: string;
  provisionTargetMinutes: number;
  templates: VirtualBrandTemplateCard[];
  provisionSteps: VirtualBrandProvisionStep[];
  virtualBrands: VirtualBrandRow[];
  cloneSources: VirtualBrandCloneSource[];
  summary: {
    virtualBrandCount: number;
    avgSetupProgress: number;
    brandsReadyToLaunch: number;
    cloneSourceCount: number;
  };
  basePath: string;
};
