/**
 * AC2 — Prefrontal organoid mesh: executive gating over AA2 hippocampal windows.
 */

import type { WetwareSynapse } from "@/lib/storefront/theme-experiment-wetware-calibration";
import { toJsonValue } from "@/lib/prisma/json";
import { readWetwareCalibration } from "@/lib/storefront/theme-experiment-wetware-calibration";
import {
  isHippocampalOrganoidMeshEnabled,
  readHippocampalOrganoidMesh,
} from "@/lib/storefront/theme-experiment-hippocampal-organoid-mesh";
import {
  isOrganoidWetwareEnabled,
  shouldUseOrganoidWetware,
} from "@/lib/storefront/theme-experiment-organoid-wetware";

export type ExecutiveGateDecision = "go" | "no_go" | "hold";

export type PrefrontalExecutiveGate = {
  gateId: string;
  armId: string;
  decision: ExecutiveGateDecision;
  inhibitionStrength: number;
  workingMemorySlots: number;
  hippocampalWindowId: string | null;
};

export type PrefrontalOrganoidMeshSnapshot = {
  at: string;
  gates: PrefrontalExecutiveGate[];
  executiveQuorum: number;
  prefrontalSynced: boolean;
  gatedSynapses: WetwareSynapse[];
  goRate: number;
};

export function isPrefrontalOrganoidMeshEnabled(): boolean {
  return process.env.THEME_EXPERIMENT_PREFRONTAL_ORGANOID_MESH === "1";
}

export function prefrontalWorkingMemorySlots(): number {
  return Number(process.env.THEME_EXPERIMENT_PREFRONTAL_WM_SLOTS ?? "3");
}

export function prefrontalMinGoGates(): number {
  return Number(process.env.THEME_EXPERIMENT_PREFRONTAL_MIN_GO_GATES ?? "2");
}

export function readPrefrontalOrganoidMesh(raw: unknown): PrefrontalOrganoidMeshSnapshot | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = (raw as Record<string, unknown>).prefrontalOrganoidMesh;
  if (!o || typeof o !== "object" || Array.isArray(o)) return null;
  const s = o as Record<string, unknown>;
  return {
    at: typeof s.at === "string" ? s.at : new Date().toISOString(),
    gates: Array.isArray(s.gates) ? (s.gates as PrefrontalExecutiveGate[]) : [],
    executiveQuorum: typeof s.executiveQuorum === "number" ? s.executiveQuorum : 0,
    prefrontalSynced: s.prefrontalSynced === true,
    gatedSynapses: Array.isArray(s.gatedSynapses) ? (s.gatedSynapses as WetwareSynapse[]) : [],
    goRate: typeof s.goRate === "number" ? s.goRate : 0,
  };
}

function executiveDecisionForArm(
  armId: string,
  synapse: WetwareSynapse | undefined,
  inhibitionBase: number,
): PrefrontalExecutiveGate {
  const plasticity = synapse?.plasticity ?? 1;
  const updates = synapse?.updates ?? 0;
  const inhibitionStrength = Math.min(1, inhibitionBase + (plasticity > 1.2 ? 0.1 : 0));
  let decision: ExecutiveGateDecision = "hold";
  if (updates >= 3 && plasticity >= 0.9 && inhibitionStrength < 0.85) {
    decision = "go";
  } else if (inhibitionStrength >= 0.9) {
    decision = "no_go";
  }
  return {
    gateId: `pfc-${armId}-${Date.now()}`,
    armId,
    decision,
    inhibitionStrength,
    workingMemorySlots: prefrontalWorkingMemorySlots(),
    hippocampalWindowId: null,
  };
}

function applyExecutiveGatingToSynapses(
  synapses: WetwareSynapse[],
  gates: PrefrontalExecutiveGate[],
): WetwareSynapse[] {
  const gateByArm = new Map(gates.map((g) => [g.armId, g]));
  return synapses.map((s) => {
    const gate = gateByArm.get(s.armId);
    if (!gate || gate.decision !== "go") {
      return {
        ...s,
        weight: Math.max(1, Math.round(s.weight * (1 - (gate?.inhibitionStrength ?? 0.3) * 0.2))),
      };
    }
    return {
      ...s,
      weight: Math.round(s.weight * (1 + (1 - gate.inhibitionStrength) * 0.08)),
      plasticity: Math.min(2, s.plasticity + 0.05),
    };
  });
}

