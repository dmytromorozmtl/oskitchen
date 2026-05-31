import type {
  TrainingAssignmentStatus,
  TrainingDifficulty,
  TrainingModuleType,
  TrainingLessonType,
  TrainingRoleType,
} from "@prisma/client";

export type LessonSeed = {
  title: string;
  slug?: string;
  lessonType: TrainingLessonType;
  content: string;
  estimatedMinutes?: number;
  required?: boolean;
};

export type ModuleSeed = {
  title: string;
  slug?: string;
  moduleType: TrainingModuleType;
  required?: boolean;
  quizEnabled?: boolean;
  simulationEnabled?: boolean;
  lessons: LessonSeed[];
};

export type ProgramSeed = {
  title: string;
  description: string;
  roleType: TrainingRoleType;
  difficulty: TrainingDifficulty;
  estimatedMinutes: number;
  isOnboardingPath?: boolean;
  modules: ModuleSeed[];
};

export const ROLE_PROGRAM_TEMPLATES: Record<TrainingRoleType, ProgramSeed> = {
  KITCHEN_STAFF: {
    title: "Kitchen staff onboarding",
    description: "Cook line, production board, kitchen screen, batch quantities, food safety.",
    roleType: "KITCHEN_STAFF",
    difficulty: "BEGINNER",
    estimatedMinutes: 120,
    isOnboardingPath: true,
    modules: [
      { title: "Welcome and orientation", moduleType: "ONBOARDING", lessons: [
        { title: "Welcome to the kitchen", lessonType: "TEXT", content: "Overview of expectations and shift culture." },
        { title: "Account setup", lessonType: "INTERACTIVE_CHECKLIST", content: "Set up your account, badge, locker." },
      ]},
      { title: "Food safety", moduleType: "SAFETY", required: true, lessons: [
        { title: "Handwashing and hygiene", lessonType: "VIDEO", content: "Watch the food-safety basics video." },
        { title: "Temperature controls", lessonType: "TEXT", content: "Hold, cook, and cool temperatures." },
        { title: "Allergen handling", lessonType: "SOP_ACK", content: "Acknowledge the allergen SOP." },
      ]},
      { title: "Production board", moduleType: "KITCHEN", required: true, lessons: [
        { title: "Reading the board", lessonType: "WALKTHROUGH", content: "How to filter, prioritize, and mark cooked." },
        { title: "Batch quantities", lessonType: "INTERACTIVE_CHECKLIST", content: "Confirm batch sizes against imported orders." },
      ]},
      { title: "Quiz: kitchen basics", moduleType: "KITCHEN", quizEnabled: true, lessons: [
        { title: "Kitchen basics quiz", lessonType: "QUIZ", content: "Knowledge check on kitchen flow." },
      ]},
      { title: "Lunch rush simulation", moduleType: "SIMULATION", simulationEnabled: true, lessons: [
        { title: "Run the lunch rush", lessonType: "SIMULATION", content: "Complete a lunch-rush practice simulation." },
      ]},
    ],
  },
  PACKING_STAFF: {
    title: "Packing staff onboarding",
    description: "Packing verification, labels, exceptions, allergen handling.",
    roleType: "PACKING_STAFF",
    difficulty: "BEGINNER",
    estimatedMinutes: 90,
    isOnboardingPath: true,
    modules: [
      { title: "Welcome to packing", moduleType: "ONBOARDING", lessons: [
        { title: "Packing flow overview", lessonType: "TEXT", content: "What packing does and why scanning matters." },
      ]},
      { title: "Label verification", moduleType: "PACKING", required: true, lessons: [
        { title: "Printing and applying labels", lessonType: "WALKTHROUGH", content: "Printer setup and label placement." },
        { title: "Scan training", lessonType: "INTERACTIVE_CHECKLIST", content: "Practice scanning until 100% match." },
      ]},
      { title: "Packing mismatch drill", moduleType: "SIMULATION", simulationEnabled: true, lessons: [
        { title: "Mismatch simulation", lessonType: "SIMULATION", content: "What to do when scan does not match." },
      ]},
      { title: "Quiz: packing safety", moduleType: "PACKING", quizEnabled: true, lessons: [
        { title: "Packing safety quiz", lessonType: "QUIZ", content: "Knowledge check." },
      ]},
    ],
  },
  MANAGER: {
    title: "Manager onboarding",
    description: "Order hub, menu planner, reports, issue triage, approvals.",
    roleType: "MANAGER",
    difficulty: "INTERMEDIATE",
    estimatedMinutes: 180,
    isOnboardingPath: true,
    modules: [
      { title: "Welcome, manager", moduleType: "ONBOARDING", lessons: [
        { title: "Day-in-the-life", lessonType: "TEXT", content: "What a manager owns each shift." },
      ]},
      { title: "Order hub triage", moduleType: "MANAGER", required: true, lessons: [
        { title: "Triage walkthrough", lessonType: "WALKTHROUGH", content: "How to filter, escalate, and resolve." },
      ]},
      { title: "Reports & KPIs", moduleType: "MANAGER", lessons: [
        { title: "Daily reports", lessonType: "TEXT", content: "Which dashboards to check first." },
      ]},
      { title: "Allergy incident drill", moduleType: "DRILL", simulationEnabled: true, lessons: [
        { title: "Allergy incident response", lessonType: "SIMULATION", content: "Run the allergy incident drill." },
      ]},
    ],
  },
  DELIVERY_DRIVER: {
    title: "Delivery driver onboarding",
    description: "Route handling, customer contact, failed deliveries.",
    roleType: "DELIVERY_DRIVER",
    difficulty: "BEGINNER",
    estimatedMinutes: 75,
    isOnboardingPath: true,
    modules: [
      { title: "Driver basics", moduleType: "DELIVERY", lessons: [
        { title: "App overview", lessonType: "WALKTHROUGH", content: "Driver app + route screen." },
      ]},
      { title: "Failed delivery drill", moduleType: "SIMULATION", simulationEnabled: true, lessons: [
        { title: "Run the failed delivery drill", lessonType: "SIMULATION", content: "Practice handling a failed drop-off." },
      ]},
    ],
  },
  PREP_COOK: {
    title: "Prep cook onboarding",
    description: "Prep schedules, batching, mise en place.",
    roleType: "PREP_COOK",
    difficulty: "BEGINNER",
    estimatedMinutes: 90,
    isOnboardingPath: true,
    modules: [
      { title: "Mise en place", moduleType: "KITCHEN", lessons: [
        { title: "Mise en place basics", lessonType: "TEXT", content: "Setting up your station." },
      ]},
    ],
  },
  LINE_COOK: {
    title: "Line cook training",
    description: "Line-cook responsibilities, ticket pacing, expediting.",
    roleType: "LINE_COOK",
    difficulty: "INTERMEDIATE",
    estimatedMinutes: 120,
    modules: [
      { title: "Ticket pacing", moduleType: "KITCHEN", lessons: [
        { title: "Reading tickets", lessonType: "WALKTHROUGH", content: "Reading and prioritizing tickets." },
      ]},
    ],
  },
  EXECUTIVE_CHEF: {
    title: "Executive chef enablement",
    description: "Menu engineering, food cost, kitchen leadership.",
    roleType: "EXECUTIVE_CHEF",
    difficulty: "EXPERT",
    estimatedMinutes: 240,
    modules: [
      { title: "Menu engineering", moduleType: "MANAGER", lessons: [
        { title: "Cost vs. popularity matrix", lessonType: "TEXT", content: "How to balance the menu." },
      ]},
    ],
  },
  OPERATIONS_MANAGER: {
    title: "Operations manager enablement",
    description: "Multi-location operations, escalation playbooks.",
    roleType: "OPERATIONS_MANAGER",
    difficulty: "ADVANCED",
    estimatedMinutes: 180,
    modules: [
      { title: "Escalations", moduleType: "MANAGER", lessons: [
        { title: "Escalation matrix", lessonType: "TEXT", content: "Who to call and when." },
      ]},
    ],
  },
  INVENTORY_MANAGER: {
    title: "Inventory manager enablement",
    description: "Inventory counts, par levels, ordering.",
    roleType: "INVENTORY_MANAGER",
    difficulty: "INTERMEDIATE",
    estimatedMinutes: 90,
    modules: [
      { title: "Counts and pars", moduleType: "COMPLIANCE", lessons: [
        { title: "Counting workflow", lessonType: "WALKTHROUGH", content: "How to run a count cycle." },
      ]},
    ],
  },
  CATERING_COORDINATOR: {
    title: "Catering coordinator onboarding",
    description: "Quotes, scheduling, logistics for catering.",
    roleType: "CATERING_COORDINATOR",
    difficulty: "INTERMEDIATE",
    estimatedMinutes: 120,
    isOnboardingPath: true,
    modules: [
      { title: "Catering quotes", moduleType: "CATERING", lessons: [
        { title: "Quote to order", lessonType: "WALKTHROUGH", content: "Building a catering quote." },
      ]},
      { title: "Catering prep simulation", moduleType: "SIMULATION", simulationEnabled: true, lessons: [
        { title: "Run the catering prep simulation", lessonType: "SIMULATION", content: "Practice a catering event." },
      ]},
    ],
  },
  CUSTOMER_SUPPORT: {
    title: "Customer support training",
    description: "Customer comms, refunds, escalations.",
    roleType: "CUSTOMER_SUPPORT",
    difficulty: "BEGINNER",
    estimatedMinutes: 90,
    isOnboardingPath: true,
    modules: [
      { title: "Tone and templates", moduleType: "CUSTOMER_SERVICE", lessons: [
        { title: "Customer tone guide", lessonType: "TEXT", content: "How we talk to customers." },
      ]},
    ],
  },
  ADMIN: {
    title: "Admin enablement",
    description: "Workspace admin, permissions, billing, integrations.",
    roleType: "ADMIN",
    difficulty: "ADVANCED",
    estimatedMinutes: 120,
    modules: [
      { title: "Permissions matrix", moduleType: "COMPLIANCE", lessons: [
        { title: "Permissions overview", lessonType: "TEXT", content: "Who can do what." },
      ]},
    ],
  },
  IMPLEMENTATION_MANAGER: {
    title: "Implementation manager enablement",
    description: "Go-live orchestration, onboarding playbook.",
    roleType: "IMPLEMENTATION_MANAGER",
    difficulty: "ADVANCED",
    estimatedMinutes: 180,
    modules: [
      { title: "Go-live process", moduleType: "MANAGER", lessons: [
        { title: "Go-live overview", lessonType: "TEXT", content: "Stages, approvals, simulations, rollback." },
      ]},
    ],
  },
  GENERAL: {
    title: "General onboarding",
    description: "Default onboarding for unspecified roles.",
    roleType: "GENERAL",
    difficulty: "BEGINNER",
    estimatedMinutes: 60,
    isOnboardingPath: true,
    modules: [
      { title: "Welcome", moduleType: "ONBOARDING", lessons: [
        { title: "Welcome to OS Kitchen", lessonType: "TEXT", content: "Workspace overview and where to find help." },
      ]},
    ],
  },
};

export function isOverdue(input: { status: TrainingAssignmentStatus; dueAt?: Date | null }): boolean {
  if (!input.dueAt) return false;
  if (input.status === "COMPLETED" || input.status === "WAIVED") return false;
  return input.dueAt.getTime() < Date.now();
}
