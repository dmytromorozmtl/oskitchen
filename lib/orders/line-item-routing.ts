export type LineItemOpsRoute =
  | "READY_NOW"
  | "SEND_TO_KITCHEN"
  | "SEND_TO_PACKING"
  | "PRODUCTION_LATER"
  | "NO_OPS_REQUIRED"
  | "CUSTOM";

export type LineItemRoutingRow = {
  route: LineItemOpsRoute;
  routeLabel: string;
  kitchen: boolean;
  packing: boolean;
  readyNow: boolean;
  recipeLinked: boolean;
  explanation: string;
};

const ROUTE_LABEL: Record<LineItemOpsRoute, string> = {
  READY_NOW: "Ready now",
  SEND_TO_KITCHEN: "Kitchen / production",
  SEND_TO_PACKING: "Packing",
  PRODUCTION_LATER: "Production later",
  NO_OPS_REQUIRED: "No kitchen step",
  CUSTOM: "Custom",
};

export function buildLineItemRoutingRow(input: {
  orderItemId: string;
  productId: string | null;
  productHasRecipe: boolean;
  productionWorkItems: { id: string; orderItemId: string | null; productId: string | null }[];
}): LineItemRoutingRow {
  const work = input.productionWorkItems.find(
    (w) =>
      (input.orderItemId && w.orderItemId === input.orderItemId) ||
      (input.productId && w.productId === input.productId),
  );

  if (work) {
    return {
      route: "SEND_TO_KITCHEN",
      routeLabel: ROUTE_LABEL.SEND_TO_KITCHEN,
      kitchen: true,
      packing: false,
      readyNow: false,
      recipeLinked: input.productHasRecipe,
      explanation: "A production work item was created for this line.",
    };
  }

  if (!input.productId) {
    return {
      route: "CUSTOM",
      routeLabel: ROUTE_LABEL.CUSTOM,
      kitchen: false,
      packing: false,
      readyNow: false,
      recipeLinked: false,
      explanation: "Custom line — routing depends on how your team fulfills it.",
    };
  }

  if (input.productHasRecipe) {
    return {
      route: "PRODUCTION_LATER",
      routeLabel: ROUTE_LABEL.PRODUCTION_LATER,
      kitchen: true,
      packing: false,
      readyNow: false,
      recipeLinked: true,
      explanation: "Catalog item with a recipe, but no work item is linked yet — check production routing rules.",
    };
  }

  return {
    route: "READY_NOW",
    routeLabel: ROUTE_LABEL.READY_NOW,
    kitchen: false,
    packing: false,
    readyNow: true,
    recipeLinked: false,
    explanation: "No kitchen work item — typical for grab-and-go or retail items.",
  };
}
