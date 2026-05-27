import type {
  ImportCommitMode,
  ImportPreviewRowAction,
  ImportPreviewRowStatus,
  ImportType,
  ImportStatus,
} from "@prisma/client";

export type ImportKind = ImportType;

export type ImportActorScope = {
  isOwner: boolean;
  role?: string | null;
  email?: string | null;
  platformBypass?: boolean;
};

export type ImportCapability =
  | "import.view"
  | "import.upload"
  | "import.commit"
  | "import.rollback"
  | "import.history"
  | "import.templates";

export type ImportCommitModeKey = ImportCommitMode;

export const IMPORT_COMMIT_MODES: ImportCommitMode[] = [
  "CREATE_ONLY",
  "UPDATE_EXISTING",
  "UPSERT",
  "SKIP_DUPLICATES",
];

export const IMPORT_COMMIT_MODE_LABEL: Record<ImportCommitMode, string> = {
  CREATE_ONLY: "Create only — skip existing records",
  UPDATE_EXISTING: "Update existing only — never insert",
  UPSERT: "Upsert — create new, update existing",
  SKIP_DUPLICATES: "Skip duplicates — create new, ignore matches",
};

export const IMPORT_TYPES: ImportType[] = [
  "PRODUCTS",
  "CUSTOMERS",
  "ORDERS",
  "INGREDIENTS",
  "RECIPES",
  "STAFF",
  "SUPPLIERS",
  "BRANDS",
  "LOCATIONS",
  "NUTRITION_ALLERGENS",
  "PRODUCT_MAPPINGS",
  "MENU_ASSIGNMENTS",
  "PURCHASE_ITEMS",
];

export const IMPORT_TYPE_LABEL: Record<ImportType, string> = {
  PRODUCTS: "Products / menu items",
  CUSTOMERS: "Customers",
  ORDERS: "Orders",
  INGREDIENTS: "Ingredients",
  RECIPES: "Recipes",
  STAFF: "Staff",
  SUPPLIERS: "Suppliers",
  BRANDS: "Brands",
  LOCATIONS: "Locations",
  NUTRITION_ALLERGENS: "Nutrition & allergens",
  PRODUCT_MAPPINGS: "Product mappings",
  MENU_ASSIGNMENTS: "Menu assignments",
  PURCHASE_ITEMS: "Purchase items",
};

/** Types that the legacy commit path can persist today. */
export const COMMITTABLE_TYPES: ImportType[] = [
  "PRODUCTS",
  "CUSTOMERS",
  "INGREDIENTS",
  "STAFF",
];

/** Types where the Import Center only previews and stages, no commit yet. */
export const PREVIEW_ONLY_TYPES: ImportType[] = [
  "ORDERS",
  "RECIPES",
  "SUPPLIERS",
  "BRANDS",
  "LOCATIONS",
  "NUTRITION_ALLERGENS",
  "PRODUCT_MAPPINGS",
  "MENU_ASSIGNMENTS",
  "PURCHASE_ITEMS",
];

export type ImportIssue = { code: string; message: string };

export type PreviewRowDraft = {
  rowNumber: number;
  raw: Record<string, string>;
  normalized: Record<string, unknown> | null;
  validationStatus: ImportPreviewRowStatus;
  action: ImportPreviewRowAction;
  errors: ImportIssue[];
  warnings: ImportIssue[];
  duplicateOfId?: string | null;
  targetEntityId?: string | null;
};

export type PreviewSummary = {
  totalRows: number;
  validRows: number;
  warningRows: number;
  errorRows: number;
  duplicateRows: number;
  skippedRows: number;
  createCount: number;
  updateCount: number;
  rejectCount: number;
};

export type PreviewResult = {
  rows: PreviewRowDraft[];
  summary: PreviewSummary;
  headers: string[];
  unresolvedRequiredColumns: string[];
};

export type ImportRowView = {
  id: string;
  rowNumber: number;
  raw: Record<string, string>;
  normalized: Record<string, unknown> | null;
  validationStatus: ImportPreviewRowStatus;
  action: ImportPreviewRowAction;
  errors: ImportIssue[];
  warnings: ImportIssue[];
  duplicateOfId: string | null;
  targetEntityId: string | null;
};

export type CommitOutcome = {
  created: number;
  updated: number;
  skipped: number;
  rejected: number;
  warnings: number;
  notes: string[];
};

export type RollbackPlan = {
  type: ImportType;
  createdEntities: { entity: string; id: string }[];
  capturedAt: string;
};

export type RollbackAvailability =
  | { available: true; reason?: undefined; count: number }
  | { available: false; reason: string; count: 0 };

export const EMPTY_PREVIEW_SUMMARY: PreviewSummary = {
  totalRows: 0,
  validRows: 0,
  warningRows: 0,
  errorRows: 0,
  duplicateRows: 0,
  skippedRows: 0,
  createCount: 0,
  updateCount: 0,
  rejectCount: 0,
};

export type { ImportStatus };
