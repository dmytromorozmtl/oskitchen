import Link from "next/link";

import { assertPlatformPermission, requirePlatformAccess } from "@/lib/platform/platform-guards";

export default async function PlatformToolsPage() {
  const ctx = await requirePlatformAccess();
  assertPlatformPermission(ctx, "platform:tools:run");
  const links = [
    { href: "/platform/tools/db-health", label: "Database health" },
    { href: "/api/health", label: "API health (JSON)" },
  ] as const;
  return (
    <div className="space-y-4 text-zinc-200">
      <h1 className="text-2xl font-semibold text-white">Internal tools</h1>
      <ul className="list-inside list-disc space-y-2 text-sm">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="underline">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
      <p className="text-xs text-zinc-500">
        Dangerous actions (replay, cache purge, diagnostics export) require confirmation, reason, and audit — wire
        through platform-tools-service next.
      </p>
    </div>
  );
}
