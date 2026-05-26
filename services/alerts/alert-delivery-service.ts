/**
 * Alert delivery orchestration — email/SMS paths must respect configured providers.
 * No simulated sends: callers should check provider env before enqueueing.
 */
export type AlertDeliveryChannel = "EMAIL" | "SMS" | "IN_APP" | "SLACK_PLACEHOLDER";

export type AlertDeliveryPlan = {
  channel: AlertDeliveryChannel;
  canDeliver: boolean;
  reasonIfBlocked: string | null;
};

export function describeEmailDelivery(): AlertDeliveryPlan {
  const canDeliver = Boolean(process.env.RESEND_API_KEY ?? process.env.SMTP_HOST);
  return {
    channel: "EMAIL",
    canDeliver,
    reasonIfBlocked: canDeliver ? null : "No Resend/SMTP configuration detected.",
  };
}
