import Link from "next/link";

import { markFormSubmissionReadFormAction } from "@/actions/storefront-forms";
import { Button } from "@/components/ui/button";
import type { StorefrontFormSubmission } from "@prisma/client";

export function StorefrontFormSubmissionsTable({
  formId,
  submissions,
}: {
  formId: string;
  submissions: Pick<StorefrontFormSubmission, "id" | "createdAt" | "status" | "payloadJson" | "readAt">[];
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border/80">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-border/80 bg-muted/40 text-xs text-muted-foreground">
          <tr>
            <th className="px-3 py-2">When</th>
            <th className="px-3 py-2">Status</th>
            <th className="px-3 py-2">Payload</th>
            <th className="px-3 py-2" />
          </tr>
        </thead>
        <tbody>
          {submissions.map((s) => (
            <tr key={s.id} className="border-b border-border/60 align-top last:border-0">
              <td className="px-3 py-2 whitespace-nowrap text-xs">{s.createdAt.toLocaleString()}</td>
              <td className="px-3 py-2 text-xs">{s.status}</td>
              <td className="max-w-md px-3 py-2 font-mono text-[11px] text-muted-foreground">
                <pre className="whitespace-pre-wrap break-all">{JSON.stringify(s.payloadJson, null, 0).slice(0, 400)}</pre>
              </td>
              <td className="px-3 py-2">
                {s.status !== "READ" ? (
                  <form action={markFormSubmissionReadFormAction}>
                    <input type="hidden" name="submissionId" value={s.id} />
                    <Button type="submit" size="sm" variant="outline" className="rounded-full">
                      Mark read
                    </Button>
                  </form>
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="border-t border-border/80 p-3 text-xs text-muted-foreground">
        <Link href={`/api/storefront/form-submissions-export/${formId}`} className="text-primary underline-offset-4 hover:underline">
          Download CSV
        </Link>
      </p>
    </div>
  );
}
