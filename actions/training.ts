"use server";


import { fail, ok } from "@/lib/action-result";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireUserProfile } from "@/lib/auth";
import { requireTenantActor } from "@/lib/scope/require-tenant-actor";

import {
  canUseTraining,
  type TrainingActorScope,
  type TrainingCapability,
} from "@/lib/training/training-permissions";
import {
  acknowledgeSop,
  archiveSop,
  assignProgram,
  createProgram,
  createSimulation,
  createSop,
  issueCertification,
  publishSop,
  recordProgress,
  revokeCertification,
  runSimulation,
  submitQuizAttempt,
} from "@/services/training/training-service";
import type {
  SOPCategory,
  TrainingCertificationType,
  TrainingDifficulty,
  TrainingLanguage,
  TrainingRoleType,
  TrainingSimulationType,
} from "@prisma/client";

const ROLE_TYPES = [
  "KITCHEN_STAFF", "PACKING_STAFF", "MANAGER", "DELIVERY_DRIVER",
  "PREP_COOK", "LINE_COOK", "EXECUTIVE_CHEF", "OPERATIONS_MANAGER",
  "INVENTORY_MANAGER", "CATERING_COORDINATOR", "CUSTOMER_SUPPORT",
  "ADMIN", "IMPLEMENTATION_MANAGER", "GENERAL",
] as const;
const DIFFICULTIES = ["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"] as const;
const LANGUAGES = ["EN", "FR", "ES", "DE"] as const;
const CERTIFICATION_TYPES = [
  "KITCHEN_CERTIFIED", "PACKING_CERTIFIED", "ROUTE_CERTIFIED",
  "MANAGER_CERTIFIED", "SAFETY_CERTIFIED", "CATERING_CERTIFIED",
  "CUSTOMER_SERVICE_CERTIFIED", "ALLERGEN_CERTIFIED", "CUSTOM",
] as const;
const SIMULATION_TYPES = [
  "LUNCH_RUSH", "DINNER_RUSH", "CATERING_PREP", "GHOST_KITCHEN_SPIKE",
  "FAILED_DELIVERY", "INVENTORY_SHORTAGE", "ALLERGY_INCIDENT",
  "PACKING_MISMATCH", "ROUTE_DELAY", "POS_OUTAGE", "INTEGRATION_FAILURE",
  "KITCHEN_BOTTLENECK", "CUSTOM",
] as const;
const SOP_CATEGORIES = [
  "KITCHEN_PREP", "FOOD_SAFETY", "ALLERGEN_HANDLING", "PACKING",
  "DELIVERY", "CUSTOMER_SERVICE", "OPENING", "CLOSING", "CLEANING",
  "INVENTORY", "EMERGENCIES", "CATERING", "CASH_HANDLING",
  "EQUIPMENT_MAINTENANCE", "OTHER",
] as const;

function scopeFrom(profile: { role: string | null; email: string | null }): TrainingActorScope {
  return { isOwner: true, role: profile.role, email: profile.email };
}

async function gate(cap: TrainingCapability) {
  const { sessionUser: user, dataUserId } = await requireTenantActor();
  const profile = await requireUserProfile();
  const scope = scopeFrom({ role: profile.role ?? null, email: profile.email ?? null });
  if (!canUseTraining(scope, cap)) {
    throw new Error(`You do not have permission to ${cap}.`);
  }
  return { userId: dataUserId, profileId: profile.id };
}

const createProgramSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().max(4000).nullable().optional(),
  roleType: z.enum(ROLE_TYPES).optional(),
  difficulty: z.enum(DIFFICULTIES).optional(),
  estimatedMinutes: z.coerce.number().int().min(5).max(2000).optional(),
  language: z.enum(LANGUAGES).optional(),
  isOnboardingPath: z.boolean().optional(),
  practiceModeOnly: z.boolean().optional(),
  brandId: z.string().uuid().nullable().optional(),
  locationId: z.string().uuid().nullable().optional(),
  seedFromTemplate: z.enum(ROLE_TYPES).nullable().optional(),
});

