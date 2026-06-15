import { handleWooCommerceWebhook } from "@/lib/webhooks/woocommerce-handler";

export async function POST(request: Request) {
  return handleWooCommerceWebhook(request);
}
