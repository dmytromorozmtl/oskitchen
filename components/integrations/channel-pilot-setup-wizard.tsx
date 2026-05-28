"use client";

import * as React from "react";
import Link from "next/link";
import { CheckCircle2, Circle } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ConnectionCertificationRecord } from "@/lib/integrations/channel-certification-types";
import {
  evaluateChannelPilotSetupProgress,
  stepsForProvider,
  type ChannelPilotProvider,
} from "@/lib/integrations/channel-pilot-setup-wizard-steps";

type ChannelPilotSetupWizardProps = {
  provider: ChannelPilotProvider;
  hasConnection: boolean;
  hasCredentials: boolean;
  hasWebhookSecret: boolean;
  hasStoreIdentity: boolean;
  certification: ConnectionCertificationRecord | null;
  webhookUrl?: string | null;
};

export function ChannelPilotSetupWizard({
  provider,
  hasConnection,
  hasCredentials,
  hasWebhookSecret,
  hasStoreIdentity,
  certification,
  webhookUrl,
}: ChannelPilotSetupWizardProps) {
  const progress = evaluateChannelPilotSetupProgress({
    provider,
    hasConnection,
    hasCredentials,
    hasWebhookSecret,
    hasStoreIdentity,
    certification,
  });

  const stepDefs = stepsForProvider(provider);

  async function copyWebhookUrl() {
    if (!webhookUrl) {
      toast.error("Save credentials first to generate a webhook URL.");
      return;
    }
    try {
      await navigator.clipboard.writeText(webhookUrl);
      toast.success("Webhook URL copied");
    } catch {
      toast.error("Could not copy — select the URL manually.");
    }
  }

  return (
    <Card
      className="border-primary/20 bg-primary/5"
      data-testid="channel-pilot-setup-wizard"
    >
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle className="text-base">Pilot setup wizard</CardTitle>
          <Badge variant="secondary" className="rounded-full">
            {progress.completedCount}/{progress.totalCount} steps
          </Badge>
          {progress.pilotReady ? (
            <Badge className="rounded-full">Pilot path complete</Badge>
          ) : null}
        </div>
        <CardDescription>
          Streamlined 5-step path for qualified test shops — replaces scattered checklist hops.
          Not full marketplace live ops.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <ol className="space-y-2">
          {stepDefs.map((def) => {
            const status = progress.steps.find((s) => s.id === def.id);
            const complete = status?.complete ?? false;
            const isCurrent = progress.currentStepId === def.id;
            return (
              <li
                key={def.id}
                className={`flex gap-3 rounded-lg border px-3 py-2 text-sm ${
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
                  <div className="mt-2 flex flex-wrap gap-2">
                    {def.id === "configure_webhooks" && webhookUrl ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="rounded-full"
                        onClick={() => void copyWebhookUrl()}
                      >
                        Copy webhook URL
                      </Button>
                    ) : null}
                    {def.actionHref ? (
                      <Button asChild size="sm" variant="outline" className="rounded-full">
                        <Link href={def.actionHref}>{def.actionLabel}</Link>
                      </Button>
                    ) : null}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
        <p className="text-xs text-muted-foreground">
          Full playbook:{" "}
          <Link href="/dashboard/sales-channels" className="text-primary hover:underline">
            Sales channels
          </Link>{" "}
          · Operator doc in repo:{" "}
          <code className="text-xs">docs/channel-pilot-playbook-era17.md</code>
        </p>
      </CardContent>
    </Card>
  );
}
