import type {
  Prisma,
  SOPCategory,
  SOPStatus,
  TrainingAssignmentStatus,
  TrainingCertificationType,
  TrainingDifficulty,
  TrainingLanguage,
  TrainingProgressStatus,
  TrainingRoleType,
  TrainingSimulationType,
} from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { ownerScopedAnd } from "@/lib/scope/workspace-resource-scope";
import {
  sopAcknowledgementListWhereForOwner,
  sopDocumentByIdWhereForOwner,
  sopDocumentListWhereForOwner,
  trainingAssignmentByIdWhereForOwner,
  trainingAssignmentListWhereForOwner,
  trainingCertificationByIdWhereForOwner,
  trainingCertificationListWhereForOwner,
  trainingEventListWhereForOwner,
  trainingProgramByIdWhereForOwner,
  trainingProgramListWhereForOwner,
  trainingSimulationByIdWhereForOwner,
  trainingSimulationListWhereForOwner,
  trainingSimulationRunListWhereForOwner,
} from "@/lib/scope/workspace-training-scope";
import {
  ROLE_PROGRAM_TEMPLATES,
  type ModuleSeed,
  type ProgramSeed,
} from "@/lib/training/assignment-engine";
import {
  defaultExpiry,
  isCertificationActive,
  isCertificationExpiringSoon,
} from "@/lib/training/certification-engine";
import { gradeQuiz, type QuizAnswer, type QuizDefinition } from "@/lib/training/quiz-engine";
import {
  gradeSimulation,
  SIMULATION_TEMPLATES,
  type SimulationResponse,
} from "@/lib/training/simulation-engine";
import { slugify, ROLE_TO_CERTIFICATION, deriveAssignmentStatus } from "@/lib/training/training-engine";
import { clampProgressPercent, deriveProgressStatus } from "@/lib/training/progress-engine";

async function recordEvent(input: {
  userId: string;
  eventType: string;
  programId?: string | null;
  assignmentId?: string | null;
  performedById?: string | null;
  summary?: string | null;
  metadata?: Record<string, unknown> | null;
}): Promise<void> {
  await prisma.trainingEvent.create({
    data: {
      userId: input.userId,
      eventType: input.eventType,
      programId: input.programId ?? undefined,
      assignmentId: input.assignmentId ?? undefined,
      performedById: input.performedById ?? undefined,
      summary: input.summary ?? undefined,
      metadataJson: input.metadata ? (input.metadata as unknown as Prisma.InputJsonValue) : undefined,
    },
  });
}

export async function listPrograms(userId: string) {
  return prisma.trainingProgram.findMany({
    where: await trainingProgramListWhereForOwner(userId),
    orderBy: [{ createdAt: "desc" }],
    include: {
      brand: { select: { id: true, name: true } },
      location: { select: { id: true, name: true } },
      modules: { orderBy: { orderIndex: "asc" }, include: { lessons: { orderBy: { orderIndex: "asc" } } } },
      assignments: { select: { id: true, status: true } },
    },
  });
}

export async function getProgram(userId: string, programId: string) {
  return prisma.trainingProgram.findFirst({
    where: await trainingProgramByIdWhereForOwner(userId, programId),
    include: {
      modules: {
        orderBy: { orderIndex: "asc" },
        include: { lessons: { orderBy: { orderIndex: "asc" }, include: { quizzes: true } } },
      },
      assignments: {
        orderBy: { assignedAt: "desc" },
        include: {
          assignedTo: { select: { id: true, fullName: true, email: true } },
          assignedToStaff: { select: { id: true, name: true, email: true } },
          assignedBy: { select: { id: true, fullName: true, email: true } },
        },
      },
      certifications: true,
    },
  });
}

