import { prisma } from "@/lib/prisma";
import {
  locationByIdWhereForOwner,
  locationListWhereForOwner,
} from "@/lib/scope/workspace-resource-scope";

export async function listLocationsForUser(userId: string) {
  return prisma.location.findMany({
    where: await locationListWhereForOwner(userId),
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
}

export async function getLocationForUser(userId: string, locationId: string) {
  return prisma.location.findFirst({ where: await locationByIdWhereForOwner(userId, locationId) });
}
