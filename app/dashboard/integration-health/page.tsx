import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

import { IntegrationActionButton } from "@/components/integrations/integration-action-button";
import { ChannelLiveProofStatusPanel } from "@/components/dashboard/channel-live-proof-status-panel";
import { IntegrationHealthP0TrustBannerPanel } from "@/components/dashboard/integration-health-p0-trust-banner";
import { IntegrationHealthCommercialInflectionBannerPanel } from "@/components/dashboard/integration-health-commercial-inflection-banner";
import { IntegrationHealthTier2GoldenPathBannerPanel } from "@/components/dashboard/integration-health-tier2-golden-path-banner";
import { IntegrationHealthPilotWeek1BannerPanel } from "@/components/dashboard/integration-health-pilot-week1-banner";
import { IntegrationHealthChannelCardsPanel } from "@/components/dashboard/integration-health-channel-cards-panel";
import { IntegrationHealthSmokeArtifactViewer } from "@/components/dashboard/integration-health-smoke-artifact-viewer";
import { IntegrationHealthAttentionStrip } from "@/components/dashboard/integration-health-attention-strip";
import { SensitiveErrorPreview } from "@/components/integrations/sensitive-error-preview";
import { CapabilityMatrixPanel } from "@/components/capabilities/capability-matrix-panel";
import { ChannelCard } from "@/components/channels/channel-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PermissionDeniedSurfaceCard } from "@/components/dashboard/permission-denied-surface-card";
import { hasIntegrationHealthPageAccess } from "@/lib/ux/permission-denied-page-access-era19";
import { getCachedWebhookEventListWhere } from "@/lib/scope/cached-workspace-resource-scope";
import { integrationConnectionListWhereForOwner } from "@/lib/scope/workspace-resource-scope";
import { resolveAllChannels } from "@/lib/channels/channel-runtime";
import { getServerEnv } from "@/lib/env";
import {
  infrastructureMaturityRows,
  maturityTierFromResolvedChannel,
} from "@/lib/integrations/integration-maturity-matrix";
import {
  buildIntegrationHealthFocusSnapshot,
  resolveIntegrationHealthRowNextAction,
} from "@/lib/integrations/integration-health-focus-era18";
import {
  liveProofSliceForProvider,
  mergeLiveProofIntoIntegrationHealthSnapshot,
  resolveIntegrationHealthRowNextActionWithLiveProof,
} from "@/lib/integrations/integration-health-live-proof-focus-era18";
import type { IntegrationMaturityTier } from "@/lib/integrations/integration-maturity-types";
import { prisma } from "@/lib/prisma";
import { toSafeErrorPreview } from "@/lib/security/sensitive-redaction";
import { listCapabilities } from "@/services/capabilities/capability-service";
import {
  listChannelPilotLiveProofSlices,
  listIntegrationHealthCards,
  summarizeIntegrationHealth,
} from "@/services/developer/integration-health-service";
import { IntegrationHealthRecoveryFlowProofPanel } from "@/components/dashboard/integration-health/integration-health-recovery-flow-proof-panel";
import { DeviceStatusDashboardStrip } from "@/components/dashboard/integration-health/device-status-dashboard-strip";
import { HardwareDeviceFleetPanel } from "@/components/dashboard/integration-health/hardware-device-fleet-panel";
import { IntegrationHealthRecoveryPanel } from "@/components/dashboard/integration-health-recovery-panel";
import {
  buildIntegrationHealthRecoveryFlowProofSlice,
  deriveP0ChannelProofFromSmokeRows,
} from "@/lib/commercial/era20-integration-health-recovery-flow-proof-era20";
import { IntegrationHealthSupportAdminPanel } from "@/components/dashboard/integration-health-support-admin-panel";
import { IntegrationHealthSummaryPanel } from "@/components/integrations/integration-health-summary";
import { IntegrationHealthLiveDashboardSection } from "@/components/integrations/integration-health-live-dashboard-section";
import { buildIntegrationHealthRecoveryModel } from "@/lib/integrations/integration-health-recovery-era19";
import { loadIntegrationHealthChannelCardsModel } from "@/services/integrations/integration-health-channel-cards-service";
import { loadLiveIntegrationHealthDashboard } from "@/services/integrations/integration-health-live-service";
import { loadIntegrationHealthSmokeArtifactsModel } from "@/services/integrations/integration-health-smoke-artifacts-service";
import { loadIntegrationHealthSupportAdminModel } from "@/services/integrations/integration-health-support-admin-service";
import { loadHardwareDeviceFleetModel } from "@/services/integration-health/hardware-device-fleet-service";
import { requireWorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";

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
    <Badge variant={variant[tier]} className="rounded-full text-[10px] font-normal">
      {tier.replace(/_/g, " ")}
    </Badge>
  );
}

