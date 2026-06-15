import { updateProductionIncidentWorkflowFormAction } from "@/actions/production-incidents";
import type {
  ProductionIncidentAssigneeOption,
  ProductionIncidentItem,
} from "@/services/incidents/production-incident-rollup-service";
import { Button } from "@/components/ui/button";

export function ProductionIncidentWorkflowForm({
  incident,
  assignees,
  className = "grid w-full min-w-[320px] gap-2 rounded-lg border border-border/60 bg-background/80 p-3 text-xs md:w-[380px]",
  submitLabel = "Save workflow",
}: {
  incident: ProductionIncidentItem;
  assignees: ProductionIncidentAssigneeOption[];
  className?: string;
  submitLabel?: string;
}) {
  return (
    <form action={updateProductionIncidentWorkflowFormAction} className={className}>
      <input type="hidden" name="incidentId" value={incident.id} />
      <label className="grid gap-1">
        <span className="font-medium text-foreground">Workflow</span>
        <select
          name="workflowStatus"
          defaultValue={incident.workflowStatus}
          className="rounded-md border border-input bg-background px-2 py-1.5 text-xs"
        >
          <option value="OPEN">Open</option>
          <option value="ACKNOWLEDGED">Acknowledged</option>
          <option value="MONITORING">Monitoring</option>
          <option value="RESOLVED">Resolved</option>
        </select>
      </label>
      <label className="grid gap-1">
        <span className="font-medium text-foreground">Owner override</span>
        <select
          name="assignedToId"
          defaultValue={incident.assignedToId ?? ""}
          className="rounded-md border border-input bg-background px-2 py-1.5 text-xs"
        >
          <option value="">Use live/source owner</option>
          {assignees.map((assignee) => (
            <option key={assignee.userId} value={assignee.userId}>
              {assignee.fullName} ({assignee.email})
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-1">
        <span className="font-medium text-foreground">Resolution note</span>
        <input
          type="text"
          name="resolutionSummary"
          defaultValue={incident.resolutionSummary ?? ""}
          placeholder="Required when resolving this incident"
          className="rounded-md border border-input bg-background px-2 py-1.5 text-xs"
        />
      </label>
      <Button type="submit" size="sm" variant="outline" className="rounded-full">
        {submitLabel}
      </Button>
    </form>
  );
}
