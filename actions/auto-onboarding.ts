"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { fail, ok } from "@/lib/action-result";
import type { AutoOnboardingCuisine } from "@/lib/onboarding/auto-onboarding-types";
import { requireMutationPermission } from "@/lib/permissions/mutation-access";
import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { safeError } from "@/lib/security";
import {
  applyAutoOnboardingPlan,
  generateAutoOnboardingPlan,
  parseAutoOnboardingAnswers,
} from "@/services/onboarding/auto-onboarding-service";

const cuisineSchema = z.enum([
  "full_service",
  "qsr",
  "bakery",
  "bar",
  "ghost_kitchen",
  "catering",
  "food_truck",
  "pizza",
  "sushi",
  "coffee_shop",
]);

const answersSchema = z.object({
  cuisine: cuisineSchema,
  seatCount: z.coerce.number().int().min(0).max(5000),
  delivers: z.union([z.boolean(), z.literal("true"), z.literal("false")]).transform(
    (v) => v === true || v === "true",
  ),
  averageOrderValue: z.coerce.number().min(0).max(10_000),
  specialRequirements: z.string().max(500).optional(),
  businessName: z.string().max(200).optional(),
});

export async function generateAutoOnboardingPlanAction(formData: FormData) {
  try {
    const access = await requireMutationPermission("workspace.settings");
    if (!access.ok) return fail(access.error);

    const parsed = answersSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message ?? "Invalid answers");
    }

    const answers = parseAutoOnboardingAnswers({
      ...parsed.data,
      cuisine: parsed.data.cuisine as AutoOnboardingCuisine,
    });

    const plan = await generateAutoOnboardingPlan(answers, {
      openAiApiKey: process.env.OPENAI_API_KEY,
    });

    return ok({ plan, answers });
  } catch (e) {
    return fail(safeError(e));
  }
}

export async function applyAutoOnboardingPlanAction(input: {
  answers: z.infer<typeof answersSchema>;
  plan: unknown;
}) {
  try {
    const access = await requireMutationPermission("workspace.settings");
    if (!access.ok) return fail(access.error);

    const parsedAnswers = answersSchema.safeParse(input.answers);
    if (!parsedAnswers.success) {
      return fail(parsedAnswers.error.issues[0]?.message ?? "Invalid answers");
    }

    const answers = parseAutoOnboardingAnswers({
      ...parsedAnswers.data,
      cuisine: parsedAnswers.data.cuisine as AutoOnboardingCuisine,
    });

    const plan = input.plan as Awaited<ReturnType<typeof generateAutoOnboardingPlan>>;
    if (!plan?.version || plan.version !== "auto-onboarding-v1") {
      return fail("Invalid setup plan — generate a new plan first.");
    }

    const { sessionUser, userId } = await requireTenantActor();
    const result = await applyAutoOnboardingPlan({
      ownerUserId: userId,
      sessionUserId: sessionUser.id,
      plan,
      answers,
    });

    revalidatePath("/dashboard");
    revalidatePath("/onboarding");
    revalidatePath("/dashboard/onboarding/auto");

    return ok({
      nextUrl: result.nextUrl,
      menuId: result.menuId,
      productCount: result.productCount,
    });
  } catch (e) {
    return fail(safeError(e));
  }
}