export type CreateProgramInput = {
  userId: string;
  performedById?: string | null;
  title: string;
  description?: string | null;
  roleType?: TrainingRoleType | null;
  difficulty?: TrainingDifficulty;
  estimatedMinutes?: number;
  language?: TrainingLanguage;
  isOnboardingPath?: boolean;
  practiceModeOnly?: boolean;
  brandId?: string | null;
  locationId?: string | null;
  seedFromTemplate?: TrainingRoleType | null;
};

function seedSlug(base: string, existing: Set<string>): string {
  let candidate = slugify(base);
  if (candidate.length === 0) candidate = "item";
  let attempt = candidate;
  let n = 2;
  while (existing.has(attempt)) {
    attempt = `${candidate}-${n}`;
    n += 1;
  }
  existing.add(attempt);
  return attempt;
}

async function seedModules(
  programId: string,
  seed: ProgramSeed,
): Promise<void> {
  const moduleSlugs = new Set<string>();
  for (let i = 0; i < seed.modules.length; i += 1) {
    const m: ModuleSeed = seed.modules[i];
    const slug = seedSlug(m.slug ?? m.title, moduleSlugs);
    const mod = await prisma.trainingModule.create({
      data: {
        programId,
        title: m.title,
        slug,
        moduleType: m.moduleType,
        orderIndex: i,
        simulationEnabled: m.simulationEnabled ?? false,
        quizEnabled: m.quizEnabled ?? false,
        required: m.required ?? true,
      },
    });
    const lessonSlugs = new Set<string>();
    for (let j = 0; j < m.lessons.length; j += 1) {
      const l = m.lessons[j];
      const lessonSlug = seedSlug(l.slug ?? l.title, lessonSlugs);
      await prisma.trainingLesson.create({
        data: {
          moduleId: mod.id,
          title: l.title,
          slug: lessonSlug,
          lessonType: l.lessonType,
          content: l.content,
          estimatedMinutes: l.estimatedMinutes ?? 10,
          orderIndex: j,
          required: l.required ?? true,
        },
      });
    }
  }
}

export async function createProgram(input: CreateProgramInput) {
  const roleType: TrainingRoleType = input.roleType ?? "GENERAL";
  const template = ROLE_PROGRAM_TEMPLATES[input.seedFromTemplate ?? roleType];
  const title = input.title || template.title;
  const baseSlug = slugify(title) || "training-program";

  const programScope = await trainingProgramListWhereForOwner(input.userId);
  const existing = await prisma.trainingProgram.findMany({
    where: { AND: [programScope, { slug: { startsWith: baseSlug } }] },
    select: { slug: true },
  });
  let slug = baseSlug;
  if (existing.some((p) => p.slug === slug)) {
    let n = 2;
    while (existing.some((p) => p.slug === `${baseSlug}-${n}`)) n += 1;
    slug = `${baseSlug}-${n}`;
  }

  const program = await prisma.trainingProgram.create({
    data: {
      userId: input.userId,
      brandId: input.brandId ?? undefined,
      locationId: input.locationId ?? undefined,
      title,
      slug,
      description: input.description ?? template.description,
      roleType,
      difficulty: input.difficulty ?? template.difficulty,
      estimatedMinutes: input.estimatedMinutes ?? template.estimatedMinutes,
      language: input.language ?? "EN",
      isOnboardingPath: input.isOnboardingPath ?? template.isOnboardingPath ?? false,
      practiceModeOnly: input.practiceModeOnly ?? false,
      createdById: input.performedById ?? undefined,
    },
  });
  if (input.seedFromTemplate !== null) {
    await seedModules(program.id, template);
  }
  await recordEvent({
    userId: input.userId,
    eventType: "PROGRAM_CREATED",
    programId: program.id,
    performedById: input.performedById ?? null,
    summary: program.title,
  });
  return program;
}

export type AssignProgramInput = {
  userId: string;
  performedById?: string | null;
  programId: string;
  assignedToProfileId?: string | null;
  assignedToStaffId?: string | null;
  assignedToName?: string | null;
  assignedToEmail?: string | null;
  dueAt?: Date | null;
  practiceMode?: boolean;
};

