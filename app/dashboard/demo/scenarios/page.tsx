import Link from "next/link";

import { GoldenDemoScenarioControls } from "@/components/demo/golden-demo-scenario-controls";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { getLastDemoScenarioSeedAt } from "@/services/demo/demo-seed-service";
import { listGoldenDemoScenarioPlans } from "@/services/demo/demo-scenario-service";

export default async function DemoScenariosDashboardPage() {
  const { sessionUser: user, dataUserId } = await getTenantActor();
  const scenarios = listGoldenDemoScenarioPlans();
  const lastSeededAt = await getLastDemoScenarioSeedAt(dataUserId);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Golden demo scenarios</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Six repeatable stories for sales and QA. Seeding reuses the hardened demo import engine — it replaces demo
            operational data for your workspace, enables demo mode, and records an audit entry. Production requires{" "}
            <span className="font-medium text-foreground">DEMO_MODE_ENABLED</span>.
          </p>
        </div>
        <Button asChild className="rounded-full">
          <Link href="/demo">Launch sales demo</Link>
        </Button>
      </div>

      <GoldenDemoScenarioControls scenarios={scenarios} lastSeededAt={lastSeededAt} />

      <div className="grid gap-4 lg:grid-cols-2">
        {scenarios.map((s) => (
          <Card key={s.scenarioId} className="border-border/80">
            <CardHeader className="pb-2">
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle className="text-lg">{s.title}</CardTitle>
                <Badge variant="secondary" className="rounded-full text-[10px]">
                  {s.vertical}
                </Badge>
              </div>
              <CardDescription>Preview of records touched by seeding (no mutation until you click Seed).</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <ol className="list-inside list-decimal text-sm text-muted-foreground">
                {s.lines.map((line) => (
                  <li key={`${s.scenarioId}-${line.title}`}>
                    <span className="font-medium text-foreground">{line.title}</span> — {line.detail}
                  </li>
                ))}
              </ol>
              <ul className="list-inside list-disc text-xs text-amber-900">
                {s.safetyNotes.map((n) => (
                  <li key={n}>{n}</li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-2">
                <Button asChild size="sm" variant="secondary" className="rounded-full">
                  <Link href={`/demo/${s.vertical}`}>Open vertical preset</Link>
                </Button>
                <Button asChild size="sm" variant="outline" className="rounded-full">
                  <Link href="/dashboard/today">Today command center</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
