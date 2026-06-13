"use client";

import { useState } from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  LayoutDashboard,
  MonitorPlay,
  ShoppingBag,
  Store,
  UtensilsCrossed,
  XCircle,
} from "lucide-react";

import { DemoLaunchButton } from "@/components/demo/demo-launch-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  DEMO_PAGE_P1_29_DEFAULT_CHANNEL_ID,
  DEMO_PAGE_P1_29_DEFAULT_STOP_ID,
  DEMO_PAGE_P1_29_DISCLAIMER,
  DEMO_PAGE_P1_29_EYEBROW,
  DEMO_PAGE_P1_29_HEADLINE,
  DEMO_PAGE_P1_29_INTEGRATION_CHANNELS,
  DEMO_PAGE_P1_29_SUBLINE,
  DEMO_PAGE_P1_29_WORKSPACE_STOPS,
  type DemoSandboxChannelStatus,
  type DemoSandboxIntegrationChannel,
} from "@/lib/marketing/demo-page-p1-29-content";
import {
  DEMO_PAGE_P1_29_INTEGRATION_HEALTH_TEST_ID,
  DEMO_PAGE_P1_29_SANDBOX_TEST_ID,
} from "@/lib/marketing/demo-page-p1-29-policy";

const STOP_ICONS = {
  today: LayoutDashboard,
  orders: ShoppingBag,
  kitchen: UtensilsCrossed,
  pos: Store,
  "integration-health": Activity,
} as const;

const STATUS_CONFIG: Record<
  DemoSandboxChannelStatus,
  { Icon: typeof CheckCircle2; badge: string; row: string }
> = {
  PASS: {
    Icon: CheckCircle2,
    badge: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    row: "border-emerald-500/30 hover:border-emerald-500/50",
  },
  SKIPPED: {
    Icon: AlertTriangle,
    badge: "bg-muted text-muted-foreground",
    row: "border-border/70 hover:border-border",
  },
  FAILED: {
    Icon: XCircle,
    badge: "bg-red-500/10 text-red-700 dark:text-red-300",
    row: "border-red-500/40 hover:border-red-500/60",
  },
};

type Props = {
  className?: string;
};

/** Blueprint P1-29 — interactive sandbox workspace with clickable Integration Health. */
export function DemoInteractiveSandboxWorkspace({ className }: Props) {
  const [activeStop, setActiveStop] = useState(DEMO_PAGE_P1_29_DEFAULT_STOP_ID);
  const [selectedChannelId, setSelectedChannelId] = useState<string>(
    DEMO_PAGE_P1_29_DEFAULT_CHANNEL_ID,
  );

  const selectedChannel = DEMO_PAGE_P1_29_INTEGRATION_CHANNELS.find(
    (c) => c.id === selectedChannelId,
  );
  const activeStopMeta = DEMO_PAGE_P1_29_WORKSPACE_STOPS.find((s) => s.id === activeStop);

  return (
    <section
      className={cn("space-y-8", className)}
      aria-labelledby="demo-sandbox-workspace-heading"
      data-testid={DEMO_PAGE_P1_29_SANDBOX_TEST_ID}
    >
      <div className="mx-auto max-w-3xl space-y-4 text-center">
        <Badge variant="secondary" className="rounded-full">
          {DEMO_PAGE_P1_29_EYEBROW}
        </Badge>
        <h2
          id="demo-sandbox-workspace-heading"
          className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl"
        >
          {DEMO_PAGE_P1_29_HEADLINE}
        </h2>
        <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
          {DEMO_PAGE_P1_29_SUBLINE}
        </p>
      </div>

      <Card className="overflow-hidden border-border/80 bg-card/95 shadow-lg">
        <div className="grid lg:grid-cols-[220px_1fr]">
          <nav
            className="border-b border-border/70 bg-muted/30 p-3 lg:border-b-0 lg:border-r"
            aria-label="Sandbox workspace navigation"
          >
            <p className="mb-3 px-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Workspace
            </p>
            <ul className="space-y-1">
              {DEMO_PAGE_P1_29_WORKSPACE_STOPS.map((stop) => {
                const Icon = STOP_ICONS[stop.id as keyof typeof STOP_ICONS] ?? MonitorPlay;
                const isActive = activeStop === stop.id;
                return (
                  <li key={stop.id}>
                    <button
                      type="button"
                      onClick={() => setActiveStop(stop.id)}
                      className={cn(
                        "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition",
                        isActive
                          ? "bg-primary/10 font-medium text-primary"
                          : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                      )}
                      data-testid={`demo-sandbox-nav-${stop.id}`}
                    >
                      <Icon className="h-4 w-4 shrink-0" aria-hidden />
                      {stop.label}
                    </button>
                  </li>
                );
              })}
            </ul>
            <p className="mt-4 hidden px-2 font-mono text-[10px] text-muted-foreground lg:block">
              {activeStopMeta?.route}
            </p>
          </nav>

          <div className="p-4 sm:p-6">
            {activeStop === "integration-health" ? (
              <IntegrationHealthPanel
                selectedChannelId={selectedChannelId}
                onSelectChannel={setSelectedChannelId}
                selectedChannel={selectedChannel}
              />
            ) : (
              <WorkspaceStopPreview stop={activeStopMeta} onOpenHealth={() => setActiveStop("integration-health")} />
            )}
          </div>
        </div>
      </Card>

      <p className="mx-auto max-w-3xl text-center text-xs text-muted-foreground">
        {DEMO_PAGE_P1_29_DISCLAIMER}
      </p>

      <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
        <DemoLaunchButton className="h-12 rounded-full px-8 text-sm font-semibold" />
        <span className="text-xs text-muted-foreground">
          Launch full sandbox — 2 hours · simulated channels · honest BETA labels
        </span>
      </div>
    </section>
  );
}

