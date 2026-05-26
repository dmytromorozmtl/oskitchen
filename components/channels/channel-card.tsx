import Link from "next/link";
import {
  Bike,
  Calendar,
  Coffee,
  Croissant,
  FileSpreadsheet,
  FormInput,
  Mail,
  Phone,
  Plug,
  ShoppingBag,
  Store,
  Truck,
  UtensilsCrossed,
  Wine,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

import { IntegrationActionButton } from "@/components/integrations/integration-action-button";
import { SensitiveErrorPreview } from "@/components/integrations/sensitive-error-preview";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ResolvedChannel } from "@/lib/channels/channel-runtime";
import { channelCapabilityLabel } from "@/lib/channels/channel-capabilities";
import { supportLevelBadgeLabel } from "@/lib/channels/channel-status";
import { SITE_URL } from "@/lib/constants";
import { toSafeErrorPreview } from "@/lib/security/sensitive-redaction";

function channelIcon(def: ResolvedChannel) {
  const map = {
    store: Store,
    shoppingBag: ShoppingBag,
    bike: Bike,
    utensils: UtensilsCrossed,
    truck: Truck,
    fileSpreadsheet: FileSpreadsheet,
    mail: Mail,
    phone: Phone,
    form: FormInput,
    plug: Plug,
    calendar: Calendar,
    wine: Wine,
    croissant: Croissant,
    coffee: Coffee,
  } as const;
  const Icon = map[def.icon] ?? Plug;
  return <Icon className="h-5 w-5 text-muted-foreground" />;
}

function statusBadge(s: ResolvedChannel["effectiveStatus"]) {
  const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    LIVE: "default",
    CONNECTED: "default",
    NEEDS_CREDENTIALS: "secondary",
    NEEDS_SETUP: "secondary",
    PARTNER_ACCESS_REQUIRED: "outline",
    SIMULATED_DEMO: "outline",
    DISABLED: "outline",
    ERROR: "destructive",
    COMING_SOON: "outline",
  };
  return (
    <Badge variant={variants[s] ?? "outline"} className="rounded-full text-xs">
      {s.replace(/_/g, " ")}
    </Badge>
  );
}

function quickHealthScore(row: ResolvedChannel): number | null {
  if (row.supportLevel === "COMING_SOON") return null;
  if (row.effectiveStatus === "ERROR") return 38;
  if (row.effectiveStatus === "NEEDS_CREDENTIALS") return 52;
  if (row.effectiveStatus === "PARTNER_ACCESS_REQUIRED") return 48;
  if (row.effectiveStatus === "LIVE" || row.effectiveStatus === "CONNECTED") {
    let s = 78;
    if (row.connection?.lastSyncAt) s += 14;
    if (row.connection?.lastError) s -= 28;
    return Math.min(99, Math.max(40, s));
  }
  return 62;
}

function primaryCta(row: ResolvedChannel): { label: string; href: string } {
  if (row.effectiveStatus === "NEEDS_CREDENTIALS") {
    return { label: "Add credentials", href: row.setupRoute };
  }
  if (row.effectiveStatus === "ERROR") {
    return { label: "View errors", href: row.setupRoute };
  }
  if (row.effectiveStatus === "PARTNER_ACCESS_REQUIRED") {
    return { label: "Partner checklist", href: row.setupRoute };
  }
  if (row.providerKey === "manual-orders") {
    return { label: "Quick order", href: row.setupRoute };
  }
  if (row.providerKey === "kitchenos-storefront") {
    return { label: "Storefront settings", href: row.setupRoute };
  }
  return { label: row.isPlaceholder ? "Roadmap & setup" : "Open setup", href: row.setupRoute };
}

export function ChannelCard({ row, mode = "default" }: { row: ResolvedChannel; mode?: "default" | "readOnly" }) {
  const readOnly = mode === "readOnly";
  const health = quickHealthScore(row);
  const cta = primaryCta(row);
  const caps = row.capabilities.slice(0, 5);

  return (
    <Card className="border-border/80 bg-card/90 shadow-sm">
      <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0 pb-2">
        <div className="flex items-start gap-2">
          {channelIcon(row)}
          <div>
            <CardTitle className="text-base font-semibold">{row.label}</CardTitle>
            <CardDescription className="text-xs">{row.shortDescription}</CardDescription>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          {statusBadge(row.effectiveStatus)}
          <Badge variant="outline" className="rounded-full text-[10px] font-normal">
            {supportLevelBadgeLabel(row.supportLevel)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 text-xs text-muted-foreground">
        <div className="flex flex-wrap gap-1">
          {row.isNative ? (
            <Badge variant="secondary" className="rounded-full text-[10px]">
              Native
            </Badge>
          ) : null}
          {caps.map((c) => (
            <Badge key={c} variant="outline" className="rounded-full text-[10px] font-normal">
              {channelCapabilityLabel(c)}
            </Badge>
          ))}
        </div>
        {health != null ? (
          <p>
            Health score: <span className="font-medium text-foreground">{health}</span> / 100
            <span className="text-muted-foreground"> (estimate)</span>
          </p>
        ) : null}
        <p>{row.nextAction}</p>
        {row.connection ? (
          <p>
            Connection: <span className="font-medium text-foreground">{row.connection.name}</span>{" "}
            · {row.connection.status}
            {row.connection.lastSyncAt
              ? ` · last sync ${formatDistanceToNow(row.connection.lastSyncAt, { addSuffix: true })}`
              : " · last sync —"}
          </p>
        ) : null}
        {row.connection?.lastError ? (
          <div className="rounded-md border border-destructive/30 bg-destructive/5 p-2">
            <p className="text-[10px] font-semibold uppercase text-destructive">Last error</p>
            {(() => {
              const preview = toSafeErrorPreview(row.connection.lastError, 220);
              return (
                <SensitiveErrorPreview
                  text={preview.text === "—" ? null : preview.text}
                  redacted={preview.redacted}
                  textClassName="text-xs text-destructive"
                />
              );
            })()}
          </div>
        ) : null}
        {readOnly ? (
          <p className="pt-1 text-xs text-muted-foreground">
            Workspace owner configures credentials, webhooks, and channel setup in the dashboard — not from platform
            read-only diagnostics.
          </p>
        ) : null}
        {!readOnly && row.supportsWebhooks && row.webhookRoutes.length > 0 ? (
          <div className="space-y-2">
            <div className="rounded-md bg-muted/50 p-2 font-mono text-[11px] break-all">
              {row.webhookRoutes.map((h) => (
                <div key={h}>
                  {SITE_URL}
                  {h}
                  {row.connection ? `?cid=${row.connection.id}` : ""}
                </div>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <IntegrationActionButton provider={row.providerKey} action="webhook_replay" variant="inline" />
              <IntegrationActionButton provider={row.providerKey} action="integration_retry" variant="inline" />
            </div>
          </div>
        ) : null}
        {!readOnly ? (
        <div className="flex flex-wrap gap-2 pt-1">
          <Button asChild size="sm" variant="default" className="rounded-full">
            <Link href={cta.href}>{cta.label}</Link>
          </Button>
          <Button asChild size="sm" variant="secondary" className="rounded-full">
            <Link href={row.setupRoute}>Setup</Link>
          </Button>
          <Button asChild size="sm" variant="ghost" className="rounded-full">
            <Link href={row.docsLinks[0] ?? row.docsUrl}>Docs</Link>
          </Button>
        </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
