/**
 * k6 load sketch — edge assign path + wormhole SLO validation.
 * Run: k6 run scripts/load/edge-assign-wormhole.k6.js
 * Env: BASE_URL, STORE_SLUG, WORMHOLE_SLO_MS (default 500)
 */
import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  vus: Number(__ENV.K6_VUS || 10),
  duration: __ENV.K6_DURATION || "30s",
  thresholds: {
    http_req_duration: [`p(95)<${Number(__ENV.WORMHOLE_SLO_MS || 500)}`],
  },
};

const base = __ENV.BASE_URL || "http://localhost:3000";
const slug = __ENV.STORE_SLUG || "demo";

export default function () {
  const res = http.get(`${base}/s/${slug}/menu`, {
    headers: {
      "x-kos-visitor-id": `k6-${__VU}-${__ITER}`,
    },
  });
  check(res, {
    "status 200": (r) => r.status === 200,
    "assign header or cookie": (r) =>
      r.headers["X-Kos-Ab-Theme"] === "draft" ||
      r.headers["X-Kos-Ab-Theme"] === "published" ||
      (r.cookies && (r.cookies.kos_ab_theme || r.cookies["kos_ab_theme"])),
  });
  sleep(0.5);
}
