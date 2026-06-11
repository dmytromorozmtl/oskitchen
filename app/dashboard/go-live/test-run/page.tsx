import { runGoLiveTestRunFormAction } from "@/actions/implementation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { prisma } from "@/lib/prisma";

export default async function GoLiveTestRunPage() {
  const { sessionUser: user, dataUserId } = await getTenantActor();
  const runs = await prisma.goLiveTestRun.findMany({
    where: { userId: dataUserId },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Go-live test run</h1>
        <p className="mt-2 text-muted-foreground">
          Simulate a production day before launch: mappings, staffing, production, packing, and open tasks.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Run simulation</CardTitle>
          <CardDescription>This creates a report only; it does not mutate orders or inventory.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={runGoLiveTestRunFormAction} className="flex flex-col gap-3 md:flex-row">
            <Input name="selectedOrders" placeholder="Order IDs or date range note (optional)" />
            <Button type="submit">Generate test run report</Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {runs.map((run) => (
          <Card key={run.id}>
            <CardHeader>
              <CardTitle>{run.status.replaceAll("_", " ")}</CardTitle>
              <CardDescription>{run.createdAt.toLocaleString()}</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="overflow-auto rounded-lg bg-muted p-4 text-xs">
                {JSON.stringify(run.resultJson, null, 2)}
              </pre>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