export default async function IntegrationHealthDashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ mode?: string }>;
}) {
  const actor = await requireWorkspacePermissionActor();
  if (!hasIntegrationHealthPageAccess(actor)) {
    return <PermissionDeniedSurfaceCard surfaceId="integration_health" />;
  }

  const { dataUserId } = actor;
  const resolvedSearchParams = (await searchParams) ?? {};
  const supportCompact = resolvedSearchParams.mode === "support";
  const env = getServerEnv();
  const webhookWhere = await getCachedWebhookEventListWhere();
  const [connections, kitchen, failedHooks, healthCards, liveProofSlices, smokeArtifacts, channelCards, supportAdmin, hardwareFleet, liveHealthDashboard] =
    await Promise.all([
    prisma.integrationConnection.findMany({
      where: await integrationConnectionListWhereForOwner(dataUserId),
      orderBy: { updatedAt: "desc" },
    }),
    prisma.kitchenSettings.findUnique({ where: { userId: dataUserId } }),
    prisma.webhookEvent.findMany({
      where: { AND: [webhookWhere, { processed: false }] },
      orderBy: { receivedAt: "desc" },
      take: 12,
      select: {
        id: true,
        provider: true,
        topic: true,
        receivedAt: true,
        signatureValid: true,
        processingError: true,
      },
    }),
    listIntegrationHealthCards(dataUserId),
    listChannelPilotLiveProofSlices(dataUserId),
    loadIntegrationHealthSmokeArtifactsModel(),
    loadIntegrationHealthChannelCardsModel(dataUserId),
    loadIntegrationHealthSupportAdminModel({
      dataUserId,
      sessionUserId: actor.sessionUserId,
      email: actor.email,
      workspaceRole: actor.workspaceRole,
      platformBypass: actor.platformBypass,
    }),
    loadHardwareDeviceFleetModel(dataUserId),
    loadLiveIntegrationHealthDashboard(dataUserId),
  ]);

  const workspaceDemo = kitchen?.demoMode ?? false;
  const stripeConfigured = Boolean(env.STRIPE_SECRET_KEY?.trim() && process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim());
  const emailConfigured = Boolean(env.RESEND_API_KEY?.trim() && env.RESEND_FROM_EMAIL?.trim());
  const healthSummary = summarizeIntegrationHealth(healthCards, { stripe: stripeConfigured, email: emailConfigured });
  const integrationFocusSnapshot = mergeLiveProofIntoIntegrationHealthSnapshot(
    buildIntegrationHealthFocusSnapshot({
      summary: healthSummary,
      cards: healthCards,
      failedWebhookCount: failedHooks.length,
    }),
    liveProofSlices,
  );
  const resolved = resolveAllChannels(connections, workspaceDemo);
  const infra = infrastructureMaturityRows(env);
  const capabilities = listCapabilities();
  const recoveryModel = buildIntegrationHealthRecoveryModel({
    channelCards,
    smokeArtifacts,
  });
  const integrationRecoveryFlowProof = buildIntegrationHealthRecoveryFlowProofSlice({
    p0ChannelProofPassed: deriveP0ChannelProofFromSmokeRows(smokeArtifacts.rows),
  });
  const ownerCompact =
    actor.workspaceRole === "OWNER" && !supportCompact && !supportAdmin.visible;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Integration health</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Honest maturity view for channels and infrastructure. Status never shows &quot;Connected&quot; unless
            credentials exist and runtime checks classify the channel as live — marketplace traffic still requires
            your own partner approvals and operational verification.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/product/integration-health-center">Product overview</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/dashboard/sales-channels">Sales channels</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/dashboard/sales-channels/webhooks">Webhooks</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/dashboard/sales-channels/health">Connection tests</Link>
          </Button>
        </div>
      </div>

      {ownerCompact ? (
        <p
          className="rounded-lg border border-border/70 bg-muted/30 px-3 py-2 text-sm text-muted-foreground"
          data-testid="integration-health-owner-compact-notice"
        >
          Owner view — channel readiness and recovery steps only. Platform support uses{" "}
          <Link href="/dashboard/integration-health?mode=support" className="text-primary underline-offset-4 hover:underline">
            support triage mode
          </Link>
          .
        </p>
      ) : null}

      <IntegrationHealthSupportAdminPanel model={supportAdmin} compact={supportCompact} />

      <IntegrationHealthSummaryPanel summary={healthSummary} />

      <IntegrationHealthLiveDashboardSection dashboard={liveHealthDashboard} />

      <DeviceStatusDashboardStrip />
      <HardwareDeviceFleetPanel model={hardwareFleet} />

      {channelCards.p0Trust ? (
        <IntegrationHealthP0TrustBannerPanel banner={channelCards.p0Trust} />
      ) : null}

      {channelCards.commercialInflection ? (
        <IntegrationHealthCommercialInflectionBannerPanel banner={channelCards.commercialInflection} />
      ) : null}

      {channelCards.tier2GoldenPath ? (
        <IntegrationHealthTier2GoldenPathBannerPanel banner={channelCards.tier2GoldenPath} />
      ) : null}

      {channelCards.pilotWeek1 ? (
        <IntegrationHealthPilotWeek1BannerPanel banner={channelCards.pilotWeek1} />
      ) : null}

      <IntegrationHealthChannelCardsPanel model={channelCards} />

      <IntegrationHealthRecoveryPanel model={recoveryModel} />

      {!ownerCompact ? (
        <>
          <IntegrationHealthRecoveryFlowProofPanel slice={integrationRecoveryFlowProof} />
          <IntegrationHealthAttentionStrip snapshot={integrationFocusSnapshot} />
          <IntegrationHealthSmokeArtifactViewer model={smokeArtifacts} />
          <ChannelLiveProofStatusPanel slices={liveProofSlices} />
          <CapabilityMatrixPanel rows={capabilities} title="Honest capability matrix" />
        </>
      ) : (
        <IntegrationHealthAttentionStrip snapshot={integrationFocusSnapshot} />
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Saved connections — last sync &amp; last error</CardTitle>
          <CardDescription>
            Operational truth from <span className="font-mono text-foreground">integration_connection</span> rows (same
            source as Developer → Integrations). Empty means no saved credentials yet.
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Provider</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last sync</TableHead>
                <TableHead>Webhook secret</TableHead>
                <TableHead>Last error</TableHead>
                <TableHead>Next action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {healthCards.map((c) => {
                const errPreview = c.lastError ? toSafeErrorPreview(c.lastError, 160) : null;
                const liveProofSlice = liveProofSliceForProvider(liveProofSlices, c.provider);
                const nextAction = liveProofSlice
                  ? resolveIntegrationHealthRowNextActionWithLiveProof(c, liveProofSlice)
                  : resolveIntegrationHealthRowNextAction(c);
                return (
                  <TableRow key={c.id}>
                    <TableCell className="font-mono text-xs">{c.provider}</TableCell>
                    <TableCell>{c.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{c.status}</Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {c.lastSyncAt ? formatDistanceToNow(c.lastSyncAt, { addSuffix: true }) : "—"}
                    </TableCell>
                    <TableCell className="text-xs">{c.hasWebhookSecret ? "configured" : "missing"}</TableCell>
                    <TableCell className="max-w-xs align-top">
                      {errPreview ? (
                        <SensitiveErrorPreview
                          text={errPreview.text === "—" ? null : errPreview.text}
                          redacted={errPreview.redacted}
                          textClassName="text-xs text-destructive"
                        />
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs">
                      {nextAction ? (
                        <Link
                          href={nextAction.href}
                          className={
                            nextAction.tone === "urgent"
                              ? "font-medium text-amber-800 underline-offset-2 hover:underline dark:text-amber-200"
                              : "font-medium text-primary underline-offset-2 hover:underline"
                          }
                        >
                          {nextAction.label}
                        </Link>
                      ) : (
                        <span className="text-muted-foreground">On track</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
              {!healthCards.length ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-sm text-muted-foreground">
                    No integration connections yet — add credentials from Sales channels or Developer → Integrations.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {failedHooks.length > 0 ? (
        <Card className="border-destructive/40 bg-destructive/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-destructive">Unprocessed or failed webhooks</CardTitle>
            <CardDescription>
              Failed deliveries are visible here — they are not hidden. Retry from{" "}
              <Link href="/dashboard/error-recovery" className="font-medium text-foreground underline">
                Error recovery
              </Link>{" "}
              when a server action exists for the event type.
            </CardDescription>
            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-muted-foreground">
              <IntegrationActionButton action="webhook_replay" variant="inline" />
              <IntegrationActionButton action="integration_retry" variant="inline" />
            </div>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {failedHooks.map((e) => {
              const preview = toSafeErrorPreview(e.processingError, 120);
              return (
              <div
                key={e.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/70 bg-background/80 px-3 py-2"
              >
                <span className="font-mono text-xs">
                  {e.provider} · {e.topic}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(e.receivedAt, { addSuffix: true })} · sig{" "}
                  {e.signatureValid ? "ok" : "invalid"}
                </span>
                <div className="w-full">
                  <SensitiveErrorPreview
                    text={preview.text === "—" ? null : preview.text}
                    redacted={preview.redacted}
                    textClassName="text-xs text-destructive"
                  />
                </div>
              </div>
            );
            })}
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Infrastructure & payments</CardTitle>
          <CardDescription>Keys and providers that power billing, email, maps, and AI — never show secret values.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Provider</TableHead>
                <TableHead>Maturity</TableHead>
                <TableHead>Auth</TableHead>
                <TableHead>What works</TableHead>
                <TableHead>What does not / gaps</TableHead>
                <TableHead className="text-right">Setup</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {infra.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">{row.label}</TableCell>
                  <TableCell>{tierBadge(row.maturity)}</TableCell>
                  <TableCell className="max-w-[180px] text-xs text-muted-foreground">{row.authState}</TableCell>
                  <TableCell className="max-w-[220px] text-xs">{row.worksSummary}</TableCell>
                  <TableCell className="max-w-[240px] text-xs text-muted-foreground">{row.gapsSummary}</TableCell>
                  <TableCell className="text-right">
                    <Button asChild size="sm" variant="secondary" className="rounded-full">
                      <Link href={row.setupHref}>Open</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Channel catalog × your workspace</CardTitle>
          <CardDescription>
            Each card shows effective status, capabilities, and next action. Maturity tier (product language) is
            derived separately — see table below the grid.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {resolved.map((row) => (
              <ChannelCard key={row.providerKey} row={row} />
            ))}
          </div>
          <div className="overflow-x-auto rounded-xl border border-border/70">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Channel</TableHead>
                  <TableHead>Maturity tier</TableHead>
                  <TableHead>Runtime status</TableHead>
                  <TableHead>Webhooks</TableHead>
                  <TableHead>Mapping / orders</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {resolved.map((row) => (
                  <TableRow key={`m-${row.providerKey}`}>
                    <TableCell className="font-medium">{row.label}</TableCell>
                    <TableCell>{tierBadge(maturityTierFromResolvedChannel(row))}</TableCell>
                    <TableCell className="text-xs">{row.effectiveStatus.replace(/_/g, " ")}</TableCell>
                    <TableCell className="text-xs">{row.supportsWebhooks ? "Supported where configured" : "—"}</TableCell>
                    <TableCell className="text-xs">
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
