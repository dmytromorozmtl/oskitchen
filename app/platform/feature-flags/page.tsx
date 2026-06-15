import { assertPlatformPermission, requirePlatformAccess } from "@/lib/platform/platform-guards";
import { prisma } from "@/lib/prisma";
import { listPilotOnlyReadinessOptions } from "@/lib/product/module-readiness";
import {
  ClearWorkspacePilotEnrollmentButton,
  SetWorkspacePilotEnrollmentForm,
} from "@/components/platform/pilot-enrollment-form";
import { listActivePilotWorkspaceEnrollments } from "@/services/platform/workspace-pilot-enrollment-service";

export default async function PlatformFeatureFlagsPage() {
  const ctx = await requirePlatformAccess();
  assertPlatformPermission(ctx, "platform:access");
  const pilotOptions = listPilotOnlyReadinessOptions();
  const [flags, pilotEnrollments] = await Promise.all([
    prisma.featureFlag.findMany({ orderBy: { key: "asc" } }),
    listActivePilotWorkspaceEnrollments(),
  ]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-white">Feature flags</h1>
      <p className="text-sm text-zinc-400">
        Global keys from <span className="font-mono text-zinc-500">feature_flags</span>. Workspace overrides live
        under entitlements.
      </p>
      <div className="overflow-x-auto rounded-lg border border-zinc-800">
        <table className="w-full text-left text-sm text-zinc-200">
          <thead className="bg-zinc-900 text-xs uppercase text-zinc-500">
            <tr>
              <th className="px-3 py-2">Key</th>
              <th className="px-3 py-2">Enabled</th>
              <th className="px-3 py-2">Description</th>
            </tr>
          </thead>
          <tbody>
            {flags.map((f) => (
              <tr key={f.id} className="border-t border-zinc-800">
                <td className="px-3 py-2 font-mono text-xs">{f.key}</td>
                <td className="px-3 py-2">{f.enabled ? "yes" : "no"}</td>
                <td className="px-3 py-2 text-zinc-400">{f.description ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="rounded-lg border border-zinc-800 p-4">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-white">Pilot workspace enrollments</h2>
          <p className="text-sm text-zinc-400">
            Platform-managed pilot cohorts for module rollout. These enrollments unlock pilot modules
            in dashboard settings without exposing them to every workspace.
          </p>
        </div>
        {ctx.permissions.has("platform:feature-flags:write") ? (
          <SetWorkspacePilotEnrollmentForm pilotOptions={pilotOptions} />
        ) : (
          <p className="text-xs text-zinc-600">
            Writes require platform:feature-flags:write (ops admin).
          </p>
        )}
        <div className="mt-4 overflow-x-auto rounded-lg border border-zinc-800">
          <table className="w-full text-left text-sm text-zinc-200">
            <thead className="bg-zinc-900 text-xs uppercase text-zinc-500">
              <tr>
                <th className="px-3 py-2">Workspace</th>
                <th className="px-3 py-2">Workspace ID</th>
                <th className="px-3 py-2">Pilot module</th>
                <th className="px-3 py-2">Updated</th>
                <th className="px-3 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {pilotEnrollments.length === 0 ? (
                <tr className="border-t border-zinc-800">
                  <td className="px-3 py-3 text-zinc-500" colSpan={5}>
                    No active pilot workspace enrollments.
                  </td>
                </tr>
              ) : (
                pilotEnrollments.map((row) => (
                  <tr key={row.id} className="border-t border-zinc-800">
                    <td className="px-3 py-2">
                      {row.workspace.name ?? "Unnamed workspace"}
                    </td>
                    <td className="px-3 py-2 font-mono text-xs text-zinc-400">
                      {row.workspaceId}
                    </td>
                    <td className="px-3 py-2">
                      {pilotOptions.find((option) => option.id === row.readinessId)?.label ??
                        row.readinessId ??
                        "Unknown"}
                    </td>
                    <td className="px-3 py-2 text-zinc-400">
                      {row.updatedAt.toISOString().slice(0, 10)}
                    </td>
                    <td className="px-3 py-2">
                      {ctx.permissions.has("platform:feature-flags:write") && row.readinessId ? (
                        <ClearWorkspacePilotEnrollmentButton
                          workspaceId={row.workspaceId}
                          readinessId={row.readinessId}
                        />
                      ) : null}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      {!ctx.permissions.has("platform:feature-flags:write") ? (
        <p className="text-xs text-zinc-600">Writes require platform:feature-flags:write (ops admin).</p>
      ) : null}
    </div>
  );
}