export async function assignProgram(input: AssignProgramInput) {
  const program = await prisma.trainingProgram.findFirst({
    where: await trainingProgramByIdWhereForOwner(input.userId, input.programId),
    select: { id: true, title: true, practiceModeOnly: true },
  });
  if (!program) return { ok: false as const, error: "Program not found" };
  const practice = input.practiceMode || program.practiceModeOnly;
  const assignment = await prisma.trainingAssignment.create({
    data: {
      userId: input.userId,
      programId: program.id,
      assignedToProfileId: input.assignedToProfileId ?? undefined,
      assignedToStaffId: input.assignedToStaffId ?? undefined,
      assignedToName: input.assignedToName ?? undefined,
      assignedToEmail: input.assignedToEmail ?? undefined,
      assignedById: input.performedById ?? undefined,
      dueAt: input.dueAt ?? undefined,
      practiceMode: practice,
      status: "ASSIGNED",
    },
  });
  await recordEvent({
    userId: input.userId,
    eventType: "ASSIGNMENT_CREATED",
    programId: program.id,
    assignmentId: assignment.id,
    performedById: input.performedById ?? null,
    summary: `Assigned ${program.title}`,
    metadata: { practiceMode: practice },
  });
  return { ok: true as const, assignment };
}

export type RecordProgressInput = {
  userId: string;
  performedById?: string | null;
  assignmentId: string;
  lessonId: string;
  progressPercent: number;
  passedQuiz?: boolean;
  score?: number | null;
  completed?: boolean;
};

export async function recordProgress(input: RecordProgressInput) {
  const assignment = await prisma.trainingAssignment.findFirst({
    where: await trainingAssignmentByIdWhereForOwner(input.userId, input.assignmentId),
    select: {
      id: true, userId: true, programId: true, dueAt: true, practiceMode: true,
      assignedToProfileId: true, assignedToStaffId: true, status: true,
    },
  });
  if (!assignment) return { ok: false as const, error: "Assignment not found" };
  const lesson = await prisma.trainingLesson.findFirst({
    where: {
      id: input.lessonId,
      module: { program: await trainingProgramListWhereForOwner(input.userId) },
    },
    select: { id: true, moduleId: true },
  });
  if (!lesson) return { ok: false as const, error: "Lesson not found" };
  const percent = clampProgressPercent(input.progressPercent);
  const completedNow = input.completed === true || percent >= 100;
  const startedAt = percent > 0 ? new Date() : undefined;
  const completedAt = completedNow ? new Date() : undefined;
  const status: TrainingProgressStatus = deriveProgressStatus({
    startedAt: startedAt ?? null,
    completedAt: completedAt ?? null,
    progressPercent: percent,
    passedQuiz: input.passedQuiz,
  });

  const progress = await prisma.trainingProgress.upsert({
    where: {
      id: (await prisma.trainingProgress.findFirst({
        where: await ownerScopedAnd(input.userId, {
          lessonId: lesson.id,
          assignmentId: assignment.id,
        }),
        select: { id: true },
      }))?.id ?? "00000000-0000-0000-0000-000000000000",
    },
    update: {
      progressPercent: percent,
      status,
      startedAt: startedAt ?? undefined,
      completedAt: completedAt ?? undefined,
      score: input.score ?? undefined,
    },
    create: {
      userId: input.userId,
      assignmentId: assignment.id,
      lessonId: lesson.id,
      traineeProfileId: assignment.assignedToProfileId ?? undefined,
      traineeStaffId: assignment.assignedToStaffId ?? undefined,
      progressPercent: percent,
      status,
      startedAt,
      completedAt,
      score: input.score ?? undefined,
      practiceMode: assignment.practiceMode,
    },
  });

  // Recompute assignment completion from all lessons
  const lessonsInProgram = await prisma.trainingLesson.count({
    where: { module: { programId: assignment.programId } },
  });
  const completedLessons = await prisma.trainingProgress.count({
    where: await ownerScopedAnd(input.userId, {
      assignmentId: assignment.id,
      status: "COMPLETED",
    }),
  });
  const completion = lessonsInProgram === 0 ? 0 : Math.round((completedLessons / lessonsInProgram) * 100);
  const nextStatus: TrainingAssignmentStatus = deriveAssignmentStatus({
    completionPercent: completion,
    hasFailedQuiz: input.passedQuiz === false,
    needsManagerReview: false,
    dueAt: assignment.dueAt,
  });
  await prisma.trainingAssignment.update({
    where: { id: assignment.id },
    data: { completionPercent: completion, status: nextStatus },
  });
  await recordEvent({
    userId: input.userId,
    eventType: "PROGRESS_RECORDED",
    programId: assignment.programId,
    assignmentId: assignment.id,
    performedById: input.performedById ?? null,
    summary: `Lesson ${lesson.id.slice(0, 8)} → ${status}`,
    metadata: { percent, status },
  });
  return { ok: true as const, progress, completion, nextStatus };
}