export async function createProgramAction(formData: FormData): Promise<void> {
  const { userId, profileId } = await gate("training.program.create");
  const parsed = createProgramSchema.parse({
    title: formData.get("title"),
    description: (formData.get("description") as string) || null,
    roleType: (formData.get("roleType") as string) || undefined,
    difficulty: (formData.get("difficulty") as string) || undefined,
    estimatedMinutes: formData.get("estimatedMinutes") || undefined,
    language: (formData.get("language") as string) || undefined,
    isOnboardingPath: formData.get("isOnboardingPath") === "true",
    practiceModeOnly: formData.get("practiceModeOnly") === "true",
    brandId: (formData.get("brandId") as string) || null,
    locationId: (formData.get("locationId") as string) || null,
    seedFromTemplate: (formData.get("seedFromTemplate") as string) || null,
  });
  await createProgram({
    userId,
    performedById: profileId,
    title: parsed.title,
    description: parsed.description ?? null,
    roleType: (parsed.roleType ?? "GENERAL") as TrainingRoleType,
    difficulty: (parsed.difficulty ?? "BEGINNER") as TrainingDifficulty,
    estimatedMinutes: parsed.estimatedMinutes ?? 60,
    language: (parsed.language ?? "EN") as TrainingLanguage,
    isOnboardingPath: parsed.isOnboardingPath ?? false,
    practiceModeOnly: parsed.practiceModeOnly ?? false,
    brandId: parsed.brandId ?? null,
    locationId: parsed.locationId ?? null,
    seedFromTemplate: (parsed.seedFromTemplate as TrainingRoleType | null) ?? null,
  });
  revalidatePath("/dashboard/training");
  revalidatePath("/dashboard/training/programs");
}

const assignSchema = z.object({
  programId: z.string().uuid(),
  assignedToProfileId: z.string().uuid().nullable().optional(),
  assignedToStaffId: z.string().uuid().nullable().optional(),
  assignedToName: z.string().max(255).nullable().optional(),
  assignedToEmail: z.string().email().max(255).nullable().optional(),
  dueAt: z.string().nullable().optional(),
  practiceMode: z.boolean().optional(),
});

export async function assignProgramAction(formData: FormData): Promise<void> {
  const { userId, profileId } = await gate("training.assign");
  const parsed = assignSchema.parse({
    programId: formData.get("programId"),
    assignedToProfileId: (formData.get("assignedToProfileId") as string) || null,
    assignedToStaffId: (formData.get("assignedToStaffId") as string) || null,
    assignedToName: (formData.get("assignedToName") as string) || null,
    assignedToEmail: (formData.get("assignedToEmail") as string) || null,
    dueAt: (formData.get("dueAt") as string) || null,
    practiceMode: formData.get("practiceMode") === "true",
  });
  const res = await assignProgram({
    userId,
    performedById: profileId,
    programId: parsed.programId,
    assignedToProfileId: parsed.assignedToProfileId ?? null,
    assignedToStaffId: parsed.assignedToStaffId ?? null,
    assignedToName: parsed.assignedToName ?? null,
    assignedToEmail: parsed.assignedToEmail ?? null,
    dueAt: parsed.dueAt ? new Date(parsed.dueAt) : null,
    practiceMode: parsed.practiceMode,
  });
  if (!res.ok) throw new Error(res.error);
  revalidatePath("/dashboard/training");
  revalidatePath(`/dashboard/training/programs/${parsed.programId}`);
}

const progressSchema = z.object({
  assignmentId: z.string().uuid(),
  lessonId: z.string().uuid(),
  progressPercent: z.coerce.number().int().min(0).max(100),
  passedQuiz: z.boolean().optional(),
  score: z.coerce.number().int().min(0).max(100).optional(),
  completed: z.boolean().optional(),
});

export async function recordProgressAction(formData: FormData): Promise<void> {
  const { userId, profileId } = await gate("training.progress.write");
  const parsed = progressSchema.parse({
    assignmentId: formData.get("assignmentId"),
    lessonId: formData.get("lessonId"),
    progressPercent: formData.get("progressPercent"),
    passedQuiz: formData.get("passedQuiz") === "true",
    score: formData.get("score") || undefined,
    completed: formData.get("completed") === "true",
  });
  const res = await recordProgress({
    userId,
    performedById: profileId,
    assignmentId: parsed.assignmentId,
    lessonId: parsed.lessonId,
    progressPercent: parsed.progressPercent,
    passedQuiz: parsed.passedQuiz,
    score: parsed.score ?? null,
    completed: parsed.completed,
  });
  if (!res.ok) throw new Error(res.error);
  revalidatePath("/dashboard/training");
  revalidatePath("/dashboard/training/assignments");
}

const quizSchema = z.object({
  quizId: z.string().uuid(),
  assignmentId: z.string().uuid().nullable().optional(),
  answersJson: z.string(),
});

