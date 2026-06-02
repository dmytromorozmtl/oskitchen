"use server";

import { redirect } from "next/navigation";

import { fail } from "@/lib/action-result";
import { parseDemoVertical } from "@/lib/demo-verticals";
import { trackUsageEvent } from "@/lib/usage";
import { createDemoWorkspace } from "@/services/demo/demo-environment-service";

export async function launchGuestDemoAction(formData: FormData) {
  const vertical = parseDemoVertical(formData.get("vertical") ?? "restaurant");
  const result = await createDemoWorkspace(vertical);

  if (!result.ok) {
    redirect(`/demo?error=${encodeURIComponent(result.error)}`);
  }

  void trackUsageEvent({
    userId: result.userId,
    eventName: "demo_launched",
    route: "/demo",
    metadata: {
      mode: "guest_environment",
      vertical,
      expiresAt: result.expiresAt.toISOString(),
    },
  });

  redirect(result.actionLink);
}

export async function launchGuestDemoForApi(vertical?: string) {
  const result = await createDemoWorkspace(parseDemoVertical(vertical ?? "restaurant"));
  if (!result.ok) return fail(result.error);
  return { ok: true as const, actionLink: result.actionLink, expiresAt: result.expiresAt };
}
