import type { Metadata } from "next";

import { SwaggerDocsClient } from "@/components/api/swagger-docs-client";
import { countApiRoutes } from "@/lib/api/openapi-spec";

export const metadata: Metadata = {
  title: "API Docs",
  robots: { index: false, follow: false },
};

export default function ApiDocsPage() {
  return <SwaggerDocsClient routeCount={countApiRoutes()} />;
}
