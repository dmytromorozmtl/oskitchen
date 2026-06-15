import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GOLDEN_DEMO_SCENARIOS } from "@/lib/demo/golden-demo-scenarios";
import {
  auditGoldenDemoScenarioPlans,
  summarizeDemoScenarioPlanAudit,
} from "@/services/demo/demo-scenario-audit-service";

export default function PlatformDemoGuidePage() {
  const auditRows = auditGoldenDemoScenarioPlans();
  const summary = summarizeDemoScenarioPlanAudit(auditRows);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Demo & vertical presets</h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-400">
          Workspace demo data is launched from the public <span className="text-zinc-200">/demo</span> hub after
          sign-in — it never silently mutates a workspace without confirmation. Golden scenarios are static checklists
          aligned with <span className="font-mono text-zinc-300">npm run check-demo-scenarios</span> (plan lines only,
          no DB seeding).
        </p>
      </div>

      <Card className="border-zinc-800 bg-zinc-900/80">
        <CardHeader>
          <CardTitle className="text-lg text-white">Static plan audit</CardTitle>
          <CardDescription className="text-zinc-400">
            PASS {summary.passCount} · WARN {summary.warnCount} · FAIL {summary.failCount} — see{" "}
            <code className="text-zinc-200">docs/GOLDEN_DEMO_SEED_COMPLETENESS_CHECK.md</code>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-xs text-zinc-400">
          {auditRows.map((r) => (
            <div key={r.scenarioId} className="rounded-lg border border-zinc-800 px-3 py-2">
              <span className="font-mono text-zinc-200">{r.scenarioId}</span>{" "}
              <span className={r.status === "FAIL" ? "text-red-300" : r.status === "WARN" ? "text-amber-200" : "text-emerald-300"}>
                [{r.status}]
              </span>
              {r.missingMust.length ? (
                <p className="mt-1 text-red-200/90">Missing must: {r.missingMust.join(", ")}</p>
              ) : null}
              {r.missingShould.length ? (
                <p className="mt-1 text-amber-100/80">Missing should: {r.missingShould.join(", ")}</p>
              ) : null}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-zinc-800 bg-zinc-900/80">
        <CardHeader>
          <CardTitle className="text-lg text-white">Golden scenarios (internal)</CardTitle>
          <CardDescription className="text-zinc-400">
            Maps to workspace owner checklist — no live credentials created by these descriptions.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          {GOLDEN_DEMO_SCENARIOS.map((s) => (
            <div key={s.scenarioId} className="rounded-lg border border-zinc-800 p-3 text-sm text-zinc-300">
              <p className="font-medium text-white">{s.title}</p>
              <p className="mt-1 text-xs text-zinc-500">Vertical: {s.vertical}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-zinc-800 bg-zinc-900/80">
        <CardHeader>
          <CardTitle className="text-lg text-white">Workspace demo</CardTitle>
          <CardDescription className="text-zinc-400">
            Presets align with golden scenarios documented in <code className="text-zinc-200">docs/GOLDEN_DEMO_SCENARIOS.md</code>.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button asChild variant="secondary" className="rounded-full">
            <Link href="/demo">Open /demo</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-full border-zinc-600 text-zinc-100">
            <Link href="/dashboard/demo/scenarios">In-app scenario checklist</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
