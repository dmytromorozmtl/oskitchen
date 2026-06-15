import type { ThemeExperimentArm } from "@/lib/storefront/theme-experiment";
export type ExperimentArmDefinition = {
  id: string;
  presetId?: string;
  weight: number;
  label?: string;
};

export const DEFAULT_TWO_ARMS: ExperimentArmDefinition[] = [
  { id: "published", weight: 50, label: "Published (control)" },
  { id: "draft", weight: 50, label: "Draft (treatment)" },
];

export function readExperimentArms(raw: unknown): ExperimentArmDefinition[] {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return DEFAULT_TWO_ARMS;
  const list = (raw as Record<string, unknown>).experimentArms;
  if (!Array.isArray(list) || list.length < 2) return DEFAULT_TWO_ARMS;

  const parsed = list
    .map((item): ExperimentArmDefinition | null => {
      if (!item || typeof item !== "object" || Array.isArray(item)) return null;
      const o = item as Record<string, unknown>;
      const id = typeof o.id === "string" ? o.id.trim() : "";
      if (!id || id.length > 64) return null;
      const weight = typeof o.weight === "number" && o.weight >= 0 ? o.weight : 0;
      return {
        id,
        weight,
        presetId: typeof o.presetId === "string" ? o.presetId : undefined,
        label: typeof o.label === "string" ? o.label : undefined,
      };
    })
    .filter((a): a is ExperimentArmDefinition => a !== null);

  if (parsed.length < 2) return DEFAULT_TWO_ARMS;
  return parsed.slice(0, 8);
}

export function readAllocationMode(raw: unknown): "split" | "mab" {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return "split";
  const mode = (raw as Record<string, unknown>).allocationMode;
  return mode === "mab" ? "mab" : "split";
}

export function armWeightsRecord(arms: ExperimentArmDefinition[]): Record<string, number> {
  const total = arms.reduce((s, a) => s + a.weight, 0) || 1;
  return Object.fromEntries(arms.map((a) => [a.id, (a.weight / total) * 100]));
}

export function isKnownExperimentArm(arm: string, arms: ExperimentArmDefinition[]): boolean {
  return arms.some((a) => a.id === arm);
}

/** Map legacy 2-arm to ThemeExperimentArm when possible. */
export function asLegacyThemeArm(armId: string): ThemeExperimentArm | null {
  return armId === "published" || armId === "draft" ? armId : null;
}

export function presetIdForArm(arms: ExperimentArmDefinition[], armId: string): string | undefined {
  return arms.find((a) => a.id === armId)?.presetId;
}
