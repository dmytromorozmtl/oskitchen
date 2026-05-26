import { MODULE_REGISTRY_ENTRIES } from "@/lib/modules/module-registry";

export type CommandPaletteRoute = {
  href: string;
  label: string;
  k?: string;
  internalOnly?: boolean;
  superAdminOnly?: boolean;
};

/** Single primary route per module for ⌘K — labels are canonical English for search. */
export function getCommandPaletteRoutesFromRegistry(): CommandPaletteRoute[] {
  return MODULE_REGISTRY_ENTRIES.map((e) => ({
    href: e.pathPrefixes[0]!,
    label: e.label,
    k: e.key.replace(/_/g, ""),
    internalOnly: e.internalOnly,
    superAdminOnly: e.superAdminOnly,
  }));
}
