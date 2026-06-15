import type { CopilotRedactionLevel } from "@prisma/client";

type Props = {
  hasApiKey: boolean;
  aiNarrativeEnabled: boolean;
  deterministicOnly: boolean;
  redactionLevel: CopilotRedactionLevel;
  requireApprovalAll: boolean;
  chatRouteLabel?: string | null;
};

function pill(label: string, tone: "ok" | "warn" | "muted" = "muted") {
  const cls =
    tone === "ok"
      ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-100"
      : tone === "warn"
      ? "bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-100"
      : "bg-muted text-muted-foreground";
  return (
    <span key={label} className={`rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>
      {label}
    </span>
  );
}

export function AiStatusBadges({
  hasApiKey,
  aiNarrativeEnabled,
  deterministicOnly,
  redactionLevel,
  requireApprovalAll,
  chatRouteLabel,
}: Props) {
  const aiState = deterministicOnly
    ? pill("Deterministic mode", "muted")
    : !aiNarrativeEnabled
    ? pill("AI narrative off", "muted")
    : !hasApiKey
    ? pill("AI disabled — no API key", "warn")
    : pill("AI narrative enabled", "ok");
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      {aiState}
      {pill(`Redaction: ${redactionLevel.replaceAll("_", " ").toLowerCase()}`, "ok")}
      {requireApprovalAll
        ? pill("Human approval required", "ok")
        : pill("Human approval optional", "warn")}
      {chatRouteLabel ? pill(`Route: ${chatRouteLabel}`, "ok") : null}
    </div>
  );
}
