import Link from "next/link";

import { assertPlatformPermission, requirePlatformAccess } from "@/lib/platform/platform-guards";
import { prisma } from "@/lib/prisma";

export default async function PlatformPreviewUserPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const ctx = await requirePlatformAccess();
  assertPlatformPermission(ctx, "platform:users:read");
  const { userId } = await params;
  const profile = await prisma.userProfile.findUnique({
    where: { id: userId },
    include: {
      subscription: true,
      kitchenSettings: { select: { businessName: true, demoMode: true } },
    },
  });
  if (!profile) {
    return <p className="text-zinc-400">User not found.</p>;
  }

  const [orders, integrations] = await Promise.all([
    prisma.order.count({ where: { userId } }).catch(() => 0),
    prisma.integrationConnection.count({ where: { userId } }).catch(() => 0),
  ]);

  return (
    <div className="max-w-2xl space-y-4 text-zinc-200">
      <h1 className="text-2xl font-semibold text-white">Tenant preview</h1>
      <p className="text-sm text-zinc-400">
        Read-only snapshot for support — does not switch your customer dashboard session yet.
      </p>
      <dl className="grid gap-2 text-sm">
        <dt className="text-zinc-500">Email</dt>
        <dd className="font-mono text-xs">{profile.email}</dd>
        <dt className="text-zinc-500">Business</dt>
        <dd>{profile.kitchenSettings?.businessName ?? profile.companyName ?? "—"}</dd>
        <dt className="text-zinc-500">Plan</dt>
        <dd>{profile.subscription?.plan ?? "—"}</dd>
        <dt className="text-zinc-500">Orders</dt>
        <dd>{orders}</dd>
        <dt className="text-zinc-500">Integrations</dt>
        <dd>{integrations}</dd>
      </dl>
      <Link href="/platform/users" className="text-sm underline">
        ← Users
      </Link>
    </div>
  );
}
