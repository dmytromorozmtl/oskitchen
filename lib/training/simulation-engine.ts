import type { TrainingSimulationType } from "@prisma/client";

export const SIMULATION_TYPE_LABEL: Record<TrainingSimulationType, string> = {
  LUNCH_RUSH: "Lunch rush",
  DINNER_RUSH: "Dinner rush",
  CATERING_PREP: "Catering prep",
  GHOST_KITCHEN_SPIKE: "Ghost kitchen spike",
  FAILED_DELIVERY: "Failed delivery",
  INVENTORY_SHORTAGE: "Inventory shortage",
  ALLERGY_INCIDENT: "Allergy incident",
  PACKING_MISMATCH: "Packing mismatch",
  ROUTE_DELAY: "Route delay",
  POS_OUTAGE: "POS outage",
  INTEGRATION_FAILURE: "Integration failure",
  KITCHEN_BOTTLENECK: "Kitchen bottleneck",
  CUSTOM: "Custom",
};

export type TrainingSimulationStep = {
  id: string;
  title: string;
  description: string;
  expectedAction: string;
  timerSeconds?: number;
  pointValue?: number;
};

export type TrainingSimulationDefinition = {
  type: TrainingSimulationType;
  description: string;
  steps: TrainingSimulationStep[];
  /** Minimum score (0–100) needed to pass. */
  passingScore: number;
};

const STEP = (
  id: string,
  title: string,
  description: string,
  expectedAction: string,
  timerSeconds?: number,
  pointValue: number = 10,
): TrainingSimulationStep => ({ id, title, description, expectedAction, timerSeconds, pointValue });

export const SIMULATION_TEMPLATES: Record<TrainingSimulationType, TrainingSimulationDefinition> = {
  LUNCH_RUSH: {
    type: "LUNCH_RUSH",
    description: "120 orders concentrated 11:00–13:30 with normal modifier mix.",
    passingScore: 80,
    steps: [
      STEP("ack", "Acknowledge incoming orders", "Order hub shows 18 new orders.", "Acknowledge within 30s.", 30),
      STEP("batch", "Batch by station", "Group orders by station.", "Create at least 3 batches.", 60),
      STEP("flag", "Flag delayed orders", "Two orders are aging past 12 min.", "Move them to expedited.", 30),
      STEP("comm", "Communicate to packing", "Notify packing of upcoming wave.", "Send a packing alert.", 20),
    ],
  },
  DINNER_RUSH: {
    type: "DINNER_RUSH",
    description: "Evening peak with mixed dine-in and delivery.",
    passingScore: 80,
    steps: [
      STEP("seat", "Manage seating queue", "Three parties waiting.", "Assign tables.", 45),
      STEP("expedite", "Expedite courses", "Backed-up appetizers.", "Re-prioritize.", 60),
      STEP("delivery", "Route delivery orders", "5 delivery orders queued.", "Hand off to driver.", 45),
    ],
  },
  CATERING_PREP: {
    type: "CATERING_PREP",
    description: "Catering quote with multi-tray packing and on-time delivery.",
    passingScore: 80,
    steps: [
      STEP("verify", "Verify quote", "Confirm headcount and dietary notes.", "Acknowledge customer notes.", 60),
      STEP("batches", "Create production batches", "Split into prep batches.", "Create at least 2 batches.", 90),
      STEP("trays", "Assign trays", "Map trays to vehicles.", "All trays labeled.", 60),
    ],
  },
  GHOST_KITCHEN_SPIKE: {
    type: "GHOST_KITCHEN_SPIKE",
    description: "Marketplace spike across multiple brand SKUs.",
    passingScore: 75,
    steps: [
      STEP("brands", "Triage by brand", "Three brands receive orders.", "Sort by brand.", 30),
      STEP("staff", "Re-allocate staff", "Brand B is overloaded.", "Move one person to Brand B.", 30),
    ],
  },
  FAILED_DELIVERY: {
    type: "FAILED_DELIVERY",
    description: "Driver reports a failed drop-off.",
    passingScore: 80,
    steps: [
      STEP("contact", "Contact customer", "Customer not at door.", "Open customer profile + call.", 60),
      STEP("decide", "Decide outcome", "Hold for redelivery or refund?", "Pick redelivery if address valid.", 45),
    ],
  },
  INVENTORY_SHORTAGE: {
    type: "INVENTORY_SHORTAGE",
    description: "Mid-service ingredient runs out.",
    passingScore: 80,
    steps: [
      STEP("oos", "Mark out-of-stock", "Storefront still selling chicken.", "Mark 86 on POS + storefront.", 30),
      STEP("notify", "Notify customers", "Pending orders affected.", "Send substitution offer.", 60),
    ],
  },
  ALLERGY_INCIDENT: {
    type: "ALLERGY_INCIDENT",
    description: "Customer reports allergic reaction.",
    passingScore: 90,
    steps: [
      STEP("stop", "Stop the kitchen line", "Halt service on suspected item.", "Stop line.", 15),
      STEP("docs", "Document the incident", "Record details for compliance.", "Create incident in Go-live.", 60),
      STEP("notify", "Notify manager and ownership", "Page manager.", "Send notification.", 30),
    ],
  },
  PACKING_MISMATCH: {
    type: "PACKING_MISMATCH",
    description: "Packing scan does not match order.",
    passingScore: 85,
    steps: [
      STEP("reject", "Reject the package", "Scan flagged mismatched item.", "Hold packing.", 20),
      STEP("repack", "Repack with verification", "Re-verify items.", "Run verification again.", 45),
    ],
  },
  ROUTE_DELAY: {
    type: "ROUTE_DELAY",
    description: "Driver running 25 minutes behind schedule.",
    passingScore: 75,
    steps: [
      STEP("reroute", "Re-route remaining stops", "5 stops left.", "Optimize.", 60),
      STEP("notify", "Notify affected customers", "Three deliveries impacted.", "Send delay note.", 45),
    ],
  },
  POS_OUTAGE: {
    type: "POS_OUTAGE",
    description: "POS terminal offline mid-service.",
    passingScore: 85,
    steps: [
      STEP("manual", "Switch to manual orders", "Use paper tickets.", "Activate manual mode.", 30),
      STEP("recovery", "Reconcile after recovery", "POS back online.", "Enter manual orders into POS.", 90),
    ],
  },
  INTEGRATION_FAILURE: {
    type: "INTEGRATION_FAILURE",
    description: "Channel sync stops sending orders.",
    passingScore: 80,
    steps: [
      STEP("alert", "Acknowledge the alert", "Sales Channels shows ERROR.", "Acknowledge.", 30),
      STEP("disable", "Disable channel intake", "Stop until repaired.", "Disable channel.", 30),
    ],
  },
  KITCHEN_BOTTLENECK: {
    type: "KITCHEN_BOTTLENECK",
    description: "Salads station backing up the entire line.",
    passingScore: 75,
    steps: [
      STEP("staff", "Add a salads helper", "Move someone over.", "Move staff.", 60),
      STEP("rebalance", "Rebalance tickets", "Reprioritize older orders.", "Bump priority.", 45),
    ],
  },
  CUSTOM: {
    type: "CUSTOM",
    description: "User-defined simulation.",
    passingScore: 80,
    steps: [],
  },
};

