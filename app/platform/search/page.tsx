import Link from "next/link";

import { assertPlatformPermission, requirePlatformAccess } from "@/lib/platform/platform-guards";
import { platformGlobalSearch } from "@/services/platform/platform-search-service";

export default async function PlatformSearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const ctx = await requirePlatformAccess();
  assertPlatformPermission(ctx, "platform:access");
  const { q = "" } = await searchParams;
  const results = await platformGlobalSearch(q);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Global search</h1>
        <p className="mt-1 text-sm text-zinc-400">Users, workspaces, organizations, and tickets (min 2 characters).</p>
      </div>
      <form className="flex max-w-xl gap-2">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search…"
          className="flex-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white"
        />
        <button
          type="submit"
          className="rounded-lg bg-amber-500/90 px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-amber-400"
        >
          Search
        </button>
      </form>

      {q.trim().length < 2 ? (
        <p className="text-sm text-zinc-500">Type at least two characters to search.</p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <section>
            <h2 className="text-sm font-semibold text-zinc-300">Users</h2>
            <ul className="mt-2 space-y-1 text-sm text-zinc-400">
              {results.users.map((u) => (
                <li key={u.id}>
                  <Link href="/platform/users" className="hover:text-amber-200/90">
                    {u.fullName}
                  </Link>{" "}
                  <span className="font-mono text-xs">{u.email}</span>
                </li>
              ))}
              {results.users.length === 0 ? <li className="text-zinc-600">No matches</li> : null}
            </ul>
          </section>
          <section>
            <h2 className="text-sm font-semibold text-zinc-300">Workspaces</h2>
            <ul className="mt-2 space-y-1 text-sm text-zinc-400">
              {results.workspaces.map((w) => (
                <li key={w.id}>
                  <Link href={`/platform/workspaces/${w.id}`} className="hover:text-amber-200/90">
                    {w.name}
                  </Link>{" "}
                  <span className="text-xs text-zinc-600">{w.active ? "active" : "inactive"}</span>
                </li>
              ))}
              {results.workspaces.length === 0 ? <li className="text-zinc-600">No matches</li> : null}
            </ul>
          </section>
          <section>
            <h2 className="text-sm font-semibold text-zinc-300">Organizations</h2>
            <ul className="mt-2 space-y-1 text-sm text-zinc-400">
              {results.organizations.map((o) => (
                <li key={o.id}>
                  <Link href="/platform/organizations" className="hover:text-amber-200/90">
                    {o.name}
                  </Link>{" "}
                  <span className="font-mono text-xs">{o.slug}</span>
                </li>
              ))}
              {results.organizations.length === 0 ? <li className="text-zinc-600">No matches</li> : null}
            </ul>
          </section>
          <section>
            <h2 className="text-sm font-semibold text-zinc-300">Tickets</h2>
            <ul className="mt-2 space-y-1 text-sm text-zinc-400">
              {results.tickets.map((t) => (
                <li key={t.id}>
                  <Link href={`/platform/support/${t.id}`} className="hover:text-amber-200/90">
                    {t.subject}
                  </Link>{" "}
                  <span className="text-xs text-zinc-600">{t.status}</span>
                </li>
              ))}
              {results.tickets.length === 0 ? <li className="text-zinc-600">No matches</li> : null}
            </ul>
          </section>
        </div>
      )}
    </div>
  );
}
