import type { Prisma } from "@prisma/client";

import { resolveOwnerScopedWhere } from "@/lib/scope/workspace-resource-scope";

function andId(scope: Prisma.TrainingProgramWhereInput, id: string) {
  return { AND: [scope, { id }] } as Prisma.TrainingProgramWhereInput;
}

export async function trainingProgramListWhereForOwner(
  ownerUserId: string,
): Promise<Prisma.TrainingProgramWhereInput> {
  return resolveOwnerScopedWhere(ownerUserId) as Prisma.TrainingProgramWhereInput;
}

export async function trainingProgramByIdWhereForOwner(
  ownerUserId: string,
  programId: string,
): Promise<Prisma.TrainingProgramWhereInput> {
  const scope = await resolveOwnerScopedWhere(ownerUserId);
  return andId(scope, programId) as Prisma.TrainingProgramWhereInput;
}

export async function trainingAssignmentListWhereForOwner(
  ownerUserId: string,
): Promise<Prisma.TrainingAssignmentWhereInput> {
  return resolveOwnerScopedWhere(ownerUserId) as Prisma.TrainingAssignmentWhereInput;
}

export async function trainingAssignmentByIdWhereForOwner(
  ownerUserId: string,
  assignmentId: string,
): Promise<Prisma.TrainingAssignmentWhereInput> {
  const scope = await resolveOwnerScopedWhere(ownerUserId);
  return { AND: [scope, { id: assignmentId }] } as Prisma.TrainingAssignmentWhereInput;
}

export async function trainingCertificationListWhereForOwner(
  ownerUserId: string,
): Promise<Prisma.TrainingCertificationWhereInput> {
  return resolveOwnerScopedWhere(ownerUserId) as Prisma.TrainingCertificationWhereInput;
}

export async function trainingCertificationByIdWhereForOwner(
  ownerUserId: string,
  certId: string,
): Promise<Prisma.TrainingCertificationWhereInput> {
  const scope = await resolveOwnerScopedWhere(ownerUserId);
  return { AND: [scope, { id: certId }] } as Prisma.TrainingCertificationWhereInput;
}

export async function trainingSimulationByIdWhereForOwner(
  ownerUserId: string,
  simulationId: string,
): Promise<Prisma.TrainingSimulationWhereInput> {
  const scope = await resolveOwnerScopedWhere(ownerUserId);
  return { AND: [scope, { id: simulationId }] } as Prisma.TrainingSimulationWhereInput;
}

export async function trainingSimulationListWhereForOwner(
  ownerUserId: string,
): Promise<Prisma.TrainingSimulationWhereInput> {
  return resolveOwnerScopedWhere(ownerUserId) as Prisma.TrainingSimulationWhereInput;
}

export async function trainingSimulationRunListWhereForOwner(
  ownerUserId: string,
): Promise<Prisma.TrainingSimulationRunWhereInput> {
  return resolveOwnerScopedWhere(ownerUserId) as Prisma.TrainingSimulationRunWhereInput;
}

export async function trainingEventListWhereForOwner(
  ownerUserId: string,
): Promise<Prisma.TrainingEventWhereInput> {
  return resolveOwnerScopedWhere(ownerUserId) as Prisma.TrainingEventWhereInput;
}

export async function sopDocumentListWhereForOwner(
  ownerUserId: string,
): Promise<Prisma.SOPDocumentWhereInput> {
  return resolveOwnerScopedWhere(ownerUserId) as Prisma.SOPDocumentWhereInput;
}

export async function sopDocumentByIdWhereForOwner(
  ownerUserId: string,
  sopId: string,
): Promise<Prisma.SOPDocumentWhereInput> {
  const scope = await resolveOwnerScopedWhere(ownerUserId);
  return { AND: [scope, { id: sopId }] } as Prisma.SOPDocumentWhereInput;
}

export async function sopAcknowledgementListWhereForOwner(
  ownerUserId: string,
): Promise<Prisma.SOPAcknowledgementWhereInput> {
  return resolveOwnerScopedWhere(ownerUserId) as Prisma.SOPAcknowledgementWhereInput;
}

export async function playbookListWhereForOwner(
  ownerUserId: string,
): Promise<Prisma.PlaybookWhereInput> {
  return resolveOwnerScopedWhere(ownerUserId) as Prisma.PlaybookWhereInput;
}

export async function playbookByIdOrSlugWhereForOwner(
  ownerUserId: string,
  idOrSlug: string,
): Promise<Prisma.PlaybookWhereInput> {
  const scope = await playbookListWhereForOwner(ownerUserId);
  return {
    AND: [scope, { OR: [{ id: idOrSlug }, { slug: idOrSlug }] }],
  } as Prisma.PlaybookWhereInput;
}

export async function playbookByIdWhereForOwner(
  ownerUserId: string,
  playbookId: string,
): Promise<Prisma.PlaybookWhereInput> {
  const scope = await playbookListWhereForOwner(ownerUserId);
  return { AND: [scope, { id: playbookId }] } as Prisma.PlaybookWhereInput;
}

export async function templateApplicationListWhereForOwner(
  ownerUserId: string,
): Promise<Prisma.TemplateApplicationWhereInput> {
  return resolveOwnerScopedWhere(ownerUserId) as Prisma.TemplateApplicationWhereInput;
}

export async function templateApplicationByIdWhereForOwner(
  ownerUserId: string,
  applicationId: string,
): Promise<Prisma.TemplateApplicationWhereInput> {
  const scope = await resolveOwnerScopedWhere(ownerUserId);
  return { AND: [scope, { id: applicationId }] } as Prisma.TemplateApplicationWhereInput;
}
