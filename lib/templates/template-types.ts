import type { BusinessType, TemplateApplyMode, TemplateCategory } from "@prisma/client";

import type { PermissionKey } from "@/lib/permissions/permissions";

export type TemplateActorScope = {
  isOwner: boolean;
  role?: string | null;
  email?: string | null;
  granted?: ReadonlySet<PermissionKey>;
  platformBypass?: boolean;
};

export type TemplateCapability =
  | "templates.view"
  | "templates.preview"
  | "templates.apply"
  | "templates.rollback"
  | "templates.history";

export type TemplateSectionKey =
  | "business_mode"
  | "module_pins"
  | "module_visibility"
  | "playbooks"
  | "setup_tasks"
  | "storefront_defaults"
  | "report_pack"
  | "import_templates"
  | "sample_data";

export const ALL_TEMPLATE_SECTIONS: TemplateSectionKey[] = [
  "business_mode",
  "module_pins",
  "module_visibility",
  "playbooks",
  "setup_tasks",
  "storefront_defaults",
  "report_pack",
  "import_templates",
  "sample_data",
];

export const TEMPLATE_SECTION_LABEL: Record<TemplateSectionKey, string> = {
  business_mode: "Business mode",
  module_pins: "Sidebar pins",
  module_visibility: "Module visibility",
  playbooks: "Recommended playbooks",
  setup_tasks: "Setup tasks",
  storefront_defaults: "Storefront defaults",
  report_pack: "Report pack",
  import_templates: "Import templates",
  sample_data: "Sample data",
};

export type TemplateSetupTaskSeed = {
  title: string;
  description?: string;
  priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  estimatedMinutes?: number;
  actionRoute?: string;
};

export type TemplateModulePin = {
  moduleKey: string;
  pinned?: boolean;
  enabled?: boolean;
};

export type WorkspaceTemplateSeed = {
  key: string;
  title: string;
  description: string;
  category: TemplateCategory;
  businessModes: BusinessType[];
  version: string;
  primaryBusinessMode: BusinessType | null;
  demoSlug?: string;
  setupTimeMinutes: number;
  /** Strings shown in the UI summary. */
  whatItConfigures: string[];
  whatItDoesNot: string[];
  warnings: string[];
  sections: {
    modulePins: TemplateModulePin[];
    playbookSlugs: string[];
    setupTasks: TemplateSetupTaskSeed[];
    storefrontHints?: { themeKey?: string; brandColorHex?: string };
    reportPackKeys?: string[];
    importTemplateKeys?: string[];
    /** Optional menu category names — created only when user opts in. */
    sampleMenuCategories?: string[];
  };
};

export type TemplatePreviewChange = {
  section: TemplateSectionKey;
  action: "create" | "update" | "skip" | "noop";
  summary: string;
  detail?: string;
  conflict?: string;
};

export type TemplatePreview = {
  templateKey: string;
  templateVersion: string;
  generatedAt: string;
  businessMode: BusinessType | null;
  changes: TemplatePreviewChange[];
  counts: {
    create: number;
    update: number;
    skip: number;
    conflicts: number;
  };
  rollback: {
    available: "full" | "partial" | "none";
    reason?: string;
  };
};

export type TemplateApplyInput = {
  templateKey: string;
  applyMode: TemplateApplyMode;
  selectedSections: TemplateSectionKey[];
  acknowledgeConflicts: boolean;
  overwriteBusinessMode: boolean;
};

export type TemplateApplyResult = {
  applicationId: string;
  status: "APPLIED" | "PARTIALLY_APPLIED" | "FAILED";
  changes: TemplatePreviewChange[];
  errors: string[];
};
