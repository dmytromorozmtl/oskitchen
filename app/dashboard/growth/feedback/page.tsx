import { format } from "date-fns";

import { updateAppFeedbackStatus } from "@/actions/growth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { prisma } from "@/lib/prisma";
import type { AppFeedbackStatus } from "@prisma/client";

const STATUSES: AppFeedbackStatus[] = [
  "NEW",
  "REVIEWED",
  "PLANNED",
  "IN_PROGRESS",
  "DONE",
  "REJECTED",
];

export default async function GrowthFeedbackPage() {
  const rows = await prisma.appFeedback.findMany({
    orderBy: { createdAt: "desc" },
    take: 300,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Feedback inbox</CardTitle>
        <CardDescription>
          Submissions from the in-app feedback button — route captured automatically.
        </CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>When</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Route</TableHead>
              <TableHead>Area</TableHead>
              <TableHead className="w-[130px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                  {format(r.createdAt, "MMM d HH:mm")}
                </TableCell>
                <TableCell className="text-xs">{r.type}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className="rounded-full">
                    {r.status}
                  </Badge>
                </TableCell>
                <TableCell className="max-w-[220px] font-medium">
                  <span className="line-clamp-2">{r.title}</span>
                </TableCell>
                <TableCell className="max-w-[140px] truncate text-xs">{r.route}</TableCell>
                <TableCell className="text-xs">{r.featureArea ?? "—"}</TableCell>
                <TableCell>
                  <form
                    action={async (fd) => {
                      "use server";
                      await updateAppFeedbackStatus({
                        id: r.id,
                        status: fd.get("status") as AppFeedbackStatus,
                      });
                    }}
                    className="flex gap-1"
                  >
                    <select
                      name="status"
                      defaultValue={r.status}
                      className="h-8 max-w-[120px] rounded-md border border-input bg-background text-xs"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    <Button type="submit" size="sm" variant="outline" className="h-8 px-2 text-xs">
                      Save
                    </Button>
                  </form>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
