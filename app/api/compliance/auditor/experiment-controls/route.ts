import { NextResponse } from "next/server";

import { userHasExperimentAuditorAccess } from "@/lib/auth/experiment-auditor-access";
import {
  buildSoc2Type2EvidenceBinder,
  EXPERIMENT_CRON_CONTROLS,
} from "@/lib/compliance/soc2-control-mapping";
import { requireSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * Read-only auditor portal API — cron → SOC2 control mapping + latest binder snapshot.
 */
export async function GET() {
  const user = await requireSessionUser();
  const ok = await userHasExperimentAuditorAccess(user.id);
  if (!ok) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const binder = buildSoc2Type2EvidenceBinder();

  return NextResponse.json({
    ok: true,
    readOnly: true,
    crons: EXPERIMENT_CRON_CONTROLS,
    latestBinder: binder,
  });
}
