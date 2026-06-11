import {
  AcknowledgeSopForm,
  CreateSopForm,
  SopStatusButtons,
} from "@/components/dashboard/training/sop-forms";
import { SopStatusBadge } from "@/components/dashboard/training/status-badges";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTrainingPageAccess } from "@/lib/training/training-page-access";
import { prisma } from "@/lib/prisma";
import { SOP_CATEGORY_LABEL } from "@/lib/training/sop-engine";
import { listSops } from "@/services/training/training-service";

export default async function SopsPage() {
  const {
    userId: dataUserId,
    canManageSops,
    canPublishSops,
    canParticipate,
  } = await getTrainingPageAccess();
  const [sops, staff] = await Promise.all([
    listSops(dataUserId),
    prisma.staffMember.findMany({
      where: { userId: dataUserId, active: true },
      select: { id: true, name: true, email: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">SOP library</h1>
        <p className="text-sm text-muted-foreground">
          Author, publish, and track acknowledgements of standard operating procedures across the workspace.
        </p>
      </div>

      {canManageSops ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">New SOP</CardTitle>
            <CardDescription>Draft → publish to push to staff for acknowledgement.</CardDescription>
          </CardHeader>
          <CardContent>
            <CreateSopForm />
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">All SOPs</CardTitle>
        </CardHeader>
        <CardContent>
          {sops.length === 0 ? (
            <p className="text-sm text-muted-foreground">No SOPs yet.</p>
          ) : (
            <ul className="space-y-3">
              {sops.map((s) => (
                <li key={s.id} className="rounded-lg border p-3 text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-medium">{s.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {SOP_CATEGORY_LABEL[s.category]} · v{s.version} · {s.language}
                        {s.requiresAcknowledgement ? " · Acknowledgement required" : ""}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <SopStatusBadge status={s.status} />
                      {canPublishSops ? <SopStatusButtons sopId={s.id} status={s.status} /> : null}
                    </div>
                  </div>
                  {s.summary ? <p className="mt-2 text-xs text-muted-foreground">{s.summary}</p> : null}
                  <details className="mt-2">
                    <summary className="cursor-pointer text-xs text-muted-foreground">View content</summary>
                    <pre className="mt-2 whitespace-pre-wrap text-xs">{s.content}</pre>
                  </details>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {s.acknowledgements.length} acknowledgement{s.acknowledgements.length === 1 ? "" : "s"}
                  </p>
                  {canParticipate && s.status === "ACTIVE" && s.requiresAcknowledgement ? (
                    <div className="mt-2">
                      <AcknowledgeSopForm sopId={s.id} staff={staff} />
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
