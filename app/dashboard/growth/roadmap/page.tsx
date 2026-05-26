import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import type { AppFeedbackStatus } from "@prisma/client";

const COLUMNS: { status: AppFeedbackStatus; title: string }[] = [
  { status: "NEW", title: "Requested" },
  { status: "REVIEWED", title: "Under review" },
  { status: "PLANNED", title: "Planned" },
  { status: "IN_PROGRESS", title: "Building" },
  { status: "DONE", title: "Shipped" },
];

export default async function GrowthRoadmapPage() {
  const items = await prisma.appFeedback.findMany({
    where: {
      status: { in: COLUMNS.map((c) => c.status) },
    },
    orderBy: { createdAt: "desc" },
    take: 400,
  });

  return (
    <div className="grid gap-4 lg:grid-cols-5">
      {COLUMNS.map((col) => (
        <Card key={col.status} className="flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">{col.title}</CardTitle>
            <CardDescription className="text-xs">{col.status}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col gap-2">
            {items
              .filter((i) => i.status === col.status)
              .map((i) => (
                <div
                  key={i.id}
                  className="rounded-lg border border-border/70 bg-muted/30 p-3 text-xs"
                >
                  <div className="flex flex-wrap items-center gap-1">
                    <Badge variant="outline" className="text-[10px]">
                      {i.type}
                    </Badge>
                    {i.featureArea ? (
                      <Badge variant="secondary" className="text-[10px]">
                        {i.featureArea}
                      </Badge>
                    ) : null}
                  </div>
                  <p className="mt-2 font-medium text-foreground">{i.title}</p>
                  <p className="mt-1 line-clamp-3 text-muted-foreground">{i.message}</p>
                </div>
              ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
