import type { LayoutPresetId } from "@/lib/storefront-builder/theme-types";

export type LayoutPresetDefinition = {
  id: LayoutPresetId;
  name: string;
  description: string;
};

export const STOREFRONT_LAYOUT_PRESETS: LayoutPresetDefinition[] = [
  { id: "default", name: "Default", description: "Balanced grid, standard spacing." },
  { id: "magazine", name: "Magazine", description: "Wide hero, asymmetric sections." },
  { id: "compact", name: "Compact", description: "Tighter vertical rhythm for dense menus." },
];

export function getLayoutPresetById(id: string | null | undefined): LayoutPresetDefinition | null {
  if (!id?.trim()) return null;
  return STOREFRONT_LAYOUT_PRESETS.find((p) => p.id === id) ?? null;
}