export type SimulationResponse = {
  stepId: string;
  /** Whether the trainee selected the expected action. */
  correct: boolean;
  /** Time taken in seconds (optional). */
  timeSeconds?: number;
  /** Free-text response notes. */
  notes?: string;
};

export type SimulationReport = {
  type: TrainingSimulationType;
  passed: boolean;
  score: number;
  responses: SimulationResponse[];
  findings: string[];
};

export function gradeSimulation(
  type: TrainingSimulationType,
  responses: SimulationResponse[],
  configOverrides?: Partial<TrainingSimulationDefinition>,
): SimulationReport {
  const template = SIMULATION_TEMPLATES[type];
  const definition: TrainingSimulationDefinition = {
    ...template,
    ...configOverrides,
    steps: configOverrides?.steps ?? template.steps,
  };
  const findings: string[] = [];

  if (definition.steps.length === 0) {
    const score = responses.length > 0 ? Math.round(
      (responses.filter((r) => r.correct).length / responses.length) * 100,
    ) : 0;
    return { type, passed: score >= definition.passingScore, score, responses, findings };
  }

  const responsesById = new Map(responses.map((r) => [r.stepId, r]));
  const totalPoints = definition.steps.reduce((s, step) => s + (step.pointValue ?? 10), 0);
  let achieved = 0;
  for (const step of definition.steps) {
    const response = responsesById.get(step.id);
    if (response?.correct) {
      achieved += step.pointValue ?? 10;
    } else {
      findings.push(`Step "${step.title}" was not executed correctly.`);
    }
  }
  const score = totalPoints === 0 ? 0 : Math.round((achieved / totalPoints) * 100);
  return {
    type,
    passed: score >= definition.passingScore,
    score,
    responses,
    findings,
  };
}
