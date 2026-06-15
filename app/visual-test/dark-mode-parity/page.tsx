import { ErrorState } from "@/components/feedback/error-state";
import { PageSkeleton } from "@/components/feedback/loading-skeleton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SKELETON_SURFACE_CLASS } from "@/lib/design/loading-skeleton-patterns";

/** Design-system surfaces for light/dark visual regression baselines. */
export default function VisualTestDarkModeParityPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8" data-testid="visual-dark-mode-parity">
      <header className="space-y-2">
        <h1 className="text-lg font-semibold">Dark mode parity fixture</h1>
        <p className="text-sm text-muted-foreground">
          Error, skeleton, card, and status tokens — snapshotted in light and dark.
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        <Badge variant="default">LIVE</Badge>
        <Badge variant="secondary">BETA</Badge>
        <Badge variant="outline">Draft</Badge>
        <Badge variant="destructive">Overdue</Badge>
      </div>

      <Card className={SKELETON_SURFACE_CLASS}>
        <CardHeader>
          <CardTitle>Operator briefing card</CardTitle>
          <CardDescription>Shared card + muted foreground tokens.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Revenue pulse, labour cost, and integration health preview surfaces.
        </CardContent>
      </Card>

      <PageSkeleton />

      <ErrorState
        title="Could not load Today"
        description="Visual regression fixture — retry and navigation actions are static."
        homeHref="/dashboard/today"
        homeLabel="Back to Today"
        showIllustration
      />
    </div>
  );
}
