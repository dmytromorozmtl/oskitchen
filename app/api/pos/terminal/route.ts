import { NextResponse } from "next/server";
import { z } from "zod";

import { AUDIT_ACTIONS } from "@/lib/audit/audit-actions";
import { requireMutationPermission } from "@/lib/permissions/mutation-access";
import {
  cancelTerminalPayment,
  createTerminalConnectionToken,
  createTerminalPaymentIntent,
  processTerminalPayment,
} from "@/services/payments/stripe-terminal-service";
import {
  logPosPermissionDenied,
  logPosTerminalControlEvent,
} from "@/services/pos/pos-permission-audit";

const paymentSchema = z.object({
  amount: z.number().min(0.5),
  orderId: z.string().min(1),
  currency: z.string().default("usd"),
});

const processSchema = z.object({
  paymentIntentId: z.string().min(1),
  orderId: z.string().min(1),
});

async function requirePosTerminalAccess(method: string) {
  const access = await requireMutationPermission("pos.checkout");
  if (!access.ok) {
    await logPosPermissionDenied(access.actor, {
      requiredPermission: "pos.checkout",
      operation: "pos.terminal",
      metadata: { method, route: "/api/pos/terminal" },
    });
    return null;
  }
  return access.actor;
}

async function parseJsonBody(request: Request) {
  try {
    return { ok: true as const, body: await request.json() };
  } catch {
    return { ok: false as const, response: NextResponse.json({ error: "Invalid JSON" }, { status: 400 }) };
  }
}

export async function GET() {
  const actor = await requirePosTerminalAccess("GET");
  if (!actor) {
    return NextResponse.json({ error: "You do not have permission to perform this action." }, { status: 403 });
  }
  try {
    const token = await createTerminalConnectionToken();
    await logPosTerminalControlEvent(actor, {
      action: AUDIT_ACTIONS.POS_TERMINAL_TOKEN_ISSUED,
      metadata: { route: "/api/pos/terminal" },
    });
    return NextResponse.json({ token });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Terminal unavailable" },
      { status: 503 },
    );
  }
}

export async function POST(request: Request) {
  const actor = await requirePosTerminalAccess("POST");
  if (!actor) {
    return NextResponse.json({ error: "You do not have permission to perform this action." }, { status: 403 });
  }
  const parsedBody = await parseJsonBody(request);
  if (!parsedBody.ok) {
    return parsedBody.response;
  }
  const parsed = paymentSchema.safeParse(parsedBody.body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const result = await createTerminalPaymentIntent(
      parsed.data.amount,
      parsed.data.currency,
      { orderId: parsed.data.orderId, userId: actor.userId },
    );
    await logPosTerminalControlEvent(actor, {
      action: AUDIT_ACTIONS.POS_TERMINAL_PAYMENT_INTENT_CREATED,
      entityId: parsed.data.orderId,
      label: parsed.data.orderId,
      metadata: {
        amount: parsed.data.amount,
        currency: parsed.data.currency,
        paymentIntentId: result.paymentIntentId,
      },
    });
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Payment intent failed" },
      { status: 503 },
    );
  }
}

export async function PUT(request: Request) {
  const actor = await requirePosTerminalAccess("PUT");
  if (!actor) {
    return NextResponse.json({ error: "You do not have permission to perform this action." }, { status: 403 });
  }
  const parsedBody = await parseJsonBody(request);
  if (!parsedBody.ok) {
    return parsedBody.response;
  }
  const parsed = processSchema.safeParse(parsedBody.body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const transaction = await processTerminalPayment(
      parsed.data.paymentIntentId,
      parsed.data.orderId,
      actor.userId,
    );
    await logPosTerminalControlEvent(actor, {
      action: AUDIT_ACTIONS.POS_TERMINAL_PAYMENT_CAPTURED,
      entityId: parsed.data.orderId,
      label: parsed.data.orderId,
      metadata: {
        paymentIntentId: parsed.data.paymentIntentId,
        transactionId: transaction.id,
      },
    });
    return NextResponse.json({ success: true, transaction });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Payment processing failed" },
      { status: 400 },
    );
  }
}

export async function DELETE(request: Request) {
  const actor = await requirePosTerminalAccess("DELETE");
  if (!actor) {
    return NextResponse.json({ error: "You do not have permission to perform this action." }, { status: 403 });
  }
  const parsedBody = await parseJsonBody(request);
  if (!parsedBody.ok) {
    return parsedBody.response;
  }
  const { paymentIntentId } = parsedBody.body as { paymentIntentId?: string };
  if (!paymentIntentId) {
    return NextResponse.json({ error: "paymentIntentId required" }, { status: 400 });
  }
  try {
    await cancelTerminalPayment(paymentIntentId);
    await logPosTerminalControlEvent(actor, {
      action: AUDIT_ACTIONS.POS_TERMINAL_PAYMENT_CANCELLED,
      entityId: paymentIntentId,
      label: paymentIntentId,
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Cancel failed" },
      { status: 400 },
    );
  }
}
