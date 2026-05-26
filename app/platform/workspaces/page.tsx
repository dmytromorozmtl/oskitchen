import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { BUSINESS_TYPE_LABELS } from "@/lib/business-modes";
import { assertPlatformPermission, requirePlatformAccess } from "@/lib/platform/platform-guards";

export default async function PlatformWorkspacesPage() {
  const ctx = await requirePlatformAccess();
  assertPlatformPermission(ctx, "platform:workspaces:read");
  const rows = await prisma.workspace.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      owner: {
        select: {
          email: true,
          kitchenSettings: { select: { businessType: true } },
        },
      },
      organization: { select: { name: true, slug: true } },
    },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-white">Workspaces</h1>
      {rows.length === 0 ? (
        <p className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6 text-sm text-zinc-500">
          No client workspaces yet. Create the first workspace or convert a beta application.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-zinc-800">
          <table className="w-full text-left text-sm text-zinc-200">
            <thead className="bg-zinc-900 text-xs uppercase text-zinc-500">
              <tr>
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Owner</th>
                <th className="px-3 py-2">Organization</th>
                <th className="px-3 py-2">Business type</th>
                <th className="px-3 py-2">Active</th>
                <th className="px-3 py-2">Open</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((w) => (
                <tr key={w.id} className="border-t border-zinc-800">
                  <td className="px-3 py-2">{w.name}</td>
                  <td className="px-3 py-2 font-mono text-xs">{w.owner.email}</td>
                  <td className="px-3 py-2">
                    {w.organization ? (
                      <Link href={`/platform/organizations`} className="underline">
                        {w.organization.name}
                      </Link>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-3 py-2">
                    {w.owner.kitchenSettings?.businessType
                      ? BUSINESS_TYPE_LABELS[w.owner.kitchenSettings.businessType]
                      : "—"}
                  </td>
                  <td className="px-3 py-2">{w.active ? "yes" : "no"}</td>
                  <td className="px-3 py-2">
                    <Link href={`/platform/workspaces/${w.id}`} className="text-amber-200/90 hover:underline">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