export type SubmitQuizInput = {
  userId: string;
  performedById?: string | null;
  quizId: string;
  assignmentId?: string | null;
  lessonId?: string | null;
  answers: QuizAnswer[];
  attemptByProfileId?: string | null;
};

export async function submitQuizAttempt(input: SubmitQuizInput) {
  const quiz = await prisma.trainingQuiz.findFirst({
    where: {
      id: input.quizId,
      lesson: { module: { program: await trainingProgramListWhereForOwner(input.userId) } },
    },
    include: { lesson: { select: { id: true, moduleId: true, module: { select: { programId: true } } } } },
  });
  if (!quiz) return { ok: false as const, error: "Quiz not found" };
  const definition: QuizDefinition = {
    questions: (quiz.questionsJson as unknown as QuizDefinition["questions"]) ?? [],
    passingScore: quiz.passingScore,
  };
  const grade = gradeQuiz(definition, input.answers);
  const attemptUserId = input.attemptByProfileId ?? input.performedById ?? input.userId;
  const attempt = await prisma.trainingQuizAttempt.create({
    data: {
      quizId: quiz.id,
      userId: attemptUserId,
      score: grade.score,
      passed: grade.passed,
      answersJson: { answers: input.answers } as unknown as Prisma.InputJsonValue,
    },
  });
  if (input.assignmentId) {
    await recordProgress({
      userId: input.userId,
      performedById: input.performedById ?? null,
      assignmentId: input.assignmentId,
      lessonId: quiz.lesson.id,
      progressPercent: grade.passed ? 100 : 50,
      passedQuiz: grade.passed,
      score: grade.score,
      completed: grade.passed,
    });
  }
  await recordEvent({
    userId: input.userId,
    eventType: grade.passed ? "QUIZ_PASSED" : "QUIZ_FAILED",
    programId: quiz.lesson.module.programId,
    assignmentId: input.assignmentId ?? null,
    performedById: input.performedById ?? null,
    summary: `${quiz.title} → ${grade.score}%`,
    metadata: { score: grade.score, passed: grade.passed },
  });
  return { ok: true as const, attempt, grade };
}

export type IssueCertificationInput = {
  userId: string;
  performedById?: string | null;
  certificationType: TrainingCertificationType;
  recipientProfileId?: string | null;
  recipientStaffId?: string | null;
  recipientName?: string | null;
  recipientEmail?: string | null;
  programId?: string | null;
  assignmentId?: string | null;
  expiresAt?: Date | null;
  notes?: string | null;
};

