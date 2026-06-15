import { updateProductionIncidentRemediationControlFormAction } from "@/actions/production-incidents";
import {
  PRODUCTION_INCIDENT_REMEDIATION_CONTROL_STATUSES,
  type ProductionIncidentItem,
} from "@/services/incidents/production-incident-rollup-service";
import { Button } from "@/components/ui/button";

export function ProductionIncidentRemediationControlForm({
  incident,
  className = "grid w-full min-w-[320px] gap-2 rounded-lg border border-zinc-700 bg-zinc-950/70 p-3 text-xs md:w-[380px]",
}: {
  incident: ProductionIncidentItem;
  className?: string;
}) {
  return (
    <form action={updateProductionIncidentRemediationControlFormAction} className={className}>
      <input type="hidden" name="incidentId" value={incident.id} />
      <label className="grid gap-1">
        <span className="font-medium text-foreground">Remediation control</span>
        <select
          name="remediationControlStatus"
          defaultValue={incident.remediationControlStatus}
          className="rounded-md border border-input bg-background px-2 py-1.5 text-xs"
        >
          {PRODUCTION_INCIDENT_REMEDIATION_CONTROL_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status.toLowerCase().replace(/_/g, " ")}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-1">
        <span className="font-medium text-foreground">Snooze until</span>
        <input
          type="date"
          name="remediationSnoozedUntilOn"
          defaultValue={incident.remediationSnoozedUntil?.slice(0, 10) ?? ""}
          className="rounded-md border border-input bg-background px-2 py-1.5 text-xs"
        />
      </label>
      <label className="grid gap-1">
        <span className="font-medium text-foreground">Control note</span>
        <textarea
          name="remediationControlSummary"
          defaultValue={incident.remediationControlSummary ?? ""}
          rows={2}
          placeholder="Owner engaged, accepted delay reason, or reassignment context"
          className="rounded-md border border-input bg-background px-2 py-1.5 text-xs"
        />
      </label>
      <Button type="submit" size="sm" variant="outline" className="rounded-full">
        Save control
      </Button>
    </form>
  );
}
