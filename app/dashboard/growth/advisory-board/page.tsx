import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUserProfile } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AdvisoryBoardDashboardPage() {
  const user = await requireUserProfile();
  if (user.role !== "OWNER") return <div className="p-8">Owner access required.</div>;
  const applications = await prisma.advisoryBoardApplication.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <h1 className="text-3xl font-semibold tracking-tight">Advisory board applications</h1>
      {applications.map((app) => (
        <Card key={app.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{app.businessName}</CardTitle>
              <Badge>{app.status}</Badge>
            </div>
            <CardDescription>{app.fullName} · {app.email} · {app.weeklyOrderVolume ?? "volume TBD"}</CardDescription>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}
