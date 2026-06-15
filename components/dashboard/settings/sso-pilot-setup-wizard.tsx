"use client";

import Link from "next/link";
import { CheckCircle2, Circle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SsoPilotSetupAttentionStrip } from "@/components/dashboard/settings/sso-pilot-setup-attention-strip";
import { SsoPilotSetupStepNextAction } from "@/components/dashboard/settings/sso-pilot-setup-step-next-action";
import {
  buildSsoPilotSetupFocusSnapshot,
  shouldShowSsoPilotSetupAttentionStrip,
} from "@/lib/enterprise/enterprise-sso-pilot-setup-focus-era18";
import {
  SSO_PILOT_OPERATOR_RUNBOOK_DOC,
  SSO_PILOT_STAGING_SMOKE_PLAN_DOC,
} from "@/lib/enterprise/enterprise-sso-pilot-setup-focus-era18-policy";
import { buildSsoPilotLoginUrl } from "@/lib/enterprise/enterprise-sso-login-entry-focus-era18";
import type { WorkspaceSsoAdminView } from "@/lib/enterprise/workspace-sso-admin-service";
import {
  evaluateSsoPilotSetupProgress,
  SSO_PILOT_SETUP_STEPS,
} from "@/lib/enterprise/enterprise-sso-pilot-setup-wizard-steps";

export function SsoPilotSetupWizard(props: { view: WorkspaceSsoAdminView }) {
  const progress = evaluateSsoPilotSetupProgress(props.view);
  const setupFocus = buildSsoPilotSetupFocusSnapshot(progress);
  const showSetupAttentionStrip = shouldShowSsoPilotSetupAttentionStrip(setupFocus);

  return (
    <Card
      className="border-primary/20 bg-primary/5"
      data-testid="sso-pilot-setup-wizard"
    >
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle className="text-base">Pilot SSO setup wizard</CardTitle>
          <Badge variant="secondary" className="rounded-full">
            {progress.completedCount}/{progress.totalCount} steps
          </Badge>
          {progress.adminSetupComplete ? (
            <Badge variant="outline" className="rounded-full">
              Admin setup complete
            </Badge>
          ) : null}
        </div>
        <CardDescription>
          Four-step path for one pilot tenant — entitlement, IdP config, activation, then staging
          IdP login proof. Not production SSO for all customers.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {showSetupAttentionStrip ? (
          <SsoPilotSetupAttentionStrip
            focus={setupFocus}
            progress={progress}
            stepDefs={SSO_PILOT_SETUP_STEPS}
            workspaceId={props.view.workspaceId}
          />
        ) : null}
        <ol className="space-y-2">
          {SSO_PILOT_SETUP_STEPS.map((def) => {
            const status = progress.steps.find((step) => step.id === def.id);
            const complete = status?.complete ?? false;
            const isCurrent = progress.currentStepId === def.id;
            return (
              <li
                key={def.id}
                id={`sso-pilot-step-${def.id}`}
                className={`scroll-mt-24 flex gap-3 rounded-lg border px-3 py-2 text-sm ${
                  isCurrent ? "border-primary/40 bg-background" : "border-border/60"
                }`}
                data-step-id={def.id}
                data-step-complete={complete ? "true" : "false"}
              >
                {complete ? (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                ) : (
                  <Circle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{def.title}</p>
                  <p className="text-muted-foreground">{def.description}</p>
                  <div className="mt-1">
                    <SsoPilotSetupStepNextAction
                      def={def}
                      complete={complete}
                      isCurrent={isCurrent}
                      workspaceId={props.view.workspaceId}
                    />
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
        <p className="text-xs text-muted-foreground">
          Staging proof playbook:{" "}
          <code className="text-xs">{SSO_PILOT_STAGING_SMOKE_PLAN_DOC}</code> · Operator runbook:{" "}
          <code className="text-xs">{SSO_PILOT_OPERATOR_RUNBOOK_DOC}</code> · Staff login:{" "}
          <Link href={buildSsoPilotLoginUrl(props.view.workspaceId)} className="text-primary hover:underline">
            /login
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
