import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUserProfile } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function SalesInquiriesPage() {
  const user = await requireUserProfile();
  if (user.role !== "OWNER") return <div className="p-8">Owner access required.</div>;
  const inquiries = await prisma.salesInquiry.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <h1 className="text-3xl font-semibold tracking-tight">Sales inquiries</h1>
      {inquiries.map((inquiry) => (
        <Card key={inquiry.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{inquiry.company ?? inquiry.fullName}</CardTitle>
              <Badge>{inquiry.status}</Badge>
            </div>
            <CardDescription>{inquiry.email} · {inquiry.weeklyOrders ?? "volume TBD"} · {inquiry.createdAt.toLocaleString()}</CardDescription>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}
