import Link from "next/link";
import { AlertTriangle, ArrowRight } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  pickCommercialPilotOpsAttentionItems,
  summarizeCommercialPilotOpsStatus,
  type CommercialPilotOpsStatusModel,
} from "@/lib/commercial/commercial-pilot-ops-status-era18";

export function CommercialPilotOpsAttentionStrip(props: {
  model: CommercialPilotOpsStatusModel;
}) {
  const items = pickCommercialPilotOpsAttentionItems(props.model);
  const summary = summarizeCommercialPilotOpsStatus(props.model);

  if (items.length === 0) return null;

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
        <CardDescription className="text-zinc-400">
          {summary.hasUrgent
            ? "Evidence from local/CI smoke artifacts only — never infer GO without pilot-gono-go-summary.json."
            : `${summary.totalSignals} open signal${summary.totalSignals === 1 ? "" : "s"} before first paid pilot.`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
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
