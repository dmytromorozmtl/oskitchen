import { cn } from "@/lib/utils";
import { LoadingSkeleton } from "@/components/feedback/loading-skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  SKELETON_SURFACE_CLASS,
  SKELETON_WIZARD_SURFACE_CLASS,
} from "@/lib/design/loading-skeleton-patterns";

export type TodaySkeletonSection = "hero" | "wizard" | "playbook";

function TodayHeroSkeleton() {
  return (
    <Card
      className={cn(SKELETON_SURFACE_CLASS, "shadow-sm")}
      data-testid="today-skeleton-hero"
      aria-busy="true"
      aria-label="Loading daily briefing"
    >
      <CardHeader className="space-y-2">
        <LoadingSkeleton className="h-6 w-48" />
        <LoadingSkeleton className="h-4 w-full max-w-md" />
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <LoadingSkeleton key={i} className="h-20 w-full" />
          ))}
        </div>
        <LoadingSkeleton className="h-24 w-full" />
      </CardContent>
    </Card>
  );
}

function TodayWizardSkeleton() {
  return (
    <Card
      className={SKELETON_WIZARD_SURFACE_CLASS}
      data-testid="today-skeleton-wizard"
      aria-busy="true"
      aria-label="Loading workspace setup"
    >
      <CardContent className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1 space-y-2">
          <LoadingSkeleton className="h-5 w-40" />
          <LoadingSkeleton className="h-1.5 max-w-md w-full" />
          <LoadingSkeleton className="h-4 w-full max-w-sm" />
          <LoadingSkeleton className="h-4 w-3/4 max-w-xs" />
        </div>
        <LoadingSkeleton className="h-9 w-28 shrink-0 rounded-full" />
      </CardContent>
    </Card>
  );
}

function TodayPlaybookSkeleton() {
  return (
    <Card
      className={cn(SKELETON_SURFACE_CLASS, "shadow-sm")}
      data-testid="today-skeleton-playbook"
      aria-busy="true"
      aria-label="Loading operations playbooks"
    >
      <CardHeader className="space-y-2">
        <LoadingSkeleton className="h-6 w-52" />
        <LoadingSkeleton className="h-4 w-64" />
      </CardHeader>
      <CardContent className="space-y-3">
        <LoadingSkeleton className="h-28 w-full rounded-lg" />
        <LoadingSkeleton className="h-14 w-full rounded-md" />
      </CardContent>
    </Card>
  );
}

/** Streaming fallback for async Today page sections (DES-28). */
export function TodaySkeleton({
  section,
  className,
}: {
  section?: TodaySkeletonSection;
  className?: string;
}) {
  if (section === "hero") {
    return <div className={cn(className)}>{TodayHeroSkeleton()}</div>;
  }
  if (section === "wizard") {
    return <div className={cn(className)}>{TodayWizardSkeleton()}</div>;
  }
  if (section === "playbook") {
    return <div className={cn(className)}>{TodayPlaybookSkeleton()}</div>;
  }

  return (
    <div
      className={cn("space-y-6", className)}
      data-testid="today-skeleton"
      aria-busy="true"
      aria-label="Loading Today"
    >
      {TodayHeroSkeleton()}
      {TodayWizardSkeleton()}
      {TodayPlaybookSkeleton()}
    </div>
  );
}