export async function submitQuizAction(formData: FormData): Promise<void> {
  const { userId, profileId } = await gate("training.quiz.attempt");
  const parsed = quizSchema.parse({
    quizId: formData.get("quizId"),
    assignmentId: (formData.get("assignmentId") as string) || null,
    answersJson: formData.get("answersJson"),
  });
  let answers: { questionId: string; selectedOptionId?: string; booleanAnswer?: boolean; orderedIds?: string[] }[] = [];
  try {
    answers = JSON.parse(parsed.answersJson);
  } catch {
    throw new Error("Invalid quiz answers.");
  }
  const res = await submitQuizAttempt({
    userId,
    performedById: profileId,
    quizId: parsed.quizId,
    assignmentId: parsed.assignmentId ?? null,
    answers,
  });
  if (!res.ok) throw new Error(res.error);
  revalidatePath("/dashboard/training");
}

const issueCertSchema = z.object({
  certificationType: z.enum(CERTIFICATION_TYPES),
  recipientProfileId: z.string().uuid().nullable().optional(),
  recipientStaffId: z.string().uuid().nullable().optional(),
  recipientName: z.string().max(255).nullable().optional(),
  recipientEmail: z.string().email().max(255).nullable().optional(),
  programId: z.string().uuid().nullable().optional(),
  assignmentId: z.string().uuid().nullable().optional(),
  expiresAt: z.string().nullable().optional(),
  notes: z.string().max(2000).nullable().optional(),
});

export async function issueCertificationAction(formData: FormData): Promise<void> {
  const { userId, profileId } = await gate("training.cert.issue");
  const parsed = issueCertSchema.parse({
    certificationType: formData.get("certificationType"),
    recipientProfileId: (formData.get("recipientProfileId") as string) || null,
    recipientStaffId: (formData.get("recipientStaffId") as string) || null,
    recipientName: (formData.get("recipientName") as string) || null,
    recipientEmail: (formData.get("recipientEmail") as string) || null,
    programId: (formData.get("programId") as string) || null,
    assignmentId: (formData.get("assignmentId") as string) || null,
    expiresAt: (formData.get("expiresAt") as string) || null,
    notes: (formData.get("notes") as string) || null,
  });
  const res = await issueCertification({
    userId,
    performedById: profileId,
    certificationType: parsed.certificationType as TrainingCertificationType,
    recipientProfileId: parsed.recipientProfileId ?? null,
    recipientStaffId: parsed.recipientStaffId ?? null,
    recipientName: parsed.recipientName ?? null,
    recipientEmail: parsed.recipientEmail ?? null,
    programId: parsed.programId ?? null,
    assignmentId: parsed.assignmentId ?? null,
    expiresAt: parsed.expiresAt ? new Date(parsed.expiresAt) : null,
    notes: parsed.notes ?? null,
  });
  if (!res.ok) throw new Error("Could not issue certification.");
  revalidatePath("/dashboard/training/certifications");
  revalidatePath("/dashboard/training");
}

const revokeCertSchema = z.object({
  certId: z.string().uuid(),
  reason: z.string().min(1).max(1000),
});

export async function revokeCertificationAction(formData: FormData): Promise<void> {
  const { userId, profileId } = await gate("training.cert.revoke");
  const parsed = revokeCertSchema.parse({
    certId: formData.get("certId"),
    reason: formData.get("reason"),
  });
  const res = await revokeCertification({
    userId,
    performedById: profileId,
    certId: parsed.certId,
    reason: parsed.reason,
  });
  if (!res.ok) throw new Error(res.error);
  revalidatePath("/dashboard/training/certifications");
}

const createSimSchema = z.object({
  title: z.string().min(1).max(255),
  simulationType: z.enum(SIMULATION_TYPES),
  moduleId: z.string().uuid().nullable().optional(),
});

export async function createSimulationAction(formData: FormData): Promise<void> {
  const { userId, profileId } = await gate("training.program.create");
  const parsed = createSimSchema.parse({
    title: formData.get("title"),
    simulationType: formData.get("simulationType"),
    moduleId: (formData.get("moduleId") as string) || null,
  });
  await createSimulation({
    userId,
    performedById: profileId,
    title: parsed.title,
    simulationType: parsed.simulationType as TrainingSimulationType,
    moduleId: parsed.moduleId ?? null,
  });
  revalidatePath("/dashboard/training/simulations");
}

const runSimSchema = z.object({
  simulationId: z.string().uuid(),
  responsesJson: z.string(),
});

