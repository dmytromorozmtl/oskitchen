import type { GoLiveLaunchStage } from "@prisma/client";

import { LAUNCH_STAGES, STAGE_LABEL, stageRank } from "@/lib/go-live/launch-stages";
import { cn } from "@/lib/utils";

export type StageProgress = {
  stage: GoLiveLaunchStage;
  satisfied: number;
  total: number;
  required: number;
};

export function StageStrip({
  current,
  progress,
}: {
  current: GoLiveLaunchStage;
  progress: StageProgress[];
}) {
  const currentRank = stageRank(current);
  const byStage = new Map(progress.map((p) => [p.stage, p]));
  return (
    <ol className="flex flex-wrap gap-2 text-xs">
      {LAUNCH_STAGES.map((stage, idx) => {
        const slot = byStage.get(stage);
        const done = slot && slot.total > 0 && slot.satisfied === slot.total;
        const active = stage === current;
        const isPast = idx < currentRank;
        return (
          <li
            key={stage}
            className={cn(
              "rounded-full border px-3 py-1.5",
              active
                ? "border-primary bg-primary text-primary-foreground"
                : done
                  ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                  : isPast
                    ? "border-border bg-muted text-muted-foreground"
                    : "border-dashed text-muted-foreground",
            )}
          >
            <span className="font-medium">
              {idx + 1}. {STAGE_LABEL[stage]}
            </span>
            {slot ? (
              <span className="ml-2 text-[10px] opacity-80">
                {slot.satisfied}/{slot.total}
                {slot.required > 0 ? ` · req ${slot.satisfied}/${slot.required}` : ""}
              </span>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