export async function issueCertification(input: IssueCertificationInput) {
  const expiresAt = input.expiresAt === null ? null : input.expiresAt ?? defaultExpiry(input.certificationType);
  const cert = await prisma.trainingCertification.create({
    data: {
      userId: input.userId,
      certificationType: input.certificationType,
      programId: input.programId ?? undefined,
      assignmentId: input.assignmentId ?? undefined,
      recipientProfileId: input.recipientProfileId ?? undefined,
      recipientStaffId: input.recipientStaffId ?? undefined,
      recipientName: input.recipientName ?? undefined,
      recipientEmail: input.recipientEmail ?? undefined,
      issuedById: input.performedById ?? undefined,
      expiresAt: expiresAt ?? undefined,
      metadataJson: input.notes ? ({ notes: input.notes } as unknown as Prisma.InputJsonValue) : undefined,
    },
  });
  await recordEvent({
    userId: input.userId,
    eventType: "CERTIFICATION_ISSUED",
    programId: input.programId ?? null,
    assignmentId: input.assignmentId ?? null,
    performedById: input.performedById ?? null,
    summary: `${input.certificationType} issued`,
  });
  return { ok: true as const, cert };
}

export async function revokeCertification(input: {
  userId: string;
  performedById?: string | null;
  certId: string;
  reason: string;
}) {
  const cert = await prisma.trainingCertification.findFirst({
    where: await trainingCertificationByIdWhereForOwner(input.userId, input.certId),
  });
  if (!cert) return { ok: false as const, error: "Certification not found" };
  await prisma.trainingCertification.update({
    where: { id: cert.id },
    data: { revokedAt: new Date(), revokedReason: input.reason },
  });
  await recordEvent({
    userId: input.userId,
    eventType: "CERTIFICATION_REVOKED",
    performedById: input.performedById ?? null,
    summary: `${cert.certificationType} revoked: ${input.reason}`,
  });
  return { ok: true as const };
}

export type CreateSimulationInput = {
  userId: string;
  performedById?: string | null;
  title: string;
  simulationType: TrainingSimulationType;
  moduleId?: string | null;
  config?: Record<string, unknown> | null;
};

export async function createSimulation(input: CreateSimulationInput) {
  const template = SIMULATION_TEMPLATES[input.simulationType];
  const config = input.config ?? template;
  const sim = await prisma.trainingSimulation.create({
    data: {
      userId: input.userId,
      title: input.title,
      simulationType: input.simulationType,
      moduleId: input.moduleId ?? undefined,
      simulationConfigJson: config as unknown as Prisma.InputJsonValue,
    },
  });
  await recordEvent({
    userId: input.userId,
    eventType: "SIMULATION_CREATED",
    performedById: input.performedById ?? null,
    summary: `${input.simulationType} simulation created`,
  });
  return { ok: true as const, simulation: sim };
}

export type RunSimulationInput = {
  userId: string;
  performedById?: string | null;
  simulationId: string;
  responses: SimulationResponse[];
  runByProfileId?: string | null;
  runByStaffId?: string | null;
};

export async function runSimulation(input: RunSimulationInput) {
  const sim = await prisma.trainingSimulation.findFirst({
    where: await trainingSimulationByIdWhereForOwner(input.userId, input.simulationId),
  });
  if (!sim) return { ok: false as const, error: "Simulation not found" };
  const report = gradeSimulation(sim.simulationType, input.responses, sim.simulationConfigJson as object);
  const run = await prisma.trainingSimulationRun.create({
    data: {
      simulationId: sim.id,
      userId: input.userId,
      runByProfileId: input.runByProfileId ?? input.performedById ?? undefined,
      runByStaffId: input.runByStaffId ?? undefined,
      score: report.score,
      result: report.passed ? "COMPLETED" : "FAILED",
      completedAt: new Date(),
      outputJson: report as unknown as Prisma.InputJsonValue,
    },
  });
  await recordEvent({
    userId: input.userId,
    eventType: report.passed ? "SIMULATION_PASSED" : "SIMULATION_FAILED",
    performedById: input.performedById ?? null,
    summary: `${sim.simulationType} → ${report.score}%`,
    metadata: { runId: run.id, score: report.score, passed: report.passed },
  });
  return { ok: true as const, run, report };
}