export async function runSimulationAction(formData: FormData): Promise<void> {
  const { userId, profileId } = await gate("training.sim.run");
  const parsed = runSimSchema.parse({
    simulationId: formData.get("simulationId"),
    responsesJson: formData.get("responsesJson"),
  });
  let responses: { stepId: string; correct: boolean; timeSeconds?: number; notes?: string }[] = [];
  try {
    responses = JSON.parse(parsed.responsesJson);
  } catch {
    throw new Error("Invalid simulation responses.");
  }
  const res = await runSimulation({
    userId,
    performedById: profileId,
    simulationId: parsed.simulationId,
    responses,
    runByProfileId: profileId,
  });
  if (!res.ok) throw new Error(res.error);
  revalidatePath("/dashboard/training/simulations");
}

const createSopSchema = z.object({
  title: z.string().min(1).max(255),
  category: z.enum(SOP_CATEGORIES),
  content: z.string().min(1).max(20000),
  summary: z.string().max(2000).nullable().optional(),
  language: z.enum(LANGUAGES).optional(),
  brandId: z.string().uuid().nullable().optional(),
  locationId: z.string().uuid().nullable().optional(),
  requiresAcknowledgement: z.boolean().optional(),
});

export async function createSopAction(formData: FormData): Promise<void> {
  const { userId, profileId } = await gate("training.sop.create");
  const parsed = createSopSchema.parse({
    title: formData.get("title"),
    category: formData.get("category"),
    content: formData.get("content"),
    summary: (formData.get("summary") as string) || null,
    language: (formData.get("language") as string) || undefined,
    brandId: (formData.get("brandId") as string) || null,
    locationId: (formData.get("locationId") as string) || null,
    requiresAcknowledgement: formData.get("requiresAcknowledgement") !== "false",
  });
  await createSop({
    userId,
    performedById: profileId,
    title: parsed.title,
    category: parsed.category as SOPCategory,
    content: parsed.content,
    summary: parsed.summary ?? null,
    language: (parsed.language ?? "EN") as TrainingLanguage,
    brandId: parsed.brandId ?? null,
    locationId: parsed.locationId ?? null,
    requiresAcknowledgement: parsed.requiresAcknowledgement,
  });
  revalidatePath("/dashboard/training/sops");
}

const publishSopSchema = z.object({ sopId: z.string().uuid() });

export async function publishSopAction(formData: FormData): Promise<void> {
  const { userId, profileId } = await gate("training.sop.publish");
  const parsed = publishSopSchema.parse({ sopId: formData.get("sopId") });
  const res = await publishSop({ userId, performedById: profileId, sopId: parsed.sopId });
  if (!res.ok) throw new Error(res.error);
  revalidatePath("/dashboard/training/sops");
}

export async function archiveSopAction(formData: FormData): Promise<void> {
  const { userId, profileId } = await gate("training.sop.publish");
  const parsed = publishSopSchema.parse({ sopId: formData.get("sopId") });
  const res = await archiveSop({ userId, performedById: profileId, sopId: parsed.sopId });
  if (!res.ok) throw new Error(res.error);
  revalidatePath("/dashboard/training/sops");
}

const ackSopSchema = z.object({
  sopId: z.string().uuid(),
  acknowledgedProfileId: z.string().uuid().nullable().optional(),
  acknowledgedStaffId: z.string().uuid().nullable().optional(),
  acknowledgedName: z.string().max(255).nullable().optional(),
  acknowledgedEmail: z.string().email().max(255).nullable().optional(),
  notes: z.string().max(2000).nullable().optional(),
});

export async function acknowledgeSopAction(formData: FormData): Promise<void> {
  const { userId, profileId } = await gate("training.sop.acknowledge");
  const parsed = ackSopSchema.parse({
    sopId: formData.get("sopId"),
    acknowledgedProfileId: (formData.get("acknowledgedProfileId") as string) || null,
    acknowledgedStaffId: (formData.get("acknowledgedStaffId") as string) || null,
    acknowledgedName: (formData.get("acknowledgedName") as string) || null,
    acknowledgedEmail: (formData.get("acknowledgedEmail") as string) || null,
    notes: (formData.get("notes") as string) || null,
  });
  const res = await acknowledgeSop({
    userId,
    performedById: profileId,
    sopId: parsed.sopId,
    acknowledgedProfileId: parsed.acknowledgedProfileId ?? null,
    acknowledgedStaffId: parsed.acknowledgedStaffId ?? null,
    acknowledgedName: parsed.acknowledgedName ?? null,
    acknowledgedEmail: parsed.acknowledgedEmail ?? null,
    notes: parsed.notes ?? null,
  });
  if (!res.ok) throw new Error(res.error);
  revalidatePath("/dashboard/training/sops");
}
