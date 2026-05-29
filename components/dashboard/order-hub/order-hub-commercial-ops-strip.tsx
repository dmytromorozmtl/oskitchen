import Link from "next/link";
import { ShieldAlert } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { OrderHubCommercialOpsStripSlice } from "@/lib/order-hub/order-hub-commercial-ops-era28";

export function OrderHubCommercialOpsStrip(props: {
  slice: OrderHubCommercialOpsStripSlice;
}) {
  const { slice } = props;
  const vaultBlocked = slice.vaultMissingCount > 0 && slice.vaultPhaseLabel;

  return (
    <Card
      className="border-violet-200/80 bg-violet-50/30 shadow-sm dark:border-violet-900/40 dark:bg-violet-950/20"
      data-testid="order-hub-commercial-ops-strip"
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg text-violet-950 dark:text-violet-100">
          <ShieldAlert className="h-5 w-5 shrink-0" aria-hidden />
          Commercial pilot ops — channel order readiness
        </CardTitle>
        <CardDescription className="max-w-3xl">{slice.headline}</CardDescription>
        <div className="flex flex-wrap gap-2 pt-1">
          <Badge variant="outline" className="rounded-full text-[10px]">
            P0: {slice.p0ProofStatus.replaceAll("_", " ")}
          </Badge>
          {slice.vaultMissingCount > 0 ? (
            <Badge variant="destructive" className="rounded-full text-[10px] tabular-nums">
              vault {slice.vaultMissingCount}/11 missing
            </Badge>
          ) : null}
          {slice.channelLiveProofBlocked ? (
            <Badge variant="secondary" className="rounded-full text-[10px]">
              channel live proof incomplete
            </Badge>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {vaultBlocked ? (
          <div
            className="rounded-lg border border-amber-700/50 bg-amber-950/10 px-3 py-2 dark:bg-amber-950/20"
            data-testid="order-hub-commercial-ops-vault-hero"
          >
            <p className="font-medium text-amber-900 dark:text-amber-200">
              VP Ops — start {slice.vaultPhaseLabel}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{slice.detail}</p>
            {slice.missingKeys.length > 0 ? (
              <p className="mt-2 font-mono text-[11px] text-muted-foreground">
                {slice.missingKeys.join(", ")}
              </p>
            ) : null}
            {slice.docPath ? (
              <p className="mt-1 text-xs text-muted-foreground">{slice.docPath}</p>
            ) : null}
          </div>
        ) : (
          <p className="text-muted-foreground">
            Top blocker: <strong>{slice.topBlockerTitle}</strong> — {slice.detail}
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm" variant="default" className="rounded-full">
            <Link href={slice.platformOpsHref}>
              {vaultBlocked ? "P0 staging proof ops" : "Commercial pilot ops"}
            </Link>
          </Button>
          <Button asChild size="sm" variant="outline" className="rounded-full">
            <Link href={slice.integrationHealthHref}>Integration health recovery</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
