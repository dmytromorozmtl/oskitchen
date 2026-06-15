import { Prisma } from "@prisma/client";

import { WorkspaceAccessDeniedError } from "@/lib/scope/assert-user-workspace-access";
import { safeError } from "@/lib/security";

/** User-visible detail for dashboard layout fallback (no secrets). */
export function dashboardLayoutErrorDetail(error: unknown): string {
  if (error instanceof WorkspaceAccessDeniedError) {
    return "Workspace access could not be verified. Sign out, clear site cookies for os-kitchen.com, and sign in again.";
  }
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2024") {
      return "The database is busy. Wait a moment and try again.";
    }
    if (error.code === "P1001" || error.code === "P1002") {
      return "Could not reach the database. Please try again shortly.";
    }
  }
  if (error instanceof Prisma.PrismaClientInitializationError) {
    return "Could not connect to the database. Please try again shortly.";
  }
  return safeError(error);
}