// --- SOPs ---

export type CreateSopInput = {
  userId: string;
  performedById?: string | null;
  title: string;
  category: SOPCategory;
  content: string;
  summary?: string | null;
  language?: TrainingLanguage;
  brandId?: string | null;
  locationId?: string | null;
  requiresAcknowledgement?: boolean;
};

export async function createSop(input: CreateSopInput) {
  const baseSlug = slugify(input.title) || "sop";
  const sopScope = await sopDocumentListWhereForOwner(input.userId);
  const existing = await prisma.sOPDocument.findMany({
    where: { AND: [sopScope, { slug: { startsWith: baseSlug } }] },
    select: { slug: true, version: true },
  });
  let slug = baseSlug;
  if (existing.some((s) => s.slug === slug)) {
    let n = 2;
    while (existing.some((s) => s.slug === `${baseSlug}-${n}`)) n += 1;
    slug = `${baseSlug}-${n}`;
  }
  const sop = await prisma.sOPDocument.create({
    data: {
      userId: input.userId,
      title: input.title,
      slug,
      category: input.category,
      content: input.content,
      summary: input.summary ?? undefined,
      language: input.language ?? "EN",
      brandId: input.brandId ?? undefined,
      locationId: input.locationId ?? undefined,
      requiresAcknowledgement: input.requiresAcknowledgement ?? true,
      createdById: input.performedById ?? undefined,
    },
  });
  await recordEvent({
    userId: input.userId,
    eventType: "SOP_CREATED",
    performedById: input.performedById ?? null,
    summary: sop.title,
  });
  return { ok: true as const, sop };
}

export async function publishSop(input: { userId: string; performedById?: string | null; sopId: string }) {
  const sop = await prisma.sOPDocument.findFirst({
    where: await sopDocumentByIdWhereForOwner(input.userId, input.sopId),
  });
  if (!sop) return { ok: false as const, error: "SOP not found" };
  await prisma.sOPDocument.update({
    where: { id: sop.id },
    data: { status: "ACTIVE", publishedAt: new Date() },
  });
  await recordEvent({
    userId: input.userId,
    eventType: "SOP_PUBLISHED",
    performedById: input.performedById ?? null,
    summary: sop.title,
  });
  return { ok: true as const };
}

export async function archiveSop(input: { userId: string; performedById?: string | null; sopId: string }) {
  const sop = await prisma.sOPDocument.findFirst({
    where: await sopDocumentByIdWhereForOwner(input.userId, input.sopId),
  });
  if (!sop) return { ok: false as const, error: "SOP not found" };
  await prisma.sOPDocument.update({
    where: { id: sop.id },
    data: { status: "ARCHIVED", archivedAt: new Date() },
  });
  await recordEvent({
    userId: input.userId,
    eventType: "SOP_ARCHIVED",
    performedById: input.performedById ?? null,
    summary: sop.title,
  });
  return { ok: true as const };
}

export type AcknowledgeSopInput = {
  userId: string;
  performedById?: string | null;
  sopId: string;
  acknowledgedProfileId?: string | null;
  acknowledgedStaffId?: string | null;
  acknowledgedName?: string | null;
  acknowledgedEmail?: string | null;
  notes?: string | null;
};