function IntegrationHealthPanel({
  selectedChannelId,
  onSelectChannel,
  selectedChannel,
}: {
  selectedChannelId: string;
  onSelectChannel: (id: string) => void;
  selectedChannel: DemoSandboxIntegrationChannel | undefined;
}) {
  return (
    <div data-testid={DEMO_PAGE_P1_29_INTEGRATION_HEALTH_TEST_ID} className="space-y-4">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-primary">Integration Health</p>
        <h3 className="mt-1 text-xl font-semibold">See exactly why a channel failed</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Click any channel — PASS, SKIPPED, or FAILED with recovery playbook. Simulated sandbox data.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ul className="space-y-2" aria-label="Integration channels">
          {DEMO_PAGE_P1_29_INTEGRATION_CHANNELS.map((channel) => {
            const config = STATUS_CONFIG[channel.status];
            const StatusIcon = config.Icon;
            const isSelected = channel.id === selectedChannelId;
            return (
              <li key={channel.id}>
                <button
                  type="button"
                  onClick={() => onSelectChannel(channel.id)}
                  className={cn(
                    "flex w-full items-center justify-between gap-3 rounded-xl border bg-background/80 p-3 text-left transition",
                    config.row,
                    isSelected && "ring-2 ring-primary/40",
                  )}
                  data-testid={`demo-sandbox-channel-${channel.id}`}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <StatusIcon className="h-4 w-4 shrink-0" aria-hidden />
                    <div className="min-w-0">
                      <span className="block text-sm font-medium">{channel.label}</span>
                      <span className="block truncate text-xs text-muted-foreground">
                        Last sync: {channel.lastSync}
                      </span>
                    </div>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase",
                      config.badge,
                    )}
                  >
                    {channel.status}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        {selectedChannel ? (
          <Card className="border-border/80 bg-muted/20 shadow-none">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-base">{selectedChannel.label}</CardTitle>
                {selectedChannel.code ? (
                  <code className="rounded bg-muted px-2 py-0.5 font-mono text-xs">
                    {selectedChannel.code}
                  </code>
                ) : null}
              </div>
              <CardDescription>{selectedChannel.detail}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Recovery playbook
              </p>
              <p className="mt-2 text-sm font-medium text-primary">{selectedChannel.playbook}</p>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}

function WorkspaceStopPreview({
  stop,
  onOpenHealth,
}: {
  stop: (typeof DEMO_PAGE_P1_29_WORKSPACE_STOPS)[number] | undefined;
  onOpenHealth: () => void;
}) {
  if (!stop) return null;

  return (
    <div className="flex min-h-[280px] flex-col justify-center space-y-4 rounded-xl border border-dashed border-border/80 bg-muted/20 p-6 text-center">
      <MonitorPlay className="mx-auto h-10 w-10 text-primary/70" aria-hidden />
      <div>
        <h3 className="text-xl font-semibold">{stop.previewTitle}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{stop.previewDetail}</p>
        <p className="mt-3 font-mono text-xs text-muted-foreground">{stop.route}</p>
      </div>
      <button
        type="button"
        onClick={onOpenHealth}
        className="mx-auto text-sm font-medium text-primary hover:underline"
        data-testid="demo-sandbox-open-integration-health"
      >
        Open Integration Health preview →
      </button>
    </div>
  );
}
