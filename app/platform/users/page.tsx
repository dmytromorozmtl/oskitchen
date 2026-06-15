import { startImpersonationFormAction } from "@/actions/platform-impersonation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { assertPlatformPermission, requirePlatformAccess } from "@/lib/platform/platform-guards";
import { isSuperAdminUser } from "@/lib/platform-super-bypass";
import { prisma } from "@/lib/prisma";

export default async function PlatformUsersPage() {
  const ctx = await requirePlatformAccess();
  assertPlatformPermission(ctx, "platform:users:read");
  const me = await getSessionUser();
  const canImpersonate = me ? await isSuperAdminUser(me.id, me.email) : false;
  const users = await prisma.userProfile.findMany({
    orderBy: { createdAt: "desc" },
    take: 80,
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      onboardingCompleted: true,
      createdAt: true,
    },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-white">Users</h1>
      <p className="text-sm text-zinc-400">Cross-tenant directory — impersonation is super-admin only.</p>
      <div className="overflow-x-auto rounded-lg border border-zinc-800">
        <table className="w-full text-left text-sm text-zinc-200">
          <thead className="bg-zinc-900 text-xs uppercase text-zinc-500">
            <tr>
              <th className="px-3 py-2">Email</th>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Role</th>
              <th className="px-3 py-2">Onboarding</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-zinc-800">
                <td className="px-3 py-2 font-mono text-xs">{u.email}</td>
                <td className="px-3 py-2">{u.fullName}</td>
                <td className="px-3 py-2">{u.role}</td>
                <td className="px-3 py-2">{u.onboardingCompleted ? "done" : "pending"}</td>
                <td className="px-3 py-2 text-right">
                  <Link href={`/platform/preview/${u.id}`} className="mr-2 text-xs text-amber-200/90 hover:underline">
                    Preview
                  </Link>
                  {canImpersonate ? (
                    <form action={startImpersonationFormAction} className="inline-flex flex-col items-end gap-1">
                      <input type="hidden" name="targetUserId" value={u.id} />
                      <input type="hidden" name="reason" value="platform_user_table" />
                      <input
                        name="totpCode"
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        placeholder="TOTP (6)"
                        maxLength={8}
                        className="h-7 w-24 rounded border border-zinc-700 bg-zinc-900 px-2 text-xs text-zinc-100"
                      />
                      <input
                        name="stepUpToken"
                        type="password"
                        placeholder="Step-up token"
                        className="h-7 w-36 rounded border border-zinc-700 bg-zinc-900 px-2 text-xs text-zinc-100"
                      />
                      <Button type="submit" size="sm" variant="secondary" className="h-8 rounded-full">
                        Impersonate
                      </Button>
                    </form>
                  ) : (
                    <span className="text-zinc-600">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
