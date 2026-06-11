import { format } from "date-fns";

import { updateDemoRequestStatus } from "@/actions/growth";
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
import type { DemoRequestStatus } from "@prisma/client";

const STATUSES: DemoRequestStatus[] = [
  "NEW",
  "QUALIFIED",
  "SCHEDULED",
  "COMPLETED",
  "NO_SHOW",
  "WON",
  "LOST",
  "NURTURE",
];

export default async function GrowthDemoRequestsPage() {
  const rows = await prisma.demoRequest.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Demo requests</CardTitle>
        <CardDescription>{rows.length} rows · founder scheduling queue.</CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Created</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Business</TableHead>
              <TableHead>Preferred time</TableHead>
              <TableHead>Follow-up</TableHead>
              <TableHead>Meeting</TableHead>
              <TableHead className="w-[120px]">Update</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                  {format(r.createdAt, "MMM d, yyyy")}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="rounded-full">
                    {r.status}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium">{r.fullName}</TableCell>
                <TableCell className="text-sm">{r.email}</TableCell>
                <TableCell>{r.businessName}</TableCell>
                <TableCell className="max-w-[180px] truncate text-xs">
                  {r.preferredTime ?? "—"}
                </TableCell>
                <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                  {r.followUpAt ? format(r.followUpAt, "MMM d, yyyy") : "—"}
                </TableCell>
                <TableCell className="max-w-[120px] truncate text-xs">
                  {r.meetingUrl ? (
                    <a href={r.meetingUrl} className="text-primary underline" target="_blank" rel="noreferrer">
                      Link
                    </a>
                  ) : (
                    "—"
                  )}
                </TableCell>
                <TableCell>
                  <form
                    action={async (fd) => {
                      "use server";
                      await updateDemoRequestStatus({
                        id: r.id,
                        status: fd.get("status") as DemoRequestStatus,
                      });
                    }}
                    className="flex gap-1"
                  >
                    <select
                      name="status"
                      defaultValue={r.status}
                      className="h-8 max-w-[110px] rounded-md border border-input bg-background text-xs"
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
