import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { getRealtimeVarianceAlerts } from "@/services/costing/costing-alert-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const { dataUserId } = await requireTenantActor();
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      };

      try {
        const alerts = await getRealtimeVarianceAlerts(dataUserId);
        send("variance", { alerts, at: new Date().toISOString() });
      } catch (e) {
        send("error", { message: e instanceof Error ? e.message : "stream failed" });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
