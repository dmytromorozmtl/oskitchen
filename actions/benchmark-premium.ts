"use server";

import { revalidatePath } from "next/cache";

import { fail, ok } from "@/lib/action-result";
import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { safeError } from "@/lib/security";
import {
  activateBenchmarkPremiumSubscription,
  activateBenchmarkPremiumTrial,
  loadBenchmarkPremiumDashboard,
} from "@/services/ai/benchmark-2.0-service";

const PREMIUM_PATH = "/dashboard/analytics/benchmarks/premium";
const BENCHMARK_PATH = "/dashboard/analytics/benchmarks";

export async function refreshBenchmarkPremiumDashboardAction() {
  try {
    const { workspaceId } = await requireTenantActor();
    if (!workspaceId) return fail("Workspace required.");

    const dashboard = await loadBenchmarkPremiumDashboard(workspaceId);
    revalidatePath(PREMIUM_PATH);
    revalidatePath(BENCHMARK_PATH);
    return ok(dashboard);
  } catch (e) {
    return fail(safeError(e));
  }
}

export async function startBenchmarkPremiumTrialAction() {
  try {
    const { workspaceId } = await requireTenantActor();
    if (!workspaceId) return fail("Workspace required.");

    const dashboard = await activateBenchmarkPremiumTrial(workspaceId);
    revalidatePath(PREMIUM_PATH);
    revalidatePath(BENCHMARK_PATH);
    return ok({ message: "14-day Benchmark Premium trial started.", dashboard });
  } catch (e) {
    return fail(safeError(e));
  }
}

export async function subscribeBenchmarkPremiumAction() {
  try {
    const { workspaceId } = await requireTenantActor();
    if (!workspaceId) return fail("Workspace required.");

    const dashboard = await activateBenchmarkPremiumSubscription(workspaceId);
    revalidatePath(PREMIUM_PATH);
    revalidatePath(BENCHMARK_PATH);
    return ok({
      message:
        "Benchmark Premium activated for this workspace. Connect STRIPE_BENCHMARK_PREMIUM_PRICE_ID for live billing.",
      dashboard,
    });
  } catch (e) {
    return fail(safeError(e));
  }
}
