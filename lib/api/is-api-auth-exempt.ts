import { isApiRouteExemptFromMiddleware } from "@/lib/api/route-registry";

export function isApiAuthExempt(pathname: string): boolean {
  return isApiRouteExemptFromMiddleware(pathname);
}
