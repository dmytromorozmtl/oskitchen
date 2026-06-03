import React from "react";
import Link from "next/link";

import { BetaBadge, PreviewBadge } from "@/components/ui/beta-badge";
import { Badge } from "@/components/ui/badge";
import {
  AI_HONESTY_POLICY_ID,
  getAiHonestyLabel,
  type AiMethodLabel,
  type AiModuleId,
  type AiMaturityLabel,
} from "@/lib/ai/ai-honesty-labels";
import { cn } from "@/lib/utils";

function PilotReadyBadge({
  className,
  title = "Pilot ready — qualified for design partner with documented caveats",
}: {
  className?: string;
  title?: string;
}) {
  return (
    <Badge
      variant="secondary"
      title={title}
      className={cn(
        "rounded-full px-1.5 py-0 text-[10px] font-semibold uppercase tracking-wide",
        "border border-emerald-500/40 bg-emerald-500/10 text-emerald-950 dark:text-emerald-100",
        className,
      )}
    >
      Pilot ready
    </Badge>
  );
}

export function AiMaturityBadge({ maturity }: { maturity: AiMaturityLabel }) {
  switch (maturity) {
    case "pilot_ready":
      return <PilotReadyBadge />;
    case "beta":
      return <BetaBadge title="BETA — engineering shipped; operator proof in progress" />;
    case "preview":
      return <PreviewBadge title="Preview — capabilities may change; verify before customer demos" />;
    default:
      return null;
  }
}

function MethodBadge({ method }: { method: AiMethodLabel }) {
  const labels: Record<AiMethodLabel, string> = {
    deterministic: "Deterministic",
    heuristic: "Heuristic",
    simulation: "Simulation",
    llm_optional: "LLM optional",
    synthetic_default: "Preview / synthetic",
  };
  return (
    <Badge
      variant="outline"
      className="rounded-full px-1.5 py-0 text-[10px] font-medium normal-case tracking-normal"
    >
      {labels[method]}
    </Badge>
  );
}

export type AiHonestyBannerProps = {
  moduleId: AiModuleId;
  compact?: boolean;
  className?: string;
};

/** Visible maturity + method honesty strip for AI module pages (DEV-25). */
export function AiHonestyBanner({ moduleId, compact = false, className }: AiHonestyBannerProps) {
  const label = getAiHonestyLabel(moduleId);

  if (compact) {
    return (
      <p
        className={cn(
          "flex flex-wrap items-center gap-2 text-xs text-muted-foreground",
          className,
        )}
        role="status"
        data-testid={`ai-honesty-label-${moduleId}`}
        data-ai-honesty-policy={AI_HONESTY_POLICY_ID}
      >
        <AiMaturityBadge maturity={label.maturity} />
        <MethodBadge method={label.method} />
        <span>{label.disclaimer}</span>
        <Link href="/trust" className="font-medium text-primary hover:underline">
          Feature honesty
        </Link>
      </p>
    );
  }

  return (
    <div
      className={cn(
        "rounded-lg border border-primary/20 bg-primary/[0.04] px-3 py-2.5 text-sm",
        className,
      )}
      role="status"
      data-testid={`ai-honesty-label-${moduleId}`}
      data-ai-honesty-policy={AI_HONESTY_POLICY_ID}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-medium text-foreground">{label.moduleName}</span>
        <AiMaturityBadge maturity={label.maturity} />
        <MethodBadge method={label.method} />
      </div>
      <p className="mt-1.5 text-muted-foreground">{label.methodDescription}</p>
      <p className="mt-1 text-xs text-muted-foreground">{label.disclaimer}</p>
      <p className="mt-2 text-xs">
        <Link href="/trust" className="font-medium text-primary hover:underline">
          Feature honesty policy
        </Link>
        {" · "}
        <span className="text-muted-foreground">Policy {AI_HONESTY_POLICY_ID}</span>
      </p>
    </div>
  );
}
