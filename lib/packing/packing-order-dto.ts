export type PackingOrderItemDTO = {
  orderItemId: string;
  quantity: number;
  title: string;
  preparedDate: string | null;
  pickupDate: string | null;
  allergens?: string | null;
};

export type PackingOrderDTO = {
  id: string;
  customerName: string;
  customerEmail: string;
  fulfillmentType: "PICKUP" | "DELIVERY";
  pickupDate: string | null;
  items: PackingOrderItemDTO[];
};
