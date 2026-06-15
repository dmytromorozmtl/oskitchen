import type {
  Menu,
  Order,
  Product,
  ProductionTask,
  SubscriptionPlan,
} from "@prisma/client";

export type DashboardStats = {
  activeOrders: number;
  revenueMonth: number;
  menusActive: number;
  deliveriesWeek: number;
};

export type ProductionRow = Product & {
  productionTask: ProductionTask | null;
  menu: Pick<Menu, "id" | "title">;
};

export type OrderWithItems = Order & {
  orderItems: {
    quantity: number;
    product: Pick<Product, "id" | "title" | "price" | "category">;
  }[];
};

export type PlanKey = SubscriptionPlan;
