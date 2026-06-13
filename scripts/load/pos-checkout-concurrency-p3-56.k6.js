/**
 * k6 — POS checkout concurrency load (P3-56).
 *
 * Concurrent unauthenticated POS terminal probes — must reject fast without server errors.
 * Full checkout mutation remains Playwright E2E; this guards ingress concurrency.
 *
 * Run:
 *   BASE_URL=http://localhost:3000 k6 run scripts/load/pos-checkout-concurrency-p3-56.k6.js
 */
import http from "k6/http";
import { check, sleep } from "k6";

const base = (__ENV.BASE_URL || "http://localhost:3000").replace(/\/+$/, "");
const maxP95Ms = Number(__ENV.POS_CHECKOUT_P95_MS || 3000);

export const options = {
  vus: Number(__ENV.K6_VUS || 8),
  duration: __ENV.K6_DURATION || "45s",
  thresholds: {
    checks: ["rate>0.95"],
    "http_req_failed{scenario:pos_checkout}": ["rate<0.05"],
    "http_req_duration{scenario:pos_checkout}": [`p(95)<${maxP95Ms}`],
  },
};

function registerIp() {
  return `10.20.${(__VU % 200) + 1}.${(__ITER % 250) + 1}`;
}

export default function () {
  const getRes = http.get(`${base}/api/pos/terminal`, {
    tags: { scenario: "pos_checkout", step: "terminal_get" },
    headers: {
      "X-Forwarded-For": registerIp(),
      Accept: "application/json",
    },
  });

  check(getRes, {
    "pos terminal does not 500": (r) => r.status < 500,
    "pos terminal responds within SLA": (r) => r.timings.duration < maxP95Ms,
  });

  const postRes = http.post(
    `${base}/api/pos/terminal`,
    JSON.stringify({ action: "ping", registerId: `k6-${__VU}` }),
    {
      tags: { scenario: "pos_checkout", step: "terminal_post" },
      headers: {
        "Content-Type": "application/json",
        "X-Forwarded-For": registerIp(),
      },
    },
  );

  check(postRes, {
    "pos terminal post does not 500": (r) => r.status < 500,
    "pos terminal post responds within SLA": (r) => r.timings.duration < maxP95Ms,
  });

  sleep(0.1);
}
