import { NextResponse } from "next/server";
import { z } from "zod";

import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import {
  cancelTerminalPayment,
  createTerminalConnectionToken,
  createTerminalPaymentIntent,
  processTerminalPayment,
} from "@/services/payments/stripe-terminal-service";

const paymentSchema = z.object({
  amount: z.number().min(0.5),
  orderId: z.string().min(1),
  currency: z.string().default("usd"),
});

const processSchema = z.object({
  paymentIntentId: z.string().min(1),
  orderId: z.string().min(1),
});

export async function GET() {
  await requireTenantActor();
  try {
    const token = await createTerminalConnectionToken();
    return NextResponse.json({ token });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Terminal unavailable" },
      { status: 503 },
    );
  }
}

export async function POST(request: Request) {
  const { userId } = await requireTenantActor();
  const body = await request.json();
  const parsed = paymentSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const result = await createTerminalPaymentIntent(
      parsed.data.amount,
      parsed.data.currency,
      { orderId: parsed.data.orderId, userId },
    );
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Payment intent failed" },
      { status: 503 },
    );
  }
}

export async function PUT(request: Request) {
  const { userId } = await requireTenantActor();
  const body = await request.json();
  const parsed = processSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const transaction = await processTerminalPayment(
      parsed.data.paymentIntentId,
      parsed.data.orderId,
      userId,
    );
    return NextResponse.json({ success: true, transaction });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Payment processing failed" },
      { status: 400 },
    );
  }
}

export async function DELETE(request: Request) {
  await requireTenantActor();
  const { paymentIntentId } = (await request.json()) as { paymentIntentId?: string };
  if (!paymentIntentId) {
    return NextResponse.json({ error: "paymentIntentId required" }, { status: 400 });
  }
  try {
    await cancelTerminalPayment(paymentIntentId);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Cancel failed" },
      { status: 400 },
    );
  }
}
