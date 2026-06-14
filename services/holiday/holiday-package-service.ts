import { prisma } from "@/lib/prisma";

export async function listHolidayPackages(userId: string) {
  const now = new Date();
  return prisma.holidayPackage.findMany({
    where: {
      userId,
      active: true,
      availableFrom: { lte: now },
      availableUntil: { gte: now },
    },
    orderBy: { availableFrom: "asc" },
  });
}

export async function createHolidayPackageOrder(params: {
  userId: string;
  packageId: string;
  customerEmail: string;
  customerName?: string | null;
  orderId?: string | null;
}) {
  const pkg = await prisma.holidayPackage.findFirst({
    where: { id: params.packageId, userId: params.userId, active: true },
  });
  if (!pkg) throw new Error("Holiday package not found");

  return prisma.holidayPackageOrder.create({
    data: {
      userId: params.userId,
      packageId: params.packageId,
      customerEmail: params.customerEmail,
      customerName: params.customerName ?? null,
      orderId: params.orderId ?? null,
      status: "PENDING",
    },
  });
}
