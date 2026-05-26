import { prisma } from "@/lib/prisma";

export async function listBetaCohorts(activeOnly = true) {
  return prisma.betaCohort.findMany({
    where: activeOnly ? { active: true } : undefined,
    orderBy: [{ active: "desc" }, { launchDate: "asc" }, { name: "asc" }],
    include: {
      _count: { select: { members: true } },
    },
  });
}

export async function assignLeadToCohort(betaLeadId: string, cohortId: string | null) {
  return prisma.betaLead.update({
    where: { id: betaLeadId },
    data: { betaCohortId: cohortId },
  });
}

export async function ensureSeedCohortsIfEmpty(): Promise<void> {
  const n = await prisma.betaCohort.count();
  if (n > 0) return;
  await prisma.betaCohort.createMany({
    data: [
      {
        name: "Meal prep alpha",
        targetVertical: "MEAL_PREP",
        active: true,
      },
      {
        name: "Ghost kitchen pilot",
        targetVertical: "GHOST_KITCHEN",
        active: true,
      },
      {
        name: "Enterprise catering",
        targetVertical: "CATERING",
        active: true,
      },
    ],
  });
}
