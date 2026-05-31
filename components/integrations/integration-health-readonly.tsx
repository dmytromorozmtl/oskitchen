import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

import { IntegrationActionButton } from "@/components/integrations/integration-action-button";
import { SensitiveErrorPreview } from "@/components/integrations/sensitive-error-preview";
import { WebhookReplayRow } from "@/components/integrations/webhook-replay-row";
import { ChannelCard } from "@/components/channels/channel-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { maturityTierFromResolvedChannel } from "@/lib/integrations/integration-maturity-matrix";
import type { IntegrationMaturityTier } from "@/lib/integrations/integration-maturity-types";
import type { PlatformWorkspaceIntegrationHealthView } from "@/services/platform/platform-workspace-integration-health-service";

function tierBadge(tier: IntegrationMaturityTier) {
  const variant: Record<IntegrationMaturityTier, "default" | "secondary" | "destructive" | "outline"> = {
    LIVE: "default",
    BETA: "secondary",
    SETUP_READY: "secondary",
    PARTNER_ACCESS_REQUIRED: "outline",
    PARTIAL: "destructive",
    DEV_ONLY: "outline",
    ROADMAP: "outline",
    NOT_AVAILABLE: "outline",
  };
  return (
    <Badge variant={variant[tier]} className="rounded-full text-[10px] font-normal text-zinc-100">
      {tier.replace(/_/g, " ")}
    </Badge>
  );
}

type Props = {
  data: PlatformWorkspaceIntegrationHealthView;
  canReplay?: boolean;
};

/**
 * Read-only integration diagnostics for platform admins.
 * No credentials, webhook bodies, or workspace edit actions.
 */
