import { prisma } from "@/lib/prisma";

export async function loadKitchenSettingsCenterJson(userId: string): Promise<unknown> {
  const kitchen = await prisma.kitchenSettings.findUnique({
    where: { userId },
    select: { settingsCenterJson: true },
  });
  return kitchen?.settingsCenterJson ?? null;
}
