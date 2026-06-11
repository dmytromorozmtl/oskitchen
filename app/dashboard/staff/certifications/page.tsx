import Link from "next/link";

import { CertStatusBadge } from "@/components/dashboard/staff/badges";
import { RevokeCertButton } from "@/components/dashboard/staff/cert-forms";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getStaffPageAccess } from "@/lib/staff/staff-page-access";
import { prisma } from "@/lib/prisma";
import { isCertExpiringSoon } from "@/lib/staff/staff-certifications";

export default async function CertificationsPage() {
  const { userId, canCertWrite: canEdit } = await getStaffPageAccess();

  const certs = await prisma.staffCertification.findMany({
    where: { userId },
    orderBy: [{ status: "asc" }, { expiresAt: "asc" }],
    include: { staffMember: { select: { id: true, name: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Staff certifications</h1>
        <p className="text-sm text-muted-foreground">
          {certs.length} certification{certs.length === 1 ? "" : "s"}. Soon-to-expire entries are flagged.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">All certifications</CardTitle>
          <CardDescription>Add or revoke from each staff detail page.</CardDescription>
        </CardHeader>
        <CardContent>
          {certs.length === 0 ? (
            <p className="text-sm text-muted-foreground">No staff certifications yet.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {certs.map((c) => {
                const expiring = isCertExpiringSoon(c);
                return (
                  <li key={c.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-2">
                    <div>
                      <p className="font-medium">
                        {c.certificationType}
                        {expiring ? <span className="ml-2 text-amber-700">· Expiring soon</span> : null}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        <Link href={`/dashboard/staff/${c.staffMember.id}`} className="underline">{c.staffMember.name}</Link>
                        {c.issuedAt ? ` · Issued ${c.issuedAt.toISOString().slice(0, 10)}` : ""}
                        {c.expiresAt ? ` · Expires ${c.expiresAt.toISOString().slice(0, 10)}` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <CertStatusBadge status={c.status} />
                      {canEdit && c.status === "ACTIVE" ? <RevokeCertButton certId={c.id} /> : null}
                    </div>
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
