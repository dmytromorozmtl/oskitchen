#!/usr/bin/env python3
"""Split maintenance-mode-panel.tsx into valid JSX components."""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "components/dashboard/maintenance-mode-panel.tsx"
OUT = ROOT / "components/dashboard/maintenance"
PLATFORM = OUT / "platform"

lines = SRC.read_text().splitlines()


def sl(start: int, end: int) -> str:
    return "\n".join(lines[start - 1 : end]) + "\n"


OUT.mkdir(parents=True, exist_ok=True)
PLATFORM.mkdir(parents=True, exist_ok=True)

(OUT / "maintenance-mode-shared.ts").write_text(
    sl(48, 64).replace("type MaintenanceModePanelVariant", "export type MaintenanceModePanelVariant")
)

PLATFORM_IMPORTS = sl(1, 46)

for name, start, end in [
    ("maintenance-engineering-path-terminus-panel", 218, 293),
    ("maintenance-post-terminus-steady-state-panel", 295, 402),
    ("maintenance-commercial-pilot-absolute-end-panel", 404, 533),
    ("maintenance-linear-path-panel", 535, 5797),
]:
    body = sl(start, end)
    (PLATFORM / f"{name}.tsx").write_text(
        PLATFORM_IMPORTS
        + 'import type { MaintenancePanelContext } from "@/components/dashboard/maintenance/maintenance-mode-shared";\n\n'
        + f"export function {''.join(p.capitalize() for p in name.split('-'))}({{ slice, isPlatform, isCompact }}: MaintenancePanelContext) {{\n"
        + "  if (isCompact || !isPlatform) return null;\n"
        + "  return (\n    <>\n"
        + body
        + "    </>\n  );\n}\n"
    )

(OUT / "maintenance-status-badges.tsx").write_text(
    '''import { Badge } from "@/components/ui/badge";
import { formatMaintenanceModeProgressLabel } from "@/lib/commercial/maintenance-mode-ui-era24";
import type { MaintenancePanelContext } from "@/components/dashboard/maintenance/maintenance-mode-shared";

export function MaintenanceStatusBadges({ slice, isCompact }: MaintenancePanelContext) {
  if (isCompact) {
    return <p className="text-sm font-medium">{formatMaintenanceModeProgressLabel(slice)}</p>;
  }
  return (
    <div className="flex flex-wrap gap-2">
      <Badge variant="default" className="rounded-full font-mono text-[10px]">path complete</Badge>
      <Badge variant="outline" className="rounded-full font-mono text-[10px]">{slice.maintenanceModeMilestone.replaceAll("_", " ")}</Badge>
      <Badge variant="outline" className="rounded-full text-[10px]">era24 maintenance mode</Badge>
      {slice.pureOperationalModeEra25Active ? (
        <Badge variant="default" className="rounded-full font-mono text-[10px]">era25 pure ops</Badge>
      ) : slice.sustainedOpsConvergenceReady ? (
        <Badge variant="secondary" className="rounded-full font-mono text-[10px]">era25 sustained ops</Badge>
      ) : null}
      {slice.improvementLoopOverdue + slice.productEvolutionOverdue > 0 ? (
        <Badge variant="destructive" className="rounded-full text-[10px]">{slice.improvementLoopOverdue + slice.productEvolutionOverdue} upstream overdue</Badge>
      ) : null}
      {!slice.maintenanceModeIntegrityPassed ? (
        <Badge variant="destructive" className="rounded-full text-[10px]">Maintenance mode blocked</Badge>
      ) : null}
      {!slice.productEvolutionIntegrityPassed ? (
        <Badge variant="destructive" className="rounded-full text-[10px]">Product evolution integrity FAIL</Badge>
      ) : null}
    </div>
  );
}
'''
)