export async function acknowledgeSop(input: AcknowledgeSopInput) {
  const sop = await prisma.sOPDocument.findFirst({
    where: await sopDocumentByIdWhereForOwner(input.userId, input.sopId),
  });
  if (!sop) return { ok: false as const, error: "SOP not found" };
  if (sop.status !== "ACTIVE") return { ok: false as const, error: "SOP is not active" };
  const ack = await prisma.sOPAcknowledgement.create({
    data: {
      userId: input.userId,
      sopId: sop.id,
      acknowledgedProfileId: input.acknowledgedProfileId ?? input.performedById ?? undefined,
      acknowledgedStaffId: input.acknowledgedStaffId ?? undefined,
      acknowledgedName: input.acknowledgedName ?? undefined,
      acknowledgedEmail: input.acknowledgedEmail ?? undefined,
      notes: input.notes ?? undefined,
    },
  });
  await recordEvent({
    userId: input.userId,
    eventType: "SOP_ACKNOWLEDGED",
    performedById: input.performedById ?? null,
    summary: sop.title,
  });
  return { ok: true as const, ack };
}

export async function listSops(userId: string) {
  return prisma.sOPDocument.findMany({
    where: await sopDocumentListWhereForOwner(userId),
    orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
    include: { acknowledgements: { select: { id: true } } },
  });
}

export async function listAssignments(userId: string) {
  return prisma.trainingAssignment.findMany({
    where: await trainingAssignmentListWhereForOwner(userId),
    orderBy: [{ assignedAt: "desc" }],
    include: {
      program: { select: { id: true, title: true, roleType: true, isOnboardingPath: true } },
      assignedTo: { select: { id: true, fullName: true, email: true } },
      assignedToStaff: { select: { id: true, name: true, email: true } },
      assignedBy: { select: { id: true, fullName: true, email: true } },
    },
  });
}

export async function listCertifications(userId: string) {
  return prisma.trainingCertification.findMany({
    where: await trainingCertificationListWhereForOwner(userId),
    orderBy: [{ issuedAt: "desc" }],
    include: {
      recipient: { select: { id: true, fullName: true, email: true } },
      recipientStaff: { select: { id: true, name: true, email: true } },
    },
  });
}

export async function listSimulations(userId: string) {
  return prisma.trainingSimulation.findMany({
    where: await trainingSimulationListWhereForOwner(userId),
    orderBy: [{ updatedAt: "desc" }],
    include: { runs: { take: 5, orderBy: { startedAt: "desc" } } },
  });
}

export async function listEvents(userId: string, limit = 50) {
  return prisma.trainingEvent.findMany({
    where: await trainingEventListWhereForOwner(userId),
    orderBy: [{ createdAt: "desc" }],
    take: limit,
    include: { performedBy: { select: { id: true, fullName: true, email: true } } },
  });
}

export type TrainingKpis = {
  activePrograms: number;
  totalAssignments: number;
  activeTrainees: number;
  completedAssignments: number;
  overdueAssignments: number;
  failedQuizzes: number;
  simulationsCompleted: number;
  certificationsActive: number;
  certificationsExpiringSoon: number;
  onboardingInFlight: number;
  averageCompletionPercent: number;
  sopActive: number;
  sopPendingAcks: number;
};

