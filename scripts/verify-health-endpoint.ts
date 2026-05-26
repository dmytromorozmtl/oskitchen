import { summariseHealthPayload } from "@/lib/ops/health-summary";

async function main() {
  const url = process.argv[2];
  if (!url) {
    console.error("Usage: tsx scripts/verify-health-endpoint.ts <health-url>");
    process.exit(1);
  }

  let response: Response;
  try {
    response = await fetch(url, {
      headers: { accept: "application/json" },
      cache: "no-store",
    });
  } catch (error) {
    console.error(`health.fetch_error=${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }

  let rawBody = "";
  try {
    rawBody = await response.text();
  } catch (error) {
    console.error(`health.read_error=${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }

  let payload: unknown = null;
  try {
    payload = rawBody ? JSON.parse(rawBody) : null;
  } catch {
    payload = null;
  }

  const summary = summariseHealthPayload(payload);
  console.log(`health.url=${url}`);
  console.log(`health.httpStatus=${response.status}`);
  for (const line of summary.lines) {
    console.log(`health.${line}`);
  }

  if (!response.ok) {
    process.exit(1);
  }
  if (!summary.ok) {
    process.exit(1);
  }
}

void main();
