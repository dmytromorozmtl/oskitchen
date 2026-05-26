import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { prisma } from "@/lib/prisma";

export default async function EnterpriseImplementationPage() {
  const { userId } = await getTenantActor();
  const project = await prisma.implementationProject.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { stakeholders: true, waves: true, risks: true, signoffs: true },
  });
  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Enterprise implementation</h1>
        <p className="mt-2 text-muted-foreground">Stakeholders, go-live waves, risks, and sign-offs for larger customers.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardHeader><CardTitle>{project?.stakeholders.length ?? 0}</CardTitle><CardDescription>Stakeholders</CardDescription></CardHeader></Card>
        <Card><CardHeader><CardTitle>{project?.waves.length ?? 0}</CardTitle><CardDescription>Go-live waves</CardDescription></CardHeader></Card>
        <Card><CardHeader><CardTitle>{project?.risks.length ?? 0}</CardTitle><CardDescription>Risks</CardDescription></CardHeader></Card>
        <Card><CardHeader><CardTitle>{project?.signoffs.length ?? 0}</CardTitle><CardDescription>Sign-offs</CardDescription></CardHeader></Card>
      </div>
      {!project ? <p className="text-sm text-muted-foreground">Create an implementation project first.</p> : null}
    </div>
  );
}
