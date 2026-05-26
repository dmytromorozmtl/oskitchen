import {
  CreateSimulationForm,
  SimulationRunner,
} from "@/components/dashboard/training/simulation-forms";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import {
  SIMULATION_TEMPLATES,
  SIMULATION_TYPE_LABEL,
} from "@/lib/training/simulation-engine";
import { listSimulations } from "@/services/training/training-service";

export default async function SimulationsPage() {
  const { sessionUser: user, dataUserId } = await getTenantActor();
  const sims = await listSimulations(dataUserId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Simulations</h1>
        <p className="text-sm text-muted-foreground">
          Sandboxed rehearsals for rushes, allergy incidents, route delays, POS outages, and more. Runs never
          touch production data.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Create a simulation</CardTitle>
          <CardDescription>Pre-built scenario steps will be loaded; you can customize later.</CardDescription>
        </CardHeader>
        <CardContent>
          <CreateSimulationForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Active simulations</CardTitle>
        </CardHeader>
        <CardContent>
          {sims.length === 0 ? (
            <p className="text-sm text-muted-foreground">No simulations yet.</p>
          ) : (
            <ul className="space-y-3">
              {sims.map((s) => {
                const template = SIMULATION_TEMPLATES[s.simulationType];
                const steps = template.steps.map((st) => ({
                  id: st.id,
                  title: st.title,
                  description: st.description,
                  expectedAction: st.expectedAction,
                }));
                return (
                  <li key={s.id} className="rounded-lg border p-3 text-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="font-medium">{s.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {SIMULATION_TYPE_LABEL[s.simulationType]} · Passing score {template.passingScore}%
                        </p>
                      </div>
                      <Badge variant="outline">{s.runs.length} run{s.runs.length === 1 ? "" : "s"}</Badge>
                    </div>
                    <div className="mt-3">
                      <SimulationRunner simulationId={s.id} steps={steps} />
                    </div>
                    {s.runs.length > 0 ? (
                      <details className="mt-3">
                        <summary className="cursor-pointer text-xs text-muted-foreground">Recent runs</summary>
                        <ul className="mt-2 space-y-1 text-xs">
                          {s.runs.map((r) => (
                            <li key={r.id} className="rounded border px-2 py-1">
                              {r.startedAt.toISOString().slice(0, 16).replace("T", " ")} · {r.result} · {r.score ?? 0}%
                            </li>
                          ))}
                        </ul>
                      </details>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
