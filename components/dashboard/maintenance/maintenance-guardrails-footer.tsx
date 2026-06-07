import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { MaintenancePanelContext } from "@/components/dashboard/maintenance/maintenance-mode-shared";

export function MaintenanceGuardrailsFooter({ slice, isCompact, isPlatform }: MaintenancePanelContext) {
  if (isCompact) return null;
  return (
    <>
      <div className="rounded-lg border border-dashed px-3 py-2 text-xs">
      <p className="font-medium">Guardrails (never)</p>
      <ul className="mt-2 list-disc space-y-1 pl-4 opacity-90">
        {slice.guardrails.map((rule) => (
          <li key={rule}>{rule}</li>
        ))}
      </ul>
    </div>
    <div
      className={cn(
        "rounded-lg border px-3 py-2 text-xs text-muted-foreground",
        isPlatform ? "border-zinc-800" : "border-border/60 bg-muted/20",
      )}
    >
      <p className={cn("font-medium", isPlatform ? "text-zinc-300" : "text-foreground")}>
        Ops commands
      </p>
      <ul className="mt-1 list-inside list-disc font-mono">
        <li>{slice.maintenanceModeExecutionCommand}</li>
        <li>{slice.productionPilotReadyClosureExecutionCommand}</li>
        <li>{slice.steadyStateOperatorLoopLockExecutionCommand}</li>
        <li>{slice.commercialPilotPathAbsoluteEndLockExecutionCommand}</li>
        <li>{slice.ciLoopExecutionCommand}</li>
        <li>{slice.postProductEvolutionOrchestratorCommand}</li>
        <li>{slice.validateCommand}</li>
        <li>{slice.syncPlaybookReportCommand}</li>
        <li>{slice.exportRhythmCalendarCommand}</li>
        <li>{slice.validateProductEvolutionCommand}</li>
        <li>{slice.validateProductEvolutionIntegrityCommand}</li>
        <li>{slice.integrityValidateCommand}</li>
        <li>{slice.syncIntegrityBaselineCommand}</li>
        <li>npm run smoke:woo-shopify-live</li>
        <li>npm run smoke:commerce-webhook-drill</li>
        <li>npm run test:ci:commercial-pilot-runbook:cert</li>
      </ul>
    </div>
    <div className="flex flex-wrap gap-2 pt-1">
      <Button asChild size="sm" variant="outline" className="rounded-full">
        <Link href={slice.improvementLoopHref}>Improvement loop</Link>
      </Button>
      <Button asChild size="sm" variant="ghost" className="rounded-full">
        <Link href={slice.productEvolutionHref}>Product evolution</Link>
      </Button>
      <Button asChild size="sm" variant="ghost" className="rounded-full">
        <Link href={slice.pureOperationalModeTerminusHref}>era25 terminus</Link>
      </Button>
      <Button asChild size="sm" variant="ghost" className="rounded-full">
        <Link href={slice.orderHubHref}>Order Hub</Link>
      </Button>
    </div>
    </>
  );
}
