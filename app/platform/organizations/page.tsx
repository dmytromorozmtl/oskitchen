import { prisma } from "@/lib/prisma";
import { assertPlatformPermission, requirePlatformAccess } from "@/lib/platform/platform-guards";

export default async function PlatformOrganizationsPage() {
  const ctx = await requirePlatformAccess();
  assertPlatformPermission(ctx, "platform:organizations:read");
  const rows = await prisma.organization.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      owner: { select: { email: true } },
      _count: { select: { workspaces: true, members: true } },
    },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-white">Organizations</h1>
      <div className="overflow-x-auto rounded-lg border border-zinc-800">
        <table className="w-full text-left text-sm text-zinc-200">
          <thead className="bg-zinc-900 text-xs uppercase text-zinc-500">
            <tr>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Slug</th>
              <th className="px-3 py-2">Owner</th>
              <th className="px-3 py-2">Workspaces</th>
              <th className="px-3 py-2">Members</th>
              <th className="px-3 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((o) => (
              <tr key={o.id} className="border-t border-zinc-800">
                <td className="px-3 py-2">{o.name}</td>
                <td className="px-3 py-2 font-mono text-xs">{o.slug}</td>
                <td className="px-3 py-2 font-mono text-xs">{o.owner.email}</td>
                <td className="px-3 py-2">{o._count.workspaces}</td>
                <td className="px-3 py-2">{o._count.members}</td>
                <td className="px-3 py-2">{o.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
