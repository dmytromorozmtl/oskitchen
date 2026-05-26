import type {
  TrainingAssignmentStatus,
  TrainingCertificationType,
  TrainingDifficulty,
  TrainingLanguage,
  TrainingProgressStatus,
  TrainingRoleType,
} from "@prisma/client";

export const ROLE_LABEL: Record<TrainingRoleType, string> = {
  KITCHEN_STAFF: "Kitchen staff",
  PACKING_STAFF: "Packing staff",
  MANAGER: "Manager",
  DELIVERY_DRIVER: "Delivery driver",
  PREP_COOK: "Prep cook",
  LINE_COOK: "Line cook",
  EXECUTIVE_CHEF: "Executive chef",
  OPERATIONS_MANAGER: "Operations manager",
  INVENTORY_MANAGER: "Inventory manager",
  CATERING_COORDINATOR: "Catering coordinator",
  CUSTOMER_SUPPORT: "Customer support",
  ADMIN: "Admin",
  IMPLEMENTATION_MANAGER: "Implementation manager",
  GENERAL: "General",
};

export const DIFFICULTY_LABEL: Record<TrainingDifficulty, string> = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
  EXPERT: "Expert",
};

export const LANGUAGE_LABEL: Record<TrainingLanguage, string> = {
  EN: "English",
  FR: "Français",
  ES: "Español",
  DE: "Deutsch",
};

export const ASSIGNMENT_STATUS_LABEL: Record<TrainingAssignmentStatus, string> = {
  ASSIGNED: "Assigned",
  IN_PROGRESS: "In progress",
  NEEDS_REVIEW: "Needs review",
  COMPLETED: "Completed",
  FAILED: "Failed",
  WAIVED: "Waived",
  EXPIRED: "Expired",
};

export const ASSIGNMENT_STATUS_TONE: Record<TrainingAssignmentStatus, "neutral" | "info" | "success" | "warning" | "danger"> = {
  ASSIGNED: "info",
  IN_PROGRESS: "info",
  NEEDS_REVIEW: "warning",
  COMPLETED: "success",
  FAILED: "danger",
  WAIVED: "neutral",
  EXPIRED: "danger",
};

export const PROGRESS_STATUS_LABEL: Record<TrainingProgressStatus, string> = {
  NOT_STARTED: "Not started",
  IN_PROGRESS: "In progress",
  COMPLETED: "Completed",
  FAILED: "Failed",
};

export const CERTIFICATION_LABEL: Record<TrainingCertificationType, string> = {
  KITCHEN_CERTIFIED: "Kitchen certified",
  PACKING_CERTIFIED: "Packing certified",
  ROUTE_CERTIFIED: "Route certified",
  MANAGER_CERTIFIED: "Manager certified",
  SAFETY_CERTIFIED: "Safety certified",
  CATERING_CERTIFIED: "Catering certified",
  CUSTOMER_SERVICE_CERTIFIED: "Customer service certified",
  ALLERGEN_CERTIFIED: "Allergen certified",
  CUSTOM: "Custom certification",
};

/** Map a role type to the certification it primarily grants. */
export const ROLE_TO_CERTIFICATION: Partial<Record<TrainingRoleType, TrainingCertificationType>> = {
  KITCHEN_STAFF: "KITCHEN_CERTIFIED",
  PREP_COOK: "KITCHEN_CERTIFIED",
  LINE_COOK: "KITCHEN_CERTIFIED",
  EXECUTIVE_CHEF: "KITCHEN_CERTIFIED",
  PACKING_STAFF: "PACKING_CERTIFIED",
  DELIVERY_DRIVER: "ROUTE_CERTIFIED",
  MANAGER: "MANAGER_CERTIFIED",
  OPERATIONS_MANAGER: "MANAGER_CERTIFIED",
  CATERING_COORDINATOR: "CATERING_CERTIFIED",
  CUSTOMER_SUPPORT: "CUSTOMER_SERVICE_CERTIFIED",
};

/** Slugify titles deterministically. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 140);
}

/** Compute an overall completion percent for an assignment given lesson progress rows. */
export function computeAssignmentCompletion(
  totalLessons: number,
  completedLessons: number,
): number {
  if (totalLessons <= 0) return 0;
  return Math.round((completedLessons / totalLessons) * 100);
}

/** Decide the new assignment status given completion + quiz outcomes. */
export function deriveAssignmentStatus(input: {
  completionPercent: number;
  hasFailedQuiz: boolean;
  needsManagerReview: boolean;
  dueAt?: Date | null;
}): TrainingAssignmentStatus {
  if (input.hasFailedQuiz) return "FAILED";
  if (input.completionPercent >= 100) {
    return input.needsManagerReview ? "NEEDS_REVIEW" : "COMPLETED";
  }
  if (input.dueAt && input.dueAt.getTime() < Date.now() && input.completionPercent < 100) {
    return "EXPIRED";
  }
  if (input.completionPercent > 0) return "IN_PROGRESS";
  return "ASSIGNED";
}

export function isAssignmentOverdue(input: {
  status: TrainingAssignmentStatus;
  dueAt: Date | null;
}): boolean {
  if (!input.dueAt) return false;
  if (input.status === "COMPLETED" || input.status === "WAIVED") return false;
  return input.dueAt.getTime() < Date.now();
}