(OUT / "maintenance-notification-panel.tsx").write_text(
    '''import { cn } from "@/lib/utils";
import type { MaintenancePanelContext } from "@/components/dashboard/maintenance/maintenance-mode-shared";

export function MaintenanceNotificationPanel({ slice, isPlatform }: MaintenancePanelContext) {
  if (!slice.nextAttentionRhythm) return null;
  return (
    <div className={cn("rounded-lg border px-3 py-2 text-sm", isPlatform ? "border-amber-800/60 bg-amber-950/20 text-amber-100" : "border-amber-200/70 bg-amber-50/20")}>
      <p className="font-medium">Next rhythm attention</p>
      <p className="mt-1 text-xs opacity-90">{slice.nextAttentionDetail}</p>
    </div>
  );
}
'''
)

history_src = sl(156, 216)
(OUT / "maintenance-history-list.tsx").write_text(
    sl(1, 46)
    + 'import type { MaintenancePanelContext } from "@/components/dashboard/maintenance/maintenance-mode-shared";\n'
    + "import { statusBadgeVariant, statusIcon } from \"@/components/dashboard/maintenance/maintenance-mode-shared\";\n\n"
    + "export function MaintenanceHistoryList({ slice, isPlatform }: MaintenancePanelContext) {\n  return (\n"
    + history_src
    + "  );\n}\n"
)

footer_body = "\n".join(line[8:] if line.startswith("        ") else line for line in lines[5798:5852])
(OUT / "maintenance-guardrails-footer.tsx").write_text(
    sl(1, 46).replace("ShieldCheck", "ShieldCheck").split("\n")[0:3][0]  # minimal - rewrite
)
# rewrite footer properly
(OUT / "maintenance-guardrails-footer.tsx").write_text(
    '''import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { MaintenancePanelContext } from "@/components/dashboard/maintenance/maintenance-mode-shared";

export function MaintenanceGuardrailsFooter({ slice, isCompact, isPlatform }: MaintenancePanelContext) {
  if (isCompact) return null;
  return (
'''
    + footer_body
    + "\n  );\n}\n"
)

(PLATFORM / "maintenance-platform-sections.tsx").write_text(
    '''import dynamic from "next/dynamic";
import type { MaintenancePanelContext } from "@/components/dashboard/maintenance/maintenance-mode-shared";
import { MaintenanceCommercialPilotAbsoluteEndPanel } from "@/components/dashboard/maintenance/platform/maintenance-commercial-pilot-absolute-end-panel";
import { MaintenanceEngineeringPathTerminusPanel } from "@/components/dashboard/maintenance/platform/maintenance-engineering-path-terminus-panel";
import { MaintenancePostTerminusSteadyStatePanel } from "@/components/dashboard/maintenance/platform/maintenance-post-terminus-steady-state-panel";

const MaintenanceLinearPathPanel = dynamic(
  () =>
    import("@/components/dashboard/maintenance/platform/maintenance-linear-path-panel").then(
      (m) => m.MaintenanceLinearPathPanel,
    ),
  { loading: () => null },
);

export function MaintenancePlatformSections(ctx: MaintenancePanelContext) {
  if (ctx.isCompact || !ctx.isPlatform) return null;
  return (
    <>
      <MaintenanceEngineeringPathTerminusPanel {...ctx} />
      <MaintenancePostTerminusSteadyStatePanel {...ctx} />
      <MaintenanceCommercialPilotAbsoluteEndPanel {...ctx} />
      <MaintenanceLinearPathPanel {...ctx} />
    </>
  );
}
'''
)

