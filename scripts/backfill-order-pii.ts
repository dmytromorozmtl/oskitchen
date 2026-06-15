import { prisma } from "@/lib/prisma";
import {
  decryptOrderCustomerEmail,
  encryptOrderCustomerEmail,
} from "@/lib/orders/order-pii";
import {
  encryptPiiField,
  isPiiEncryptionEnabled,
  PII_ENCRYPTED_PREFIX,
} from "@/lib/security/pii-field";

const ORDER_EMAIL_ENCRYPTED_PREFIX = "enc:order-email:v1:";

const args = new Set(process.argv.slice(2));
const execute = args.has("--execute");
const limitArg = process.argv.find((value) => value.startsWith("--limit="));
const batchSize = Math.max(
  1,
  Number.parseInt(limitArg?.split("=")[1] ?? "500", 10) || 500,
);

if (execute && !isPiiEncryptionEnabled()) {
  console.error("ENCRYPTION_KEY must be configured before running --execute.");
  process.exit(1);
}

function nextNameValue(value: string | null): string | null | undefined {
  if (!value) return undefined;
  if (value.startsWith(PII_ENCRYPTED_PREFIX)) return undefined;
  return encryptPiiField(value);
}

function nextPhoneValue(value: string | null): string | null | undefined {
  if (!value) return undefined;
  if (value.startsWith(PII_ENCRYPTED_PREFIX)) return undefined;
  return encryptPiiField(value);
}

function nextEmailValue(value: string | null): string | null | undefined {
  if (!value) return undefined;
  if (value.startsWith(ORDER_EMAIL_ENCRYPTED_PREFIX)) return undefined;
  const plain = decryptOrderCustomerEmail(value);
  return plain ? encryptOrderCustomerEmail(plain) : undefined;
}

async function main() {
  let cursor: string | undefined;
  let scanned = 0;
  let affected = 0;
  let nameUpdates = 0;
  let emailUpdates = 0;
  let phoneUpdates = 0;

  while (true) {
    const rows = await prisma.order.findMany({
      ...(cursor
        ? {
            cursor: { id: cursor },
            skip: 1,
          }
        : {}),
      orderBy: { id: "asc" },
      take: batchSize,
      select: {
        id: true,
        customerName: true,
        customerEmail: true,
        customerPhone: true,
      },
    });

    if (rows.length === 0) break;

    for (const row of rows) {
      scanned += 1;
      const data: {
        customerName?: string | null;
        customerEmail?: string | null;
        customerPhone?: string | null;
      } = {};

      const customerName = nextNameValue(row.customerName);
      const customerEmail = nextEmailValue(row.customerEmail);
      const customerPhone = nextPhoneValue(row.customerPhone);

      if (customerName !== undefined) {
        data.customerName = customerName;
        nameUpdates += 1;
      }
      if (customerEmail !== undefined) {
        data.customerEmail = customerEmail;
        emailUpdates += 1;
      }
      if (customerPhone !== undefined) {
        data.customerPhone = customerPhone;
        phoneUpdates += 1;
      }

      if (Object.keys(data).length === 0) continue;
      affected += 1;

      if (execute) {
        await prisma.order.update({
          where: { id: row.id },
          data,
        });
      }
    }

    cursor = rows.at(-1)?.id;
  }

  console.log(
    JSON.stringify(
      {
        mode: execute ? "execute" : "dry-run",
        scanned,
        affected,
        fieldUpdates: {
          customerName: nameUpdates,
          customerEmail: emailUpdates,
          customerPhone: phoneUpdates,
        },
      },
      null,
      2,
    ),
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
