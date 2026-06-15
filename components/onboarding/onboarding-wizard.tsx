"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { onboardingSkipStepGeneric, onboardingSkipToDashboard } from "@/actions/onboarding";
import { getActionError } from "@/lib/action-result";
import { OnboardingStepContent } from "@/components/onboarding/onboarding-wizard/step-content";
import { OnboardingStepIndicator } from "@/components/onboarding/onboarding-wizard/step-indicator";
import { OnboardingStepNavigation } from "@/components/onboarding/onboarding-wizard/step-navigation";
import type { OnboardingWizardProps } from "@/components/onboarding/onboarding-wizard/onboarding-wizard-types";
import { COMMERCIAL_LAUNCH_STEPS, commercialLaunchProgress } from "@/lib/onboarding/commercial-launch-steps";
import { buildOnboardingFlow } from "@/lib/onboarding/onboarding-flow-builder";
import { defaultOperatingModelForBusinessType } from "@/lib/onboarding/onboarding-business-modes";
import type { OnboardingStepId, OperatingModelId } from "@/lib/onboarding/onboarding-types";
import { defaultWorkflowForBusinessType } from "@/lib/business-workflows";

export type { OnboardingWizardProps } from "@/components/onboarding/onboarding-wizard/onboarding-wizard-types";

export function OnboardingWizard({
  flow: _flow,
  initialStepIndex,
  defaults,
  initialOperatingModel,
}: OnboardingWizardProps) {
  const router = useRouter();
  const [flowBusinessType, setFlowBusinessType] = React.useState(defaults.businessType);
  const [flowOperatingModel, setFlowOperatingModel] = React.useState<OperatingModelId | null>(
    initialOperatingModel,
  );
  const liveFlow = React.useMemo(
    () =>
      buildOnboardingFlow({
        businessType: flowBusinessType,
        operatingModel: flowOperatingModel,
      }),
    [flowBusinessType, flowOperatingModel],
  );
  const [stepIndex, setStepIndex] = React.useState(() =>
    Math.min(Math.max(initialStepIndex, 0), liveFlow.stepIds.length - 1),
  );
  const [menuId, setMenuId] = React.useState<string | null>(null);
  const [pending, setPending] = React.useState(false);
  const [browserTz, setBrowserTz] = React.useState<string | null>(null);

  React.useEffect(() => {
    try {
      setBrowserTz(Intl.DateTimeFormat().resolvedOptions().timeZone);
    } catch {
      setBrowserTz(null);
    }
  }, []);

  React.useEffect(() => {
    setStepIndex((prev) => {
      const clamped = Math.min(Math.max(initialStepIndex, 0), liveFlow.stepIds.length - 1);
      return Math.max(prev, clamped);
    });
  }, [initialStepIndex, liveFlow.stepIds.length]);

  const flowStepKey = liveFlow.stepIds.join("|");
  React.useEffect(() => {
    setStepIndex((prev) => {
      const currentId = liveFlow.stepIds[prev];
      if (!currentId) return prev;
      const mapped = liveFlow.stepIds.indexOf(currentId);
      return mapped >= 0 ? mapped : prev;
    });
  }, [flowStepKey, liveFlow.stepIds]);

  const currentStepId = liveFlow.stepIds[stepIndex] ?? "welcome";
  const launchProgress = commercialLaunchProgress(Math.min(stepIndex + 1, COMMERCIAL_LAUNCH_STEPS.length));
  const workflowDefault =
    defaults.kitchenWorkflowDefault?.trim() ||
    defaultWorkflowForBusinessType(defaults.businessType ?? undefined);
  const resolvedOperatingDefault =
    initialOperatingModel ?? defaultOperatingModelForBusinessType(defaults.businessType ?? undefined);

  function appendHidden(fd: FormData) {
    fd.set("currentStepId", currentStepId);
  }

  async function run<T>(
    fn: () => Promise<{ ok?: boolean; error?: string; menuId?: string; redirectTo?: string } & T>,
    advanceLocal: boolean,
    successMessage = "Saved",
    options?: { advanceTimeoutMs?: number },
  ) {
    setPending(true);
    try {
      const action = fn();
      const r = options?.advanceTimeoutMs
        ? await Promise.race([
            action,
            new Promise<{ ok: true }>((resolve) =>
              setTimeout(() => resolve({ ok: true }), options.advanceTimeoutMs),
            ),
          ])
        : await action;
      if ("error" in r && r.error) {
        toast.error(getActionError(r) ?? "Something went wrong");
        return;
      }
      if ("menuId" in r && r.menuId) setMenuId(r.menuId);
      if ("redirectTo" in r && r.redirectTo) {
        router.push(r.redirectTo);
        return;
      }
      toast.success(successMessage);
      if (advanceLocal) {
        setPending(false);
        setStepIndex((prev) => Math.min(prev + 1, liveFlow.stepIds.length - 1));
      }
    } finally {
      setPending(false);
    }
  }

  function handleSkip(stepId: OnboardingStepId) {
    const fd = new FormData();
    fd.set("currentStepId", stepId);
    void run(() => onboardingSkipStepGeneric(fd), true, "Skipped");
  }

  function handleSkipOnboarding() {
    if (!window.confirm("Skip all onboarding? You can configure everything later in Settings.")) {
      return;
    }
    setPending(true);
    void (async () => {
      try {
        const r = await onboardingSkipToDashboard();
        const err = getActionError(r);
        if (err) toast.error(err);
        else if (r?.redirectTo) router.push(r.redirectTo);
      } finally {
        setPending(false);
      }
    })();
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 pb-20 pt-2">
      <div className="text-center sm:text-left">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">Guided setup</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">OS Kitchen setup</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          We’ll configure your workspace based on how you operate — about 2–5 minutes. Everything saves automatically
          and can be changed later in Settings.
        </p>
      </div>

      <OnboardingStepIndicator
        steps={liveFlow.steps}
        currentStepIndex={stepIndex}
        launchProgressPercent={launchProgress}
        onStepClick={(index) => setStepIndex(index)}
      />

      <OnboardingStepNavigation
        stepIndex={stepIndex}
        pending={pending}
        onBack={() => setStepIndex((s) => Math.max(0, s - 1))}
      />

      <OnboardingStepContent
        currentStepId={currentStepId}
        pending={pending}
        defaults={defaults}
        browserTz={browserTz}
        menuId={menuId}
        workflowDefault={workflowDefault}
        resolvedOperatingDefault={resolvedOperatingDefault}
        flowBusinessType={flowBusinessType}
        setFlowBusinessType={setFlowBusinessType}
        setFlowOperatingModel={setFlowOperatingModel}
        appendHidden={appendHidden}
        run={run}
        handleSkip={handleSkip}
        router={router}
      />

      <p className="text-center text-xs text-muted-foreground">
        Need to leave?{" "}
        <button
          type="button"
          className="underline"
          disabled={pending}
          onClick={handleSkipOnboarding}
        >
          Skip onboarding
        </button>
      </p>
    </div>
  );
}
