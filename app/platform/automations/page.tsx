import { redactFreeText } from "@/lib/observability/redaction";
import { prisma } from "@/lib/prisma";
import { assertPlatformPermission, requirePlatformAccess } from "@/lib/platform/platform-guards";

export default async function PlatformAutomationsPage() {
  const ctx = await requirePlatformAccess();
  assertPlatformPermission(ctx, "platform:automations:read");
  const rows = await prisma.automationExecution.findMany({
    orderBy: { startedAt: "desc" },
    take: 100,
    include: {
      rule: { select: { name: true, userId: true } },
    },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-white">Automation executions</h1>
      <div className="overflow-x-auto rounded-lg border border-zinc-800">
        <table className="w-full text-left text-sm text-zinc-200">
          <thead className="bg-zinc-900 text-xs uppercase text-zinc-500">
            <tr>
              <th className="px-3 py-2">Rule</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Error (redacted)</th>
              <th className="px-3 py-2">Started</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((e) => (
              <tr key={e.id} className="border-t border-zinc-800">
                <td className="px-3 py-2">{e.rule.name}</td>
                <td className="px-3 py-2">{e.status}</td>
                <td className="max-w-md truncate px-3 py-2 text-xs text-zinc-400">
                  {e.errorMessage ? redactFreeText(e.errorMessage) : "—"}
                </td>
                <td className="px-3 py-2 text-xs text-zinc-500">{e.startedAt.toISOString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
