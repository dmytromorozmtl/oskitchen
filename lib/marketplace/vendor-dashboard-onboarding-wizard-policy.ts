import type { VendorConnectStatus } from "@/lib/marketplace/stripe-connect-config";
import { resolveVendorConnectStatus } from "@/lib/marketplace/stripe-connect-config";

/**
 * DES-20 — vendor dashboard onboarding wizard policy.
 *
 * @see components/marketplace/vendor-dashboard-onboarding-wizard.tsx
 * @see docs/vendor-registration-flow-design.md
 */

export const VENDOR_DASHBOARD_ONBOARDING_WIZARD_POLICY_ID =
  "vendor-dashboard-onboarding-wizard-des20-v1" as const;

export const VENDOR_ONBOARDING_WIZARD_TEST_ID = "vendor-onboarding-wizard" as const;
export const VENDOR_ONBOARDING_DISMISS_STORAGE_KEY = "vendor-onboarding-wizard-dismissed" as const;

export const VENDOR_ONBOARDING_WIZARD_MODULES = [
  "components/marketplace/vendor-dashboard-onboarding-wizard.tsx",
  "components/marketplace/vendor-dashboard-client.tsx",
  "services/marketplace/vendor-dashboard-service.ts",
] as const;

export type VendorOnboardingStepId = "profile" | "connect" | "catalog" | "first_order";

export type VendorOnboardingStepStatus = "complete" | "current" | "upcoming";

export type VendorOnboardingSnapshot = {
  vendorStatus: string;
  stripeAccountId: string | null;
  connectStatus?: VendorConnectStatus;
  connectReady: boolean;
  activeProductCount: number;
  pendingReviewProductCount: number;
  hasContactProfile: boolean;
  ordersTotal: number;
};

export type VendorOnboardingStep = {
  id: VendorOnboardingStepId;
  label: string;
  description: string;
  href: string;
  ctaLabel: string;
  status: VendorOnboardingStepStatus;
  complete: boolean;
};

export function resolveConnectStatusForSnapshot(
  snapshot: Pick<VendorOnboardingSnapshot, "stripeAccountId" | "connectStatus" | "connectReady">,
): VendorConnectStatus {
  if (snapshot.connectStatus) return snapshot.connectStatus;
  if (snapshot.connectReady && snapshot.stripeAccountId) return "ready";
  return resolveVendorConnectStatus({ stripeAccountId: snapshot.stripeAccountId });
}

export function isVendorProfileStepComplete(snapshot: VendorOnboardingSnapshot): boolean {
  return snapshot.hasContactProfile && snapshot.vendorStatus === "APPROVED";
}

export function isVendorConnectStepComplete(snapshot: VendorOnboardingSnapshot): boolean {
  const status = resolveConnectStatusForSnapshot(snapshot);
  return snapshot.connectReady || status === "ready";
}

export function isVendorCatalogStepComplete(snapshot: VendorOnboardingSnapshot): boolean {
  return snapshot.activeProductCount > 0 || snapshot.pendingReviewProductCount > 0;
}

export function isVendorFirstOrderStepComplete(snapshot: VendorOnboardingSnapshot): boolean {
  return snapshot.ordersTotal > 0;
}

export function buildVendorOnboardingSteps(
  snapshot: VendorOnboardingSnapshot,
): VendorOnboardingStep[] {
  const profileComplete = isVendorProfileStepComplete(snapshot);
  const connectComplete = isVendorConnectStepComplete(snapshot);
  const catalogComplete = isVendorCatalogStepComplete(snapshot);
  const firstOrderComplete = isVendorFirstOrderStepComplete(snapshot);

  const connectStatus = resolveConnectStatusForSnapshot(snapshot);
  const connectDescription =
    connectStatus === "disabled"
      ? "Stripe Connect is disabled in this environment — link account when enabled."
      : connectStatus === "ready"
        ? "Payout account verified — you can receive marketplace settlements."
        : connectStatus === "pending_verification"
          ? "Stripe is verifying your payout account — check Finance for status."
          : "Link Stripe Connect so buyer payments can settle to your bank.";

  const raw: Omit<VendorOnboardingStep, "status">[] = [
    {
      id: "profile",
      label: "Profile",
      description: profileComplete
        ? "Company profile and contact details are on file."
        : "Add contact email and phone under Settings so buyers can reach you.",
      href: "/vendor/settings",
      ctaLabel: "Open settings",
      complete: profileComplete,
    },
    {
      id: "connect",
      label: "Payouts",
      description: connectDescription,
      href: "/vendor/finance",
      ctaLabel: connectStatus === "pending_verification" ? "Check Connect status" : "Set up payouts",
      complete: connectComplete,
    },
    {
      id: "catalog",
      label: "Catalog",
      description: catalogComplete
        ? `${snapshot.activeProductCount} live · ${snapshot.pendingReviewProductCount} in review`
        : "Create and submit your first SKU for platform review.",
      href: "/vendor/products/new",
      ctaLabel: catalogComplete ? "Manage products" : "Add first product",
      complete: catalogComplete,
    },
    {
      id: "first_order",
      label: "First order",
      description: firstOrderComplete
        ? `${snapshot.ordersTotal} marketplace order${snapshot.ordersTotal === 1 ? "" : "s"} received`
        : "When a restaurant checks out, confirm and fulfill from Orders.",
      href: "/vendor/orders",
      ctaLabel: firstOrderComplete ? "View orders" : "Go to orders",
      complete: firstOrderComplete,
    },
  ];

  const firstIncompleteIndex = raw.findIndex((step) => !step.complete);

  return raw.map((step, index) => {
    let status: VendorOnboardingStepStatus = "upcoming";
    if (step.complete) status = "complete";
    else if (index === firstIncompleteIndex) status = "current";
    return { ...step, status };
  });
}

export function summarizeVendorOnboarding(
  snapshot: VendorOnboardingSnapshot,
): {
  steps: VendorOnboardingStep[];
  completedCount: number;
  totalSteps: number;
  progressPercent: number;
  allComplete: boolean;
  currentStep: VendorOnboardingStep | null;
} {
  const steps = buildVendorOnboardingSteps(snapshot);
  const completedCount = steps.filter((step) => step.complete).length;
  const totalSteps = steps.length;
  const progressPercent =
    totalSteps === 0 ? 100 : Math.round((completedCount / totalSteps) * 100);
  const currentStep = steps.find((step) => step.status === "current") ?? null;

  return {
    steps,
    completedCount,
    totalSteps,
    progressPercent,
    allComplete: completedCount === totalSteps,
    currentStep,
  };
}

export function shouldShowVendorOnboardingWizard(
  snapshot: VendorOnboardingSnapshot,
  options: { dismissed?: boolean } = {},
): boolean {
  if (options.dismissed) return false;
  return !summarizeVendorOnboarding(snapshot).allComplete;
}
