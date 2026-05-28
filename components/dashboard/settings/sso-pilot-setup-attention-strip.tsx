import Link from "next/link";
import { AlertTriangle, ArrowRight, ShieldCheck } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  pickSsoPilotSetupAttentionItems,
  summarizeSsoPilotSetupFocus,
  type SsoPilotSetupFocusSnapshot,
} from "@/lib/enterprise/enterprise-sso-pilot-setup-focus-era18";
import type {
  SsoPilotSetupProgress,
  SsoPilotSetupStepDef,
} from "@/lib/enterprise/enterprise-sso-pilot-setup-wizard-steps";

export function SsoPilotSetupAttentionStrip(props: {
  focus: SsoPilotSetupFocusSnapshot;
  progress: SsoPilotSetupProgress;
  stepDefs: readonly SsoPilotSetupStepDef[];
}) {
  const summary = summarizeSsoPilotSetupFocus(props.focus);
  const items = pickSsoPilotSetupAttentionItems(props.progress, props.stepDefs);

  if (items.length === 0) return null;

  return (
    <Card
      className="border-amber-200/80 bg-amber-50/40 shadow-sm dark:border-amber-900/40 dark:bg-amber-950/20"
      data-testid="sso-pilot-setup-attention-strip"
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <ShieldCheck className="h-5 w-5 text-muted-foreground" aria-hidden />
          <AlertTriangle className="h-5 w-5 text-amber-600" aria-hidden />
          SSO pilot setup — finish these first
        </CardTitle>
        <CardDescription>
          {props.focus.idpLoginProofPending
            ? "Admin configuration complete — staging IdP login proof is the remaining P0 gate (not auto-passed in product UI)."
            : summary.hasUrgent
              ? `${props.focus.completedCount}/${props.focus.totalCount} steps done — current step prioritized before IdP login proof.`
              : `${props.focus.incompleteCount} setup step${props.focus.incompleteCount === 1 ? "" : "s"} remain on this pilot tenant.`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {items.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            data-testid={`sso-pilot-setup-attention-${item.id}`}
            className="flex items-start justify-between gap-3 rounded-xl border border-border/70 bg-background/80 px-3 py-2 text-sm hover:bg-muted/40"
          >
            <div>
              <p className="font-medium">{item.title}</p>
              <p className="text-xs text-muted-foreground">{item.detail}</p>
            </div>
            <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
