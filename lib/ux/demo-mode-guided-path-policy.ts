/**
 * Blueprint P1-28 — demo mode guided path: Today → Quick Start → Invoice Scanner → Marketplace → KDS.
 */

export const DEMO_MODE_GUIDED_PATH_POLICY_ID = "demo-mode-guided-path-p1-28-v1" as const;

export const DEMO_MODE_GUIDED_PATH_STORAGE_KEY = "kitchenos_demo_guided_path_v1" as const;

export type DemoModeGuidedPathStepId =
  | "today"
  | "quick_start"
  | "invoice_scanner"
  | "marketplace"
  | "kds";

export type DemoModeGuidedPathStep = {
  id: DemoModeGuidedPathStepId;
  title: string;
  description: string;
  href: string;
  routePrefix: string;
};

export const DEMO_MODE_GUIDED_PATH_STEPS: readonly DemoModeGuidedPathStep[] = [
  {
    id: "today",
    title: "Today",
    description: "Start on your operator home — orders, playbooks, and daily priorities.",
    href: "/dashboard/today",
    routePrefix: "/dashboard/today",
  },
  {
    id: "quick_start",
    title: "Quick Start",
    description: "15-minute setup wizard — profile, menu, and first order with confetti.",
    href: "/dashboard/quick-start",
    routePrefix: "/dashboard/quick-start",
  },
  {
    id: "invoice_scanner",
    title: "Invoice Scanner",
    description: "Scan a supplier invoice — AI extracts line items and updates inventory.",
    href: "/dashboard/inventory/invoice-scanner",
    routePrefix: "/dashboard/inventory/invoice-scanner",
  },
  {
    id: "marketplace",
    title: "Marketplace",
    description: "Browse HoReCa suppliers, build a cart, and create purchase orders.",
    href: "/dashboard/marketplace",
    routePrefix: "/dashboard/marketplace",
  },
  {
    id: "kds",
    title: "Kitchen (KDS)",
    description: "Bump tickets on the kitchen display — prep line to expo handoff.",
    href: "/dashboard/kitchen",
    routePrefix: "/dashboard/kitchen",
  },
] as const;

export const DEMO_MODE_GUIDED_PATH_MODULE = "components/dashboard/demo-mode-guided-path.tsx" as const;

export const DEMO_MODE_GUIDED_PATH_CI_SCRIPTS = ["test:ci:demo-mode-guided-path"] as const;

export function resolveDemoModeGuidedPathStepFromPathname(
  pathname: string,
): DemoModeGuidedPathStepId | null {
  const normalized = pathname.split("?")[0]?.replace(/\/$/, "") || "/dashboard/today";
  for (const step of [...DEMO_MODE_GUIDED_PATH_STEPS].reverse()) {
    if (
      normalized === step.routePrefix ||
      normalized.startsWith(`${step.routePrefix}/`)
    ) {
      return step.id;
    }
  }
  return null;
}

export function pickDemoModeGuidedPathNextStep(
  completedStepIds: readonly DemoModeGuidedPathStepId[],
): DemoModeGuidedPathStep | null {
  const completed = new Set(completedStepIds);
  return DEMO_MODE_GUIDED_PATH_STEPS.find((step) => !completed.has(step.id)) ?? null;
}

export function isDemoModeGuidedPathComplete(
  completedStepIds: readonly DemoModeGuidedPathStepId[],
): boolean {
  const completed = new Set(completedStepIds);
  return DEMO_MODE_GUIDED_PATH_STEPS.every((step) => completed.has(step.id));
}
