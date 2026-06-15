import { PublicShell } from "@/components/marketing/public-page";

export const metadata = { title: "Developer docs" };

export default function DeveloperDocsPage() {
  return (
    <PublicShell>
      <main className="mx-auto max-w-3xl space-y-6 px-4 py-16 sm:px-6">
        <h1 className="text-3xl font-semibold tracking-tight">Developer docs</h1>
        <p className="text-muted-foreground">Start with `docs/API_REFERENCE.md` and `docs/PLATFORM_API_ROADMAP.md`. API access is Enterprise-gated; broader app platform features are roadmap only.</p>
      </main>
    </PublicShell>
  );
}
