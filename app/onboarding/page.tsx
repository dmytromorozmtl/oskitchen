import { ensureAppUser, requireSessionUser } from "@/lib/auth";
import { defaultOperatingModelForBusinessType } from "@/lib/onboarding/onboarding-business-modes";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";
import { prisma } from "@/lib/prisma";
import {
  flowForUser,
  parseOnboardingAdaptive,
  resolveInitialWizardStepIndex,
} from "@/services/onboarding/onboarding-service";

export default async function OnboardingPage() {
  const sessionUser = await requireSessionUser();
  if (sessionUser.email) {
    await ensureAppUser(sessionUser.id, sessionUser.email);
  }

  const [profile, settings] = await Promise.all([
    prisma.userProfile.findUnique({ where: { id: sessionUser.id } }),
    prisma.kitchenSettings.findUnique({ where: { userId: sessionUser.id } }),
  ]);

  if (profile?.onboardingCompleted) {
    return null;
  }

  const adaptive = parseOnboardingAdaptive(settings?.onboardingAdaptiveJson ?? null);
  const flow = flowForUser({
    businessType: settings?.businessType ?? null,
    onboardingAdaptiveJson: settings?.onboardingAdaptiveJson ?? null,
  });
  const initialStepIndex = resolveInitialWizardStepIndex({
    onboardingStep: profile?.onboardingStep ?? 0,
    onboardingCompleted: profile?.onboardingCompleted ?? false,
    businessName: settings?.businessName,
    adaptive,
    stepIds: flow.stepIds,
  });
  const initialOperatingModel =
    adaptive?.operatingModel ?? defaultOperatingModelForBusinessType(settings?.businessType ?? null);

  return (
    <OnboardingWizard
      flow={flow}
      initialStepIndex={initialStepIndex}
      initialOperatingModel={initialOperatingModel}
      defaults={{
        businessName: settings?.businessName ?? profile?.companyName ?? "",
        businessType: settings?.businessType ?? null,
        country: settings?.country ?? "",
        timezone: settings?.timezone ?? "UTC",
        currency: settings?.currency ?? "USD",
        locale: settings?.locale === "fr" ? "fr" : "en",
        pickupAddress: settings?.pickupAddress ?? "",
        deliveryEnabled: settings?.deliveryEnabled ?? false,
        deliveryRadiusKm:
          settings?.deliveryRadiusKm != null ? String(settings.deliveryRadiusKm) : "",
        orderCutoffTime: settings?.orderCutoffTime ?? "",
        pickupWindows: settings?.pickupWindows ?? "",
        kitchenWorkflowDefault: settings?.kitchenWorkflowDefault ?? "",
        locationsCount: adaptive?.locationsCount ?? 1,
        brandsCount: adaptive?.brandsCount ?? 0,
      }}
    />
  );
}