export function mergePrefrontalOrganoidMesh(previousRaw: unknown): {
  json: Record<string, unknown>;
  snap: PrefrontalOrganoidMeshSnapshot;
} {
  const hippo = readHippocampalOrganoidMesh(previousRaw);
  const cal = readWetwareCalibration(previousRaw);
  const synapses = hippo?.boostedSynapses ?? cal?.synapses ?? [];
  const inhibitionBase = Number(process.env.THEME_EXPERIMENT_PREFRONTAL_INHIBITION ?? "0.35");

  const armIds = [...new Set(synapses.map((s) => s.armId))];
  const gates: PrefrontalExecutiveGate[] = armIds.map((armId) => {
    const syn = synapses.find((s) => s.armId === armId);
    const gate = executiveDecisionForArm(armId, syn, inhibitionBase);
    const win = hippo?.windows.find((w) => w.armId === armId);
    if (win) gate.hippocampalWindowId = win.windowId;
    return gate;
  });

  const goGates = gates.filter((g) => g.decision === "go");
  const gatedSynapses = applyExecutiveGatingToSynapses(synapses, gates);
  const prefrontalSynced =
    (hippo?.hippocampalSynced ?? false) && goGates.length >= prefrontalMinGoGates();

  const snap: PrefrontalOrganoidMeshSnapshot = {
    at: new Date().toISOString(),
    gates,
    executiveQuorum: goGates.length,
    prefrontalSynced,
    gatedSynapses,
    goRate: gates.length > 0 ? goGates.length / gates.length : 0,
  };

  const base =
    previousRaw && typeof previousRaw === "object" && !Array.isArray(previousRaw)
      ? { ...(previousRaw as Record<string, unknown>) }
      : {};
  base.prefrontalOrganoidMesh = snap;
  return { json: base, snap };
}

export function applyPrefrontalMeshToWetwareJson(previousRaw: unknown): Record<string, unknown> {
  const pfc = readPrefrontalOrganoidMesh(previousRaw);
  const cal = readWetwareCalibration(previousRaw);
  if (!pfc?.prefrontalSynced || !cal || pfc.gatedSynapses.length === 0) {
    return previousRaw && typeof previousRaw === "object" && !Array.isArray(previousRaw)
      ? { ...(previousRaw as Record<string, unknown>) }
      : {};
  }
  const base =
    previousRaw && typeof previousRaw === "object" && !Array.isArray(previousRaw)
      ? { ...(previousRaw as Record<string, unknown>) }
      : {};
  base.wetwareCalibration = {
    ...cal,
    synapses: pfc.gatedSynapses,
    at: new Date().toISOString(),
  };
  return base;
}

export function evaluatePrefrontalOrganoidMeshGate(raw: unknown): {
  passed: boolean;
  headline: string;
  detail: string;
} {
  if (!isPrefrontalOrganoidMeshEnabled()) {
    return { passed: true, headline: "Prefrontal organoid mesh off", detail: "" };
  }
  if (!isHippocampalOrganoidMeshEnabled()) {
    return {
      passed: false,
      headline: "Hippocampal organoid mesh required",
      detail: "Enable THEME_EXPERIMENT_HIPPOCAMPAL_ORGANOID_MESH=1 (AA2).",
    };
  }
  if (!isOrganoidWetwareEnabled()) {
    return {
      passed: false,
      headline: "Organoid wetware required",
      detail: "Enable THEME_EXPERIMENT_ORGANOID_WETWARE=1 (Y2).",
    };
  }
  if (!shouldUseOrganoidWetware(raw)) {
    return {
      passed: true,
      headline: "Prefrontal mesh standby",
      detail: "Activates with hippocampal organoid path.",
    };
  }
  const pfc = readPrefrontalOrganoidMesh(raw);
  if (!pfc || !pfc.prefrontalSynced) {
    return {
      passed: false,
      headline: "Executive gating not synced",
      detail: `Need ${prefrontalMinGoGates()} go gates over hippocampal windows.`,
    };
  }
  return {
    passed: true,
    headline: `Prefrontal mesh OK (${pfc.executiveQuorum} go gates)`,
    detail: `Go rate ${Math.round(pfc.goRate * 100)}% · WM slots ${prefrontalWorkingMemorySlots()}`,
  };
}
