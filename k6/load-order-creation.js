import http from "k6/http";
import { check, sleep } from "k6";

const BASE = __ENV.BASE_URL || "https://staging.os-kitchen.com";

export const options = {
  stages: [
    { duration: "1m", target: 20 },
    { duration: "3m", target: 50 },
    { duration: "1m", target: 0 },
  ],
  thresholds: {
    http_req_duration: ["p(99)<2000"],
    http_req_failed: ["rate<0.01"],
  },
};

export default function () {
  const res = http.get(`${BASE}/api/health`);
  check(res, { "health ok": (r) => r.status === 200 });
  sleep(1);
}
