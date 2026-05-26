import { handleShopifyWebhook } from "@/lib/webhooks/shopify-handler";

export async function POST(request: Request) {
  return handleShopifyWebhook(request, "orders/updated");
}