export function IntegrationHealthReadonly({ data, canReplay = false }: Props) {
  const { workspaceId, workspaceName, supportTicketCount, demoMode, connectionCount, resolved, infra, unprocessedWebhooks, pendingWebhookCount } = data;

  return (
    <div className="space-y-6 text-zinc-200">
      <Card className="border-amber-500/40 bg-amber-500/10 text-zinc-100">
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-amber-50">Read-only platform diagnostics</CardTitle>
          <CardDescription className="text-amber-100/90">
            Credentials are never displayed. To edit settings or act as the workspace, start an audited support session
            if your role permits — this view is inspection only.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="flex flex-wrap gap-3 text-xs">
        <Link href="/platform/integrations" className="text-amber-200/90 hover:underline">
          ← Platform integrations
        </Link>
        <Link href={`/platform/workspaces/${workspaceId}`} className="text-amber-200/90 hover:underline">
          Workspace summary
        </Link>
        <Link href="/platform/webhooks" className="text-amber-200/90 hover:underline">
          Webhook backlog
        </Link>
        <Link href="/platform/support" className="text-amber-200/90 hover:underline">
          Support inbox
        </Link>
        <Link href="/platform/error-recovery" className="text-amber-200/90 hover:underline">
          Error recovery
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-semibold text-white">Integration health · {workspaceName}</h1>
        <p className="mt-2 max-w-3xl text-sm text-zinc-400">
          Same maturity primitives as workspace Integration health — aggregated for the workspace owner profile.
          Demo mode: {demoMode ? "on" : "off"} · Connections: {connectionCount} · Open support tickets:{" "}
          {supportTicketCount}. Unprocessed webhooks (queue): {pendingWebhookCount}.
        </p>
      </div>

      {unprocessedWebhooks.length > 0 ? (
        <Card className="border-red-900/50 bg-red-950/30 text-zinc-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-red-100">Unprocessed webhooks (owner queue)</CardTitle>
            <CardDescription className="text-red-100/80">
              Sanitized metadata only — no payloads. Platform replay is available here when your role has repair
              permission, and every request is audited.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {unprocessedWebhooks.map((e) => (
              <div
                key={e.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-zinc-800 bg-zinc-950/80 px-3 py-2 text-xs text-zinc-300"
              >
                <span className="font-mono">
                  {e.provider} · {e.topic}
                </span>
                <span className="text-zinc-500">
                  {formatDistanceToNow(e.receivedAt, { addSuffix: true })} · sig {e.signatureValid ? "ok" : "invalid"}
                </span>
                <div className="w-full space-y-1">
                  {e.processingErrorPreview ? (
                    <SensitiveErrorPreview
                      text={e.processingErrorPreview}
                      redacted={e.processingErrorRedacted}
                      textClassName="text-[11px] text-red-200/90"
                    />
                  ) : null}
                  <div className="flex flex-wrap items-center gap-2">
                    {canReplay ? (
                      <WebhookReplayRow
                        webhookEventId={e.id}
                        signatureValid={e.signatureValid}
                        surface="platform"
                      />
                    ) : (
                      <span className="text-[11px] text-zinc-500">
                        Replay requires platform integrations repair permission.
                      </span>
                    )}
                    <IntegrationActionButton
                      provider={e.provider}
                      action="integration_retry"
                      context={{ isPlatform: true }}
                      variant="inline"
                    />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      <Card className="border-zinc-800 bg-zinc-900/40 text-zinc-100">
        <CardHeader>
          <CardTitle className="text-lg text-white">Infrastructure & payments (host)</CardTitle>
          <CardDescription className="text-zinc-400">
            Environment posture for the OS Kitchen deployment — not tenant secrets.
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-800 hover:bg-transparent">
                <TableHead className="text-zinc-400">Provider</TableHead>
                <TableHead className="text-zinc-400">Maturity</TableHead>
                <TableHead className="text-zinc-400">Auth</TableHead>
                <TableHead className="text-zinc-400">What works</TableHead>
                <TableHead className="text-zinc-400">Gaps</TableHead>
                <TableHead className="text-right text-zinc-400">Docs</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {infra.map((row) => (
                <TableRow key={row.id} className="border-zinc-800">
                  <TableCell className="font-medium text-zinc-100">{row.label}</TableCell>
                  <TableCell>{tierBadge(row.maturity)}</TableCell>
                  <TableCell className="max-w-[180px] text-xs text-zinc-400">{row.authState}</TableCell>
                  <TableCell className="max-w-[220px] text-xs text-zinc-300">{row.worksSummary}</TableCell>
                  <TableCell className="max-w-[240px] text-xs text-zinc-500">{row.gapsSummary}</TableCell>
                  <TableCell className="text-right">
                    <Link href={row.docsHref} className="text-amber-200/90 hover:underline text-xs">
                      Docs
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="border-zinc-800 bg-zinc-900/40 text-zinc-100">
        <CardHeader>
          <CardTitle className="text-lg text-white">Channel catalog × workspace owner</CardTitle>
          <CardDescription className="text-zinc-400">
            Maturity tier uses the same matrix as `/dashboard/integration-health`. Channel cards are read-only — no
            setup routes from platform.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {resolved.map((row) => (
              <div key={row.providerKey} className="[&_.text-foreground]:text-zinc-100">
                <ChannelCard row={row} mode="readOnly" />
              </div>
            ))}
          </div>
          <div className="overflow-x-auto rounded-xl border border-zinc-800">
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-800 hover:bg-transparent">
                  <TableHead className="text-zinc-400">Channel</TableHead>
                  <TableHead className="text-zinc-400">Maturity tier</TableHead>
                  <TableHead className="text-zinc-400">Runtime status</TableHead>
                  <TableHead className="text-zinc-400">Webhooks</TableHead>
                  <TableHead className="text-zinc-400">Mapping / orders</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {resolved.map((row) => (
                  <TableRow key={`m-${row.providerKey}`} className="border-zinc-800">
                    <TableCell className="font-medium text-zinc-100">{row.label}</TableCell>
                    <TableCell>{tierBadge(maturityTierFromResolvedChannel(row))}</TableCell>
                    <TableCell className="text-xs text-zinc-400">{row.effectiveStatus.replace(/_/g, " ")}</TableCell>
                    <TableCell className="text-xs text-zinc-400">
                      {row.supportsWebhooks ? "Supported where configured" : "—"}
                    </TableCell>
                    <TableCell className="text-xs text-zinc-400">
                      {row.supportsOrderImport ? "Order import" : "—"}
                      {row.supportsProductSync ? " · Product sync" : ""}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
