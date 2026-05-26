"use client";

import { resetGoldenScenarioAction, seedGoldenScenarioAction } from "@/actions/demo-golden-scenario";
import { Button } from "@/components/ui/button";
import type { DemoSeedPlan } from "@/lib/demo/demo-data-contract";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export function GoldenDemoScenarioControls({ scenarios, lastSeededAt }: { scenarios: DemoSeedPlan[]; lastSeededAt: Date | null }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const runSeed = (id: string) => {
    setMessage(null);
    start(async () => {
      const r = await seedGoldenScenarioAction(id);
      if ("error" in r && r.error) setMessage(r.error);
      else setMessage("Scenario seeded. Refreshing…");
      router.refresh();
    });
  };

  const runReset = () => {
    setMessage(null);
    start(async () => {
      const r = await resetGoldenScenarioAction();
      if ("error" in r && r.error) setMessage(r.error);
      else setMessage("Demo data cleared.");
      router.refresh();
    });
  };

  return (
    <div className="space-y-4 rounded-xl border border-border/70 bg-muted/20 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold">Seed and reset</h2>
          <p className="text-xs text-muted-foreground">
            Last seeded: {lastSeededAt ? lastSeededAt.toISOString().slice(0, 19) : "never"} (UTC, audit trail).
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" className="rounded-full" disabled={pending} onClick={runReset}>
          Reset demo workspace
        </Button>
      </div>
      {message ? <p className="text-sm text-amber-900">{message}</p> : null}
      <ul className="space-y-3">
        {scenarios.map((s) => (
          <li key={s.scenarioId} className="rounded-lg border border-border/60 bg-background/80 p-3 text-sm">
            <div className="font-medium">{s.title}</div>
            <p className="mt-1 text-xs text-muted-foreground">Vertical: {s.vertical}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Button type="button" size="sm" className="rounded-full" disabled={pending} onClick={() => runSeed(s.scenarioId)}>
                Seed scenario
              </Button>
              <Button type="button" size="sm" variant="secondary" className="rounded-full" asChild>
                <a href={`/demo/${s.vertical}`}>Open walkthrough</a>
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
