import { IntegrationProvider } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import type { DoorDashCredentials } from "@/services/integrations/doordash/doordash-service";

export type DoorDashOrderStatus = "picked_up" | "delivered" | "cancelled";

const DRIVE_API =
  process.env.DOORDASH_DRIVE_API_BASE ?? "https://openapi.doordash.com/drive/v2";

function getJwt(creds: DoorDashCredentials): string | null {
  const key = creds.apiKey?.trim();
  if (!key) return null;
  return key;
}

export class DoorDashSyncService {
  constructor(private readonly creds: DoorDashCredentials = {}) {}

  async acceptOrder(externalId: string): Promise<{ ok: boolean; message: string }> {
    const jwt = getJwt(this.creds);
    if (!jwt) {
      return { ok: false, message: "DoorDash API key not configured" };
    }
    const res = await fetch(
      `${DRIVE_API}/deliveries/${encodeURIComponent(externalId)}/accept`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${jwt}`, "Content-Type": "application/json" },
      },
    );
    return {
      ok: res.ok,
      message: res.ok ? "Order accepted" : `DoorDash accept failed (${res.status})`,
    };
  }

  async updateStatus(
    externalId: string,
    status: DoorDashOrderStatus,
  ): Promise<{ ok: boolean; message: string }> {
    const jwt = getJwt(this.creds);
    if (!jwt) return { ok: false, message: "DoorDash API key not configured" };
    const res = await fetch(
      `${DRIVE_API}/deliveries/${encodeURIComponent(externalId)}/status`,
      {
        method: "PATCH",
        headers: { Authorization: `Bearer ${jwt}`, "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      },
    );
    return {
      ok: res.ok,
      message: res.ok ? `Status updated to ${status}` : `DoorDash status update failed (${res.status})`,
    };
  }

  async createDelivery(
    orderId: string,
    userId: string,
    input: { pickupAddress: string; deliveryAddress: string },
  ): Promise<{ ok: boolean; externalId: string | null; message: string }> {
    const jwt = getJwt(this.creds);
    if (!jwt) {
      return { ok: false, externalId: null, message: "DoorDash API key not configured" };
    }
    const res = await fetch(`${DRIVE_API}/deliveries`, {
      method: "POST",
      headers: { Authorization: `Bearer ${jwt}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        external_delivery_id: orderId,
        pickup_address: input.pickupAddress,
        dropoff_address: input.deliveryAddress,
      }),
    });
    if (!res.ok) {
      return { ok: false, externalId: null, message: `Create delivery failed (${res.status})` };
    }
    const json = (await res.json()) as { id?: string; external_delivery_id?: string };
    const externalId = json.id ?? json.external_delivery_id ?? null;
    if (externalId) {
      await prisma.doorDashDelivery.updateMany({
        where: { orderId, userId },
        data: { externalDeliveryId: externalId, status: "CONFIRMED" },
      });
    }
    return { ok: true, externalId, message: "Delivery created" };
  }

}
