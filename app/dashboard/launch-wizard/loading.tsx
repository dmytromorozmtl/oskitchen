import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function LaunchWizardLoading() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <Card>
        <CardContent className="space-y-4 pt-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-full max-w-xl" />
          <Skeleton className="h-2 w-full" />
        </CardContent>
      </Card>
      <div className="grid gap-3 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-40 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}
