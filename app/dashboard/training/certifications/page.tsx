import { IssueCertForm, RevokeCertForm } from "@/components/dashboard/training/cert-forms";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTrainingPageAccess } from "@/lib/training/training-page-access";
import { prisma } from "@/lib/prisma";
import {
  isCertificationActive,
  isCertificationExpiringSoon,
} from "@/lib/training/certification-engine";
import { CERTIFICATION_LABEL } from "@/lib/training/training-engine";
import { listCertifications } from "@/services/training/training-service";

export default async function CertificationsPage() {
  const { userId: dataUserId, canManageCerts } = await getTrainingPageAccess();
  const [certs, staff] = await Promise.all([
    listCertifications(dataUserId),
    prisma.staffMember.findMany({
      where: { userId: dataUserId, active: true },
      select: { id: true, name: true, email: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Certifications</h1>
        <p className="text-sm text-muted-foreground">
          Issue and revoke certifications. Active certifications gate go-live and high-risk simulations.
        </p>
      </div>

      {canManageCerts ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Issue a certification</CardTitle>
            <CardDescription>Issuing without an expiry uses the default validity per type.</CardDescription>
          </CardHeader>
          <CardContent>
            <IssueCertForm staff={staff} />
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">All certifications</CardTitle>
        </CardHeader>
        <CardContent>
          {certs.length === 0 ? (
            <p className="text-sm text-muted-foreground">No certifications issued yet.</p>
          ) : (
            <ul className="space-y-2">
              {certs.map((c) => {
                const active = isCertificationActive(c);
                const expiring = isCertificationExpiringSoon(c);
                return (
                  <li key={c.id} className="flex flex-wrap items-center justify-between gap-3 rounded-md border p-2 text-sm">
                    <div>
                      <p className="font-medium">
                        {CERTIFICATION_LABEL[c.certificationType]}
                        {c.revokedAt ? <span className="ml-2 text-rose-600">· Revoked</span> : null}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Recipient:{" "}
                        {c.recipient?.fullName ?? c.recipient?.email ??
                          c.recipientStaff?.name ?? c.recipientName ?? c.recipientEmail ?? "—"}
                        {" · "}Issued {c.issuedAt.toISOString().slice(0, 10)}
                        {c.expiresAt ? ` · Expires ${c.expiresAt.toISOString().slice(0, 10)}` : ""}
                      </p>
                      {c.revokedReason ? (
                        <p className="text-xs text-rose-600">Reason: {c.revokedReason}</p>
                      ) : null}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {active ? (
                        expiring ? (
                          <Badge className="bg-amber-100 text-amber-700">Expiring soon</Badge>
                        ) : (
                          <Badge className="bg-emerald-100 text-emerald-700">Active</Badge>
                        )
                      ) : (
                        <Badge className="bg-rose-100 text-rose-700">{c.revokedAt ? "Revoked" : "Expired"}</Badge>
                      )}
                      {canManageCerts && active && !c.revokedAt ? (
                        <RevokeCertForm certId={c.id} />
                      ) : null}
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
