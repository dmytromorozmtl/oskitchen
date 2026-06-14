import { prisma } from "@/lib/prisma";

export async function listWorkspacesInOrganization(organizationId: string) {
  return prisma.workspace.findMany({
    where: { organizationId },
    select: { id: true, name: true, active: true, ownerUserId: true },
    orderBy: { name: "asc" },
  });
}

export async function getOrganizationForWorkspace(workspaceId: string) {
  const ws = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { organizationId: true, id: true, name: true },
  });
  if (!ws?.organizationId) return null;
  const org = await prisma.organization.findUnique({
    where: { id: ws.organizationId },
    select: { id: true, name: true },
  });
  return org ? { organization: org, workspace: ws } : null;
}
