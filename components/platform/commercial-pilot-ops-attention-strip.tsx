import Link from "next/link";
import { AlertTriangle, ArrowRight } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  mergeCommercialPilotOpsAttentionItems,
  pickCommercialPilotOpsGoLiveBridgeAttentionItems,
} from "@/lib/commercial/commercial-pilot-ops-go-live-bridge-era18";
import { buildCommercialPilotOpsInflectionSlice } from "@/lib/commercial/commercial-pilot-ops-inflection-era28";
import {
  pickCommercialPilotOpsAttentionItems,
  summarizeCommercialPilotOpsStatus,
  type CommercialPilotOpsStatusModel,
} from "@/lib/commercial/commercial-pilot-ops-status-era18";
import type { PlatformGoLiveProjectRow } from "@/lib/go-live/platform-go-live-focus-era18";

export function CommercialPilotOpsAttentionStrip(props: {
  model: CommercialPilotOpsStatusModel;
  launchBlockerProjects?: readonly PlatformGoLiveProjectRow[];
}) {
  const inflection = buildCommercialPilotOpsInflectionSlice(props.model);
  const opsItems = pickCommercialPilotOpsAttentionItems(props.model);
  const bridgeItems = props.launchBlockerProjects
    ? pickCommercialPilotOpsGoLiveBridgeAttentionItems({
        opsModel: props.model,
        blockerProjects: props.launchBlockerProjects,
      })
    : [];
  const items = mergeCommercialPilotOpsAttentionItems(opsItems, bridgeItems);
  const summary = summarizeCommercialPilotOpsStatus(props.model);
  const vaultHero = inflection.vaultHero;
  const vaultBlocked = inflection.summary.milestone === "p0_ops_vault_blocked";

  if (items.length === 0) return null;

  const description =
    vaultBlocked && vaultHero?.nextPhase
      ? `VP Ops — start ${vaultHero.nextPhase.label}: ${vaultHero.nextPhase.missingKeys.join(", ")} · ${inflection.summary.p0VaultMissingCount}/11 vault vars missing before LIVE claims.`
      : summary.hasUrgent
        ? "Evidence from local/CI smoke artifacts only — never infer GO without pilot-gono-go-summary.json."
        : `${summary.totalSignals} open signal${summary.totalSignals === 1 ? "" : "s"} before first paid pilot.`;

  return (
    <Card
      className="border-amber-800/60 bg-amber-950/30"
      data-testid="commercial-pilot-ops-attention-strip"
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg text-amber-100">
          <AlertTriangle className="h-5 w-5 text-amber-400" aria-hidden />
          Paid pilot execution — resolve these first
        </CardTitle>
        <CardDescription className="text-zinc-400" data-testid="commercial-pilot-ops-attention-description">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {vaultBlocked && vaultHero?.nextPhase ? (
          <div
            className="rounded-lg border border-amber-700/50 bg-amber-950/20 px-3 py-2 text-xs text-zinc-300"
            data-testid="commercial-pilot-ops-attention-vault-hero"
          >
            <p className="font-medium text-amber-200">
              Commercial inflection blocked — {inflection.uiSlice?.topBlockerTitle ?? vaultHero.nextPhase.label}
            </p>
            <p className="mt-1 font-mono text-[11px] text-zinc-400">
              {vaultHero.nextPhase.missingKeys.join(", ")}
            </p>
            <p className="mt-1 text-zinc-500">
              {vaultHero.nextPhase.docPath} · Pilot score {inflection.summary.pilotExecutableScore}/100
            </p>
          </div>
        ) : null}
        {items.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            data-testid={`commercial-pilot-ops-attention-${item.id}`}
            className="flex items-start justify-between gap-3 rounded-xl border border-zinc-800 bg-zinc-950/40 px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-900/60"
          >
            <div>
              <p className="font-medium text-white">{item.title}</p>
              <p className="text-xs text-zinc-400">{item.detail}</p>
            </div>
            <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-zinc-500" aria-hidden />
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
