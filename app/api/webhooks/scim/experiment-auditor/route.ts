import { NextResponse } from "next/server";
import { z } from "zod";

import { provisionExperimentAuditorFromScim } from "@/lib/auth/experiment-auditor-scim";
import { logger } from "@/lib/logger";

const bodySchema = z.object({
  externalId: z.string().min(1),
  email: z.string().email(),
  active: z.boolean(),
  displayName: z.string().optional(),
});

/**
 * SCIM / IdP webhook — provision PLATFORM_READONLY_AUDITOR (STANDARD_USER).
 * Auth: Bearer EXPERIMENT_SCIM_WEBHOOK_SECRET
 */
export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const result = await provisionExperimentAuditorFromScim(
    parsed.data,
    request.headers.get("authorization"),
  );

  if (!result.ok) {
    const status = result.error === "Unauthorized" ? 401 : 400;
    return NextResponse.json({ error: result.error }, { status });
  }

  logger.info("scim_experiment_auditor_provision", {
    email: parsed.data.email,
    active: parsed.data.active,
    userId: result.userId,
  });

  return NextResponse.json({ ok: true, userId: result.userId });
}
