import { prisma } from "@/lib/prisma";
import { clearWorkspaceSampleData } from "@/services/demo-data";

/** Clears demo operational rows; caller should flip demo mode off when appropriate. */
export async function clearDemoScenarioWorkspace(userId: string): Promise<void> {
  await clearWorkspaceSampleData(userId);
}
