/**
 * k6 — KDS refresh / poll fallback load (P3-56).
 *
 * Rapid health probes simulating kitchen poll cadence under burst refresh.
 *
 * Run:
 *   BASE_URL=http://localhost:3000 k6 run scripts/load/kds-refresh-p3-56.k6.js
 */
import http from "k6/http";
import { check, sleep } from "k6";

const base = (__ENV.BASE_URL || "http://localhost:3000").replace(/\/+$/, "");
const maxP95Ms = Number(__ENV.KDS_REFRESH_P95_MS || 1500);
const pollMs = Number(__ENV.KDS_POLL_MS || 150);

export const options = {
  vus: Number(__ENV.K6_VUS || 15),
  duration: __ENV.K6_DURATION || "30s",
  thresholds: {
    checks: ["rate>0.99"],
    "http_req_failed{scenario:kds_refresh}": ["rate<0.01"],
    "http_req_duration{scenario:kds_refresh}": [`p(95)<${maxP95Ms}`],
  },
};

export default function () {
  const res = http.get(`${base}/api/health`, {
    tags: { scenario: "kds_refresh", step: "poll_health" },
    headers: {
      "X-Kos-Kds-Poll": "1",
      "X-Kos-Visitor-Id": `k6-kds-${__VU}-${__ITER}`,
    },
  });

  check(res, {
    "health ok under kds refresh load": (r) => r.status === 200,
    "health responds within kds SLA": (r) => r.timings.duration < maxP95Ms,
  });

  sleep(pollMs / 1000);
}
