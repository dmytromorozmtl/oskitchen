import { handleSlackExperimentInteractiveWebhook } from "@/lib/webhooks/slack-experiment-interactive-handler";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  return handleSlackExperimentInteractiveWebhook(request);
}
