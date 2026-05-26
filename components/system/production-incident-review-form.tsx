import { updateProductionIncidentReviewFormAction } from "@/actions/production-incidents";
import {
  PRODUCTION_INCIDENT_REVIEW_STATUSES,
  PRODUCTION_INCIDENT_ROOT_CAUSE_CATEGORIES,
  type ProductionIncidentAssigneeOption,
  type ProductionIncidentItem,
} from "@/services/incidents/production-incident-rollup-service";
import { Button } from "@/components/ui/button";

export function ProductionIncidentReviewForm({
  incident,
  assignees,
  className = "grid w-full min-w-[320px] gap-2 rounded-lg border border-zinc-700 bg-zinc-950/70 p-3 text-xs md:w-[380px]",
}: {
  incident: ProductionIncidentItem;
  assignees: ProductionIncidentAssigneeOption[];
  className?: string;
}) {
  return (
    <form action={updateProductionIncidentReviewFormAction} className={className}>
      <input type="hidden" name="incidentId" value={incident.id} />
      <label className="grid gap-1">
        <span className="font-medium text-foreground">Review status</span>
        <select
          name="reviewStatus"
          defaultValue={incident.reviewStatus}
          className="rounded-md border border-input bg-background px-2 py-1.5 text-xs"
        >
          {PRODUCTION_INCIDENT_REVIEW_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status.toLowerCase()}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-1">
        <span className="font-medium text-foreground">Root cause</span>
        <select
          name="rootCauseCategory"
          defaultValue={incident.rootCauseCategory ?? ""}
          className="rounded-md border border-input bg-background px-2 py-1.5 text-xs"
        >
          <option value="">Unclassified</option>
          {PRODUCTION_INCIDENT_ROOT_CAUSE_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category.replace(/_/g, " ")}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-1">
        <span className="font-medium text-foreground">Remediation owner</span>
        <select
          name="remediationOwnerId"
          defaultValue={incident.remediationOwnerId ?? ""}
          className="rounded-md border border-input bg-background px-2 py-1.5 text-xs"
        >
          <option value="">No remediation owner</option>
          {assignees.map((assignee) => (
            <option key={assignee.userId} value={assignee.userId}>
              {assignee.fullName} ({assignee.email})
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-1">
        <span className="font-medium text-foreground">Remediation due date</span>
        <input
          type="date"
          name="remediationDueOn"
          defaultValue={incident.remediationDueAt?.slice(0, 10) ?? ""}
          className="rounded-md border border-input bg-background px-2 py-1.5 text-xs"
        />
      </label>
      <label className="grid gap-1">
        <span className="font-medium text-foreground">Review summary</span>
        <textarea
          name="reviewSummary"
          defaultValue={incident.reviewSummary ?? ""}
          rows={3}
          placeholder="Root cause, remediation plan, and prevention notes"
          className="rounded-md border border-input bg-background px-2 py-1.5 text-xs"
        />
      </label>
      <Button type="submit" size="sm" variant="outline" className="rounded-full">
        Save review
      </Button>
    </form>
  );
}
