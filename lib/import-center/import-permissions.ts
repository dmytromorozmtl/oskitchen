import { isSuperAdminEmail } from "@/lib/platform-owner";

import type {
  ImportActorScope,
  ImportCapability,
} from "@/lib/import-center/import-types";

const GRANTS: Record<ImportCapability, string[]> = {
  "import.view": [
    "manager", "admin", "accountant", "kitchen_lead", "kitchen",
    "packer", "packing", "driver", "dispatcher", "sales", "viewer",
  ],
  "import.upload": ["admin", "manager"],
  "import.commit": ["admin"],
  "import.rollback": ["admin"],
  "import.history": ["admin", "manager", "accountant"],
  "import.templates": [
    "admin", "manager", "accountant", "kitchen_lead", "kitchen", "packer",
    "packing", "driver", "dispatcher", "sales",
  ],
};

export function isSuperAdminImport(scope: ImportActorScope): boolean {
  return isSuperAdminEmail(scope.email);
}

export function canUseImportCenter(
  scope: ImportActorScope,
  cap: ImportCapability,
): boolean {
  if (isSuperAdminImport(scope)) return true;
  if (scope.isOwner) return true;
  const role = (scope.role ?? "").toLowerCase();
  return GRANTS[cap]?.includes(role) ?? false;
}
