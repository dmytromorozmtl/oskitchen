"use server";


import { fail, ok } from "@/lib/action-result";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import type { DemoVerticalSlug } from "@/lib/demo-verticals";
import { parseDemoVertical } from "@/lib/demo-verticals";
import { prisma } from "@/lib/prisma";
import {
  areDemoWorkspaceMutationsAllowed,
  demoWorkspaceBlockedInProductionMessage,
} from "@/lib/production-guards";
import { safeError } from "@/lib/security";
import { trackUsageEvent } from "@/lib/usage";
import { clearWorkspaceSampleData, seedDemoWorkspace } from "@/services/demo-data";

export async function importDemoWorkspace(options?: {
  vertical?: DemoVerticalSlug;
}) {
  try {
    if (!areDemoWorkspaceMutationsAllowed()) {
      return { error: demoWorkspaceBlockedInProductionMessage() };
    }
    const { sessionUser: user, dataUserId } = await requireTenantActor();
    const vertical = options?.vertical ?? "meal-prep";
    await seedDemoWorkspace(user.id, vertical);
    void trackUsageEvent({
      userId: dataUserId,
      eventName: "demo_launched",
      route: "/demo",
      metadata: { vertical },
    });
    await prisma.userProfile.update({
      where: { id: user.id },
      data: { onboardingCompleted: true, onboardingStep: 6 },
    });
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/order-hub");
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function importDemoWorkspaceFromForm(formData: FormData) {
  const vertical = parseDemoVertical(formData.get("vertical"));
  const result = await importDemoWorkspace({ vertical });
  if ("error" in result && result.error) {
    redirect(`/demo?error=${encodeURIComponent(result.error)}`);
  }
  redirect("/dashboard/today");
}

export async function resetDemoWorkspace() {
  try {
    if (!areDemoWorkspaceMutationsAllowed()) {
      return { error: demoWorkspaceBlockedInProductionMessage() };
    }
    const { sessionUser: user, dataUserId } = await requireTenantActor();
    const settings = await prisma.kitchenSettings.findUnique({
      where: { userId: dataUserId },
    });
    if (!settings?.demoMode) {
      return { error: "Demo reset is only available while demo mode is active." };
    }
    await clearWorkspaceSampleData(user.id);
    await prisma.kitchenSettings.update({
      where: { userId: dataUserId },
      data: { demoMode: false },
    });
    revalidatePath("/dashboard");
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}
