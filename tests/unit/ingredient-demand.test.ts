import type { RecipeWithLines } from "@/services/purchasing/ingredient-demand-from-orders";
import { buildIngredientDemandFromOrders } from "@/services/purchasing/ingredient-demand-from-orders";
import { describe, expect, it } from "vitest";

describe("buildIngredientDemandFromOrders", () => {
  it("rolls up ingredient quantities for orders with recipes", () => {
    const pickup = new Date("2026-05-10T12:00:00.000Z");
    const orders = [
      {
        id: "o1",
        status: "CONFIRMED" as const,
        pickupDate: pickup,
        createdAt: pickup,
        brandId: null as string | null,
        locationId: null as string | null,
        orderItems: [{ quantity: 2, productId: "p1" }],
      },
    ];

    const recipe = {
      id: "r1",
      userId: "u",
      productId: "p1",
      name: "Bowl",
      yieldQuantity: 1,
      yieldUnit: "portion",
      prepTimeMinutes: 0,
      cookTimeMinutes: 0,
      laborMinutes: 0,
      packagingCost: 0,
      createdAt: pickup,
      updatedAt: pickup,
      ingredients: [
        {
          id: "ri1",
          recipeId: "r1",
          ingredientId: "ing1",
          quantity: 2,
          unit: "kg",
          wastePercent: 0,
          createdAt: pickup,
          updatedAt: pickup,
          ingredient: {
            id: "ing1",
            userId: "u",
            name: "Chicken",
            unit: "kg",
            supplier: "S1",
            costPerUnit: 10,
            currentStock: 5,
            parLevel: 0,
            createdAt: pickup,
            updatedAt: pickup,
          },
        },
      ],
    } as unknown as RecipeWithLines;

    const rows = buildIngredientDemandFromOrders({
      orders,
      recipesByProductId: new Map([["p1", recipe]]),
      productTitles: new Map([["p1", "Power bowl"]]),
      wasteBufferPercent: 0,
    });

    expect(rows.length).toBe(1);
    expect(rows[0]?.name).toBe("Chicken");
    expect(rows[0]?.required).toBeGreaterThan(0);
  });
});