(OUT / "maintenance-mode-panel.tsx").write_text(
    '''import { ShieldCheck } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { MaintenanceModeUiSlice } from "@/lib/commercial/maintenance-mode-ui-era24";
import { formatMaintenanceModeProgressLabel, MAINTENANCE_MODE_PLATFORM_ANCHOR } from "@/lib/commercial/maintenance-mode-ui-era24";
import { cn } from "@/lib/utils";
import type { MaintenanceModePanelVariant } from "@/components/dashboard/maintenance/maintenance-mode-shared";
import { MaintenanceGuardrailsFooter } from "@/components/dashboard/maintenance/maintenance-guardrails-footer";
import { MaintenanceHistoryList } from "@/components/dashboard/maintenance/maintenance-history-list";
import { MaintenanceNotificationPanel } from "@/components/dashboard/maintenance/maintenance-notification-panel";
import { MaintenancePlatformSections } from "@/components/dashboard/maintenance/platform/maintenance-platform-sections";
import { MaintenanceStatusBadges } from "@/components/dashboard/maintenance/maintenance-status-badges";

export function MaintenanceModePanel(props: {
  slice: MaintenanceModeUiSlice;
  variant?: MaintenanceModePanelVariant;
  title?: string;
}) {
  const { slice, variant = "dashboard", title = "Maintenance mode — commercial pilot path complete" } = props;
  const isPlatform = variant === "platform";
  const isCompact = variant === "compact";
  const ctx = { slice, variant, isPlatform, isCompact };
  const cardClass = isPlatform ? "border-slate-700/80 bg-slate-950/30" : "border-slate-200/80 bg-slate-50/20 dark:border-slate-800/60";

  return (
    <Card id={isPlatform ? MAINTENANCE_MODE_PLATFORM_ANCHOR.slice(1) : undefined} className={cn("scroll-mt-24 shadow-sm", cardClass)} data-testid="maintenance-mode-panel">
      {!isCompact ? (
        <CardHeader className="pb-2">
          <CardTitle className={cn("flex items-center gap-2 text-lg", isPlatform && "text-slate-100")}>
            <ShieldCheck className="h-5 w-5 opacity-70" aria-hidden />
            {title}
          </CardTitle>
          <CardDescription className={isPlatform ? "text-slate-400" : undefined}>
            {formatMaintenanceModeProgressLabel(slice)} — era21→era24 path complete; repeat rhythms forever, no Step 13 gates.
          </CardDescription>
        </CardHeader>
      ) : null}
      <CardContent className={cn("space-y-3", isCompact && "pt-4")}>
        <MaintenanceStatusBadges {...ctx} />
        <MaintenanceNotificationPanel {...ctx} />
        <MaintenanceHistoryList {...ctx} />
        <MaintenancePlatformSections {...ctx} />
        <MaintenanceGuardrailsFooter {...ctx} />
      </CardContent>
    </Card>
  );
}
'''
)

(OUT / "index.ts").write_text(
    "export { MaintenanceModePanel } from \"./maintenance-mode-panel\";\n"
    "export { MaintenanceStatusBadges } from \"./maintenance-status-badges\";\n"
    "export { MaintenanceNotificationPanel } from \"./maintenance-notification-panel\";\n"
    "export { MaintenanceHistoryList } from \"./maintenance-history-list\";\n"
    "export { MaintenanceGuardrailsFooter } from \"./maintenance-guardrails-footer\";\n"
)

# Fix shared.ts - add MaintenancePanelContext
shared = (OUT / "maintenance-mode-shared.ts").read_text()
shared += "\nexport type MaintenancePanelContext = {\n  slice: import(\"@/lib/commercial/maintenance-mode-ui-era24\").MaintenanceModeUiSlice;\n  variant?: MaintenanceModePanelVariant;\n  isPlatform: boolean;\n  isCompact: boolean;\n};\n"
(OUT / "maintenance-mode-shared.ts").write_text(shared)

# Shim legacy import path
(SRC).write_text('export { MaintenanceModePanel } from "@/components/dashboard/maintenance/maintenance-mode-panel";\n')

# Fix platform component export names (PascalCase from kebab)
for fname in PLATFORM.glob("maintenance-*.tsx"):
    if fname.name == "maintenance-platform-sections.tsx":
        continue
    text = fname.read_text()
    pascal = "".join(p.capitalize() for p in fname.stem.split("-"))
    text = text.replace(f"export function {pascal.replace('Maintenance', 'Maintenance')}", f"export function {pascal}")
    # fix broken name from script
    import re
    text = re.sub(r"export function \w+\(", f"export function {pascal}(", text, count=1)
    fname.write_text(text)

print("Split complete")
for f in sorted(OUT.rglob("*.tsx")):
    print(f.relative_to(ROOT), len(f.read_text().splitlines()))
