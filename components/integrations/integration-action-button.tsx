"use client";

import { HelpCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  getIntegrationActionAvailability,
  type IntegrationSurfaceAction,
} from "@/lib/integrations/integration-action-availability";

type Props = {
  provider?: string;
  action: IntegrationSurfaceAction;
  context?: { hasReplayServerAction?: boolean; hasRetryServerAction?: boolean; isPlatform?: boolean };
  /** When true, render a compact text hint instead of a button */
  variant?: "button" | "inline";
};

/**
 * Honest replay/retry affordance — disabled until real server actions set context flags.
 */
export function IntegrationActionButton({ provider, action, context, variant = "button" }: Props) {
  const avail = getIntegrationActionAvailability(provider, action, context ?? {});
  if (variant === "inline") {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
        {avail.label}: {avail.available ? "available" : "not available yet"}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button type="button" className="text-muted-foreground hover:text-foreground" aria-label="Help">
                <HelpCircle className="h-3.5 w-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">{avail.disabledTooltip}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </span>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-block">
            <Button type="button" size="sm" variant="secondary" className="rounded-full" disabled={!avail.available}>
              {avail.label}
            </Button>
          </span>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">{avail.disabledTooltip}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
