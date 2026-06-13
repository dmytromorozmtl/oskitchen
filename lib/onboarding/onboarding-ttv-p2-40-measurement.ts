import {
  ONBOARDING_TTV_P2_40_LIFECYCLE_EVENT,
  ONBOARDING_TTV_P2_40_TARGET_MINUTES,
} from "@/lib/onboarding/onboarding-ttv-p2-40-policy";

export type OnboardingTtvStatus =
  | "pending_on_track"
  | "pending_overdue"
  | "met_target"
  | "missed_target";

export type OnboardingTtvMeasurement = {
  signupAt: string;
  firstOrderAt: string | null;
  ttvMinutes: number | null;
  elapsedMinutesSinceSignup: number;
  targetMinutes: number;
  metTarget: boolean | null;
  status: OnboardingTtvStatus;
  remainingMinutes: number | null;
};

export function computeOnboardingTtvMinutes(signupAt: Date, firstOrderAt: Date): number {
  return Math.max(0, Math.round((firstOrderAt.getTime() - signupAt.getTime()) / 60_000));
}

export function computeElapsedMinutesSinceSignup(signupAt: Date, now = new Date()): number {
  return Math.max(0, Math.round((now.getTime() - signupAt.getTime()) / 60_000));
}

export function evaluateOnboardingTtvStatus(input: {
  signupAt: Date;
  firstOrderAt: Date | null;
  now?: Date;
  targetMinutes?: number;
}): OnboardingTtvMeasurement {
  const now = input.now ?? new Date();
  const targetMinutes = input.targetMinutes ?? ONBOARDING_TTV_P2_40_TARGET_MINUTES;
  const elapsedMinutesSinceSignup = computeElapsedMinutesSinceSignup(input.signupAt, now);

  if (!input.firstOrderAt) {
    const status: OnboardingTtvStatus =
      elapsedMinutesSinceSignup > targetMinutes ? "pending_overdue" : "pending_on_track";
    return {
      signupAt: input.signupAt.toISOString(),
      firstOrderAt: null,
      ttvMinutes: null,
      elapsedMinutesSinceSignup,
      targetMinutes,
      metTarget: null,
      status,
      remainingMinutes: Math.max(0, targetMinutes - elapsedMinutesSinceSignup),
    };
  }

  const ttvMinutes = computeOnboardingTtvMinutes(input.signupAt, input.firstOrderAt);
  const metTarget = ttvMinutes <= targetMinutes;

  return {
    signupAt: input.signupAt.toISOString(),
    firstOrderAt: input.firstOrderAt.toISOString(),
    ttvMinutes,
    elapsedMinutesSinceSignup,
    targetMinutes,
    metTarget,
    status: metTarget ? "met_target" : "missed_target",
    remainingMinutes: null,
  };
}

export function formatOnboardingTtvHeadline(measurement: OnboardingTtvMeasurement): string {
  switch (measurement.status) {
    case "met_target":
      return `First order in ${measurement.ttvMinutes} min — under ${measurement.targetMinutes} min target`;
    case "missed_target":
      return `First order in ${measurement.ttvMinutes} min — over ${measurement.targetMinutes} min target`;
    case "pending_on_track":
      return `${measurement.remainingMinutes ?? 0} min left to hit ${measurement.targetMinutes}-min first-order target`;
    case "pending_overdue":
      return `Past ${measurement.targetMinutes}-min target — create first order to finish onboarding TTV`;
    default:
      return "Onboarding time-to-value";
  }
}

export type OnboardingTtvLifecycleMetadata = {
  ttvMinutes: number;
  targetMinutes: number;
  metTarget: boolean;
  signupAt: string;
  firstOrderAt: string;
  policyId: string;
};

export function buildOnboardingTtvLifecycleMetadata(input: {
  signupAt: Date;
  firstOrderAt: Date;
  policyId: string;
}): OnboardingTtvLifecycleMetadata {
  const ttvMinutes = computeOnboardingTtvMinutes(input.signupAt, input.firstOrderAt);
  const targetMinutes = ONBOARDING_TTV_P2_40_TARGET_MINUTES;
  return {
    ttvMinutes,
    targetMinutes,
    metTarget: ttvMinutes <= targetMinutes,
    signupAt: input.signupAt.toISOString(),
    firstOrderAt: input.firstOrderAt.toISOString(),
    policyId: input.policyId,
  };
}

export { ONBOARDING_TTV_P2_40_LIFECYCLE_EVENT, ONBOARDING_TTV_P2_40_TARGET_MINUTES };