export async function trainingKpis(userId: string): Promise<TrainingKpis> {
  const [programScope, assignmentScope, simulationRunScope, certificationScope, sopScope, sopAckScope] =
    await Promise.all([
      trainingProgramListWhereForOwner(userId),
      trainingAssignmentListWhereForOwner(userId),
      trainingSimulationRunListWhereForOwner(userId),
      trainingCertificationListWhereForOwner(userId),
      sopDocumentListWhereForOwner(userId),
      sopAcknowledgementListWhereForOwner(userId),
    ]);
  const [
    activePrograms,
    totalAssignments,
    completedAssignments,
    overdueAssignments,
    failedQuizzes,
    simulationsCompleted,
    certificationsAll,
    onboardingInFlight,
    avgAgg,
    sopActive,
    activeTrainees,
    sopRequiringAck,
    sopAckCount,
  ] = await Promise.all([
    prisma.trainingProgram.count({ where: { AND: [programScope, { active: true }] } }),
    prisma.trainingAssignment.count({ where: assignmentScope }),
    prisma.trainingAssignment.count({ where: { AND: [assignmentScope, { status: "COMPLETED" }] } }),
    prisma.trainingAssignment.count({
      where: {
        AND: [
          assignmentScope,
          { dueAt: { lt: new Date() }, status: { notIn: ["COMPLETED", "WAIVED"] } },
        ],
      },
    }),
    prisma.trainingQuizAttempt.count({
      where: { quiz: { lesson: { module: { program: programScope } } }, passed: false },
    }),
    prisma.trainingSimulationRun.count({
      where: { AND: [simulationRunScope, { result: "COMPLETED" }] },
    }),
    prisma.trainingCertification.findMany({
      where: certificationScope,
      select: { expiresAt: true, revokedAt: true },
    }),
    prisma.trainingAssignment.count({
      where: {
        AND: [
          assignmentScope,
          { program: { isOnboardingPath: true }, status: { notIn: ["COMPLETED", "WAIVED"] } },
        ],
      },
    }),
    prisma.trainingAssignment.aggregate({
      where: assignmentScope,
      _avg: { completionPercent: true },
    }),
    prisma.sOPDocument.count({ where: { AND: [sopScope, { status: "ACTIVE" }] } }),
    prisma.trainingAssignment.findMany({
      where: {
        AND: [assignmentScope, { status: { in: ["ASSIGNED", "IN_PROGRESS", "NEEDS_REVIEW"] } }],
      },
      distinct: ["assignedToProfileId", "assignedToStaffId"],
      select: { assignedToProfileId: true, assignedToStaffId: true },
    }),
    prisma.sOPDocument.count({
      where: { AND: [sopScope, { status: "ACTIVE", requiresAcknowledgement: true }] },
    }),
    prisma.sOPAcknowledgement.count({ where: sopAckScope }),
  ]);

  let active = 0;
  let expiring = 0;
  for (const c of certificationsAll) {
    if (isCertificationActive(c)) active += 1;
    if (isCertificationExpiringSoon(c)) expiring += 1;
  }

  return {
    activePrograms,
    totalAssignments,
    activeTrainees: activeTrainees.length,
    completedAssignments,
    overdueAssignments,
    failedQuizzes,
    simulationsCompleted,
    certificationsActive: active,
    certificationsExpiringSoon: expiring,
    onboardingInFlight,
    averageCompletionPercent: Math.round((avgAgg._avg.completionPercent ?? 0)),
    sopActive,
    sopPendingAcks: Math.max(0, sopRequiringAck - sopAckCount),
  };
}

/** Used by the Go-live readiness engine. */
export async function trainingReadinessSnapshot(userId: string) {
  const [programScope, assignmentScope, certificationScope] = await Promise.all([
    trainingProgramListWhereForOwner(userId),
    trainingAssignmentListWhereForOwner(userId),
    trainingCertificationListWhereForOwner(userId),
  ]);
  const [activePrograms, completedAssignments, totalAssignments, certificationsAll] = await Promise.all([
    prisma.trainingProgram.count({ where: { AND: [programScope, { active: true }] } }),
    prisma.trainingAssignment.count({ where: { AND: [assignmentScope, { status: "COMPLETED" }] } }),
    prisma.trainingAssignment.count({ where: assignmentScope }),
    prisma.trainingCertification.findMany({
      where: certificationScope,
      select: { expiresAt: true, revokedAt: true, certificationType: true },
    }),
  ]);
  let activeCerts = 0;
  let expiringCerts = 0;
  for (const c of certificationsAll) {
    if (isCertificationActive(c)) activeCerts += 1;
    if (isCertificationExpiringSoon(c)) expiringCerts += 1;
  }
  return {
    activePrograms,
    totalAssignments,
    completedAssignments,
    activeCertifications: activeCerts,
    expiringCertifications: expiringCerts,
    coveragePercent:
      totalAssignments === 0 ? 0 : Math.round((completedAssignments / totalAssignments) * 100),
  };
}

export { ROLE_TO_CERTIFICATION };
