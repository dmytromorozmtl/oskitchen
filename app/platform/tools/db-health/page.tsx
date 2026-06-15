import Link from "next/link";

import { checkDatabaseHealth } from "@/lib/db/health";
import { isEnvConfigured } from "@/lib/env";
import { assertPlatformPermission, requirePlatformAccess } from "@/lib/platform/platform-guards";

export default async function PlatformDbHealthPage() {
  const ctx = await requirePlatformAccess();
  assertPlatformPermission(ctx, "platform:tools:run");
  const db = await checkDatabaseHealth();
  return (
    <div className="max-w-xl space-y-4 text-zinc-200">
      <h1 className="text-2xl font-semibold text-white">DB health</h1>
      <p>Core env configured: {isEnvConfigured() ? "yes" : "no"}</p>
      <p>Database OK: {db.ok ? "yes" : "no"}</p>
      <p>Latency: {db.latencyMs} ms</p>
      {!db.ok ? <p className="text-rose-400">{db.error}</p> : null}
      <Link href="/platform/tools" className="text-sm underline">
        ← Tools
      </Link>
    </div>
  );
}
