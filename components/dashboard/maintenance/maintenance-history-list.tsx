import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  statusBadgeVariant,
  statusIcon,
  type MaintenancePanelContext,
} from "@/components/dashboard/maintenance/maintenance-mode-shared";

export function MaintenanceHistoryList({ slice, isPlatform }: MaintenancePanelContext) {
  return (
    <ul className="space-y-2">
      {slice.rhythms.map((rhythm) => {
        const Icon = statusIcon(rhythm.status);
        const isAttention = rhythm.status === "overdue" || rhythm.status === "due_soon";
        return (
          <li
            key={rhythm.id}
            className={cn(
              "rounded-lg border px-3 py-2 text-sm",
              rhythm.status === "healthy"
                ? "border-emerald-200/60 bg-emerald-50/10"
                : isAttention
                  ? isPlatform
                    ? "border-amber-800/50 bg-amber-950/10"
                    : "border-amber-200/60 bg-amber-50/10"
                  : isPlatform
                    ? "border-zinc-800 bg-zinc-900/40"
                    : "border-border/70 bg-background/60",
            )}
          >
            <div className="flex items-start gap-2">
              <Icon
                className={cn(
                  "mt-0.5 h-4 w-4 shrink-0",
                  rhythm.status === "healthy"
                    ? "text-emerald-600"
                    : rhythm.status === "overdue"
                      ? "text-rose-500"
                      : rhythm.status === "due_soon"
                        ? "text-amber-600"
                        : "text-muted-foreground",
                )}
                aria-hidden
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">{rhythm.label}</span>
                  <Badge variant="outline" className="rounded-full text-[10px] capitalize">
                    {rhythm.ownerRole}
                  </Badge>
                  <Badge
                    variant={statusBadgeVariant(rhythm.status)}
                    className="rounded-full text-[10px] capitalize"
                  >
                    {rhythm.status.replaceAll("_", " ")}
                  </Badge>
                </div>
                <p
                  className={cn(
                    "mt-1 text-xs",
                    isPlatform ? "text-zinc-400" : "text-muted-foreground",
                  )}
                >
                  {rhythm.detail}
                </p>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
