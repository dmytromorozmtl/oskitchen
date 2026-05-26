import { toJsonValue } from "@/lib/prisma/json";
/**
 * R5 — Compositional UI experiments: slot-based (header/hero/CTA) + orthogonal factorial design.
 */

export type CompositionalSlot = "header" | "hero" | "cta" | "footer";

export type CompositionalVariant = {
  slot: CompositionalSlot;
  variantId: string;
  weight: number;
};

export type CompositionalExperimentSnapshot = {
  at: string;
  slots: CompositionalVariant[];
  factorialCells: number;
  orthogonal: boolean;
  assignedByVisitor: Record<string, Record<CompositionalSlot, string>>;
};

export const COMPOSITIONAL_SLOTS: CompositionalSlot[] = ["header", "hero", "cta", "footer"];

export function isCompositionalUiEnabled(): boolean {
  return process.env.THEME_EXPERIMENT_COMPOSITIONAL_UI === "1";
}

export function readCompositionalExperiment(raw: unknown): CompositionalExperimentSnapshot | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = (raw as Record<string, unknown>).compositionalExperiment;
  if (!o || typeof o !== "object" || Array.isArray(o)) return null;
  const c = o as Record<string, unknown>;
  if (!Array.isArray(c.slots)) return null;
  return {
    at: typeof c.at === "string" ? c.at : new Date().toISOString(),
    slots: c.slots as CompositionalVariant[],
    factorialCells: typeof c.factorialCells === "number" ? c.factorialCells : 0,
    orthogonal: c.orthogonal === true,
    assignedByVisitor:
      c.assignedByVisitor && typeof c.assignedByVisitor === "object" && !Array.isArray(c.assignedByVisitor)
        ? (c.assignedByVisitor as Record<string, Record<CompositionalSlot, string>>)
        : {},
  };
}

/** Build orthogonal factorial: each slot gets independent variant arms. */
export function buildOrthogonalFactorialSlots(input: {
  headerVariants: string[];
  heroVariants: string[];
  ctaVariants: string[];
  footerVariants?: string[];
}): CompositionalVariant[] {
  const slots: CompositionalVariant[] = [];
  const add = (slot: CompositionalSlot, variants: string[]) => {
    const w = Math.floor(100 / Math.max(1, variants.length));
    for (const variantId of variants) {
      slots.push({ slot, variantId, weight: w });
    }
  };
  add("header", input.headerVariants);
  add("hero", input.heroVariants);
  add("cta", input.ctaVariants);
  add("footer", input.footerVariants ?? ["default"]);
  return slots;
}

export function factorialCellCount(slots: CompositionalVariant[]): number {
  const bySlot = new Map<CompositionalSlot, Set<string>>();
  for (const s of slots) {
    const set = bySlot.get(s.slot) ?? new Set();
    set.add(s.variantId);
    bySlot.set(s.slot, set);
  }
  let cells = 1;
  for (const set of bySlot.values()) cells *= set.size;
  return cells;
}

function stableBucket(visitorId: string, salt: string): number {
  let h = 2166136261;
  const s = `${visitorId}:${salt}`;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) % 100;
}

/** Assign one variant per slot (orthogonal independence). */
export function assignCompositionalVariants(input: {
  visitorId: string;
  snapshot: CompositionalExperimentSnapshot;
}): Record<CompositionalSlot, string> {
  const out = {} as Record<CompositionalSlot, string>;
  for (const slot of COMPOSITIONAL_SLOTS) {
    const arms = input.snapshot.slots.filter((s) => s.slot === slot);
    if (arms.length === 0) {
      out[slot] = "default";
      continue;
    }
    const bucket = stableBucket(input.visitorId, `comp:${slot}`);
    let cum = 0;
    let picked = arms[0]!.variantId;
    for (const a of arms) {
      cum += a.weight;
      if (bucket < cum) {
        picked = a.variantId;
        break;
      }
    }
    out[slot] = picked;
  }
  return out;
}

export function seedCompositionalExperiment(input: {
  previousRaw: unknown;
  headerVariants: string[];
  heroVariants: string[];
  ctaVariants: string[];
}): Record<string, unknown> {
  const slots = buildOrthogonalFactorialSlots(input);
  const snap: CompositionalExperimentSnapshot = {
    at: new Date().toISOString(),
    slots,
    factorialCells: factorialCellCount(slots),
    orthogonal: true,
    assignedByVisitor: {},
  };
  return mergeCompositionalIntoJson(input.previousRaw, snap);
}

export function mergeCompositionalIntoJson(
  previousRaw: unknown,
  snap: CompositionalExperimentSnapshot,
): Record<string, unknown> {
  const base =
    previousRaw && typeof previousRaw === "object" && !Array.isArray(previousRaw)
      ? { ...(previousRaw as Record<string, unknown>) }
      : {};
  base.compositionalExperiment = snap;
  return base;
}

export function evaluateCompositionalPublishGate(raw: unknown): {
  passed: boolean;
  headline: string;
  detail: string;
} {
  if (!isCompositionalUiEnabled()) {
    return { passed: true, headline: "Compositional UI off", detail: "" };
  }
  const snap = readCompositionalExperiment(raw);
  if (!snap) {
    return { passed: true, headline: "No compositional experiment", detail: "" };
  }
  const minCells = Number(process.env.THEME_EXPERIMENT_COMPOSITIONAL_MIN_CELLS ?? "4");
  if (snap.factorialCells < minCells) {
    return {
      passed: false,
      headline: `Factorial underpowered (${snap.factorialCells} < ${minCells} cells)`,
      detail: "Add variants per slot for orthogonal design.",
    };
  }
  return {
    passed: true,
    headline: `Compositional OK (${snap.factorialCells} factorial cells)`,
    detail: snap.orthogonal ? "Orthogonal slot assignment active." : "Slots configured.",
  };
}
