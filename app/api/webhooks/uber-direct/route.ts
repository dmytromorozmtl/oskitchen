import { handleUberDirectWebhook } from "@/lib/webhooks/uber-direct-webhook-handler";

export async function POST(request: Request) {
  return handleUberDirectWebhook(request);
}
