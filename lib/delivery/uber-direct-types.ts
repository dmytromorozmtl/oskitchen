export type UberDirectAddress = {
  address?: string;
  latitude?: number;
  longitude?: number;
  contact?: { name?: string; phone?: string };
};

export type UberDirectQuoteInput = {
  pickup?: UberDirectAddress;
  dropoff?: UberDirectAddress;
  orderId?: string;
};

export type UberDirectWebhookPayload = {
  event_id?: string;
  event_type?: string;
  delivery_id?: string;
  status?: string;
  resource_href?: string;
};
