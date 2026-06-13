/**
 * k6 — webhook burst load (P3-56).
 *
 * Rapid unsigned webhook POSTs — ingress must fail fast (401/400), not 500/timeout.
 *
 * Run:
 *   BASE_URL=http://localhost:3000 k6 run scripts/load/webhook-burst-p3-56.k6.js
 */
import http from "k6/http";
import { check, sleep } from "k6";

const base = (__ENV.BASE_URL || "http://localhost:3000").replace(/\/+$/, "");
const maxP95Ms = Number(__ENV.WEBHOOK_BURST_P95_MS || 2000);

export const options = {
  vus: Number(__ENV.K6_VUS || 20),
  duration: __ENV.K6_DURATION || "30s",
  thresholds: {
    checks: ["rate>0.95"],
    "http_req_failed{scenario:webhook_burst}": ["rate<0.05"],
    "http_req_duration{scenario:webhook_burst}": [`p(95)<${maxP95Ms}`],
  },
};

function deliveryIp() {
  const b = ((__VU - 1) % 200) + 1;
  const c = (__ITER % 200) + 1;
  return `172.16.${b}.${c}`;
}

export default function () {
  const body = JSON.stringify({
    id: `k6-${__VU}-${__ITER}`,
    status: "processing",
  });

  const res = http.post(`${base}/api/webhooks/woocommerce?cid=load-test`, body, {
    headers: {
      "Content-Type": "application/json",
      "X-WC-Webhook-Topic": "order.updated",
      "X-WC-Webhook-Delivery-Id": `k6-${__VU}-${__ITER}`,
      "X-WC-Webhook-Signature": "invalid-k6-signature",
      "X-Forwarded-For": deliveryIp(),
    },
    tags: { scenario: "webhook_burst", step: "unsigned_post" },
  });

  check(res, {
    "webhook ingress responds quickly": (r) => r.timings.duration < maxP95Ms,
    "webhook ingress does not 500": (r) => r.status < 500,
    "webhook ingress rejects unsigned": (r) => r.status === 401 || r.status === 400 || r.status === 404,
  });

  sleep(0.05);
}
