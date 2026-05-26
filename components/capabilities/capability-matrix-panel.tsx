import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { CapabilityRow } from "@/lib/capabilities/capability-matrix";

import { CapabilityBadge } from "./capability-badge";
import { CapabilityDisclaimer } from "./capability-disclaimer";

export function CapabilityMatrixPanel({
  rows,
  title = "Capability matrix",
}: {
  rows: CapabilityRow[];
  title?: string;
}) {
  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        <CapabilityDisclaimer />
      </div>
      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[220px]">Capability</TableHead>
              <TableHead className="w-[140px]">Status</TableHead>
              <TableHead>What works</TableHead>
              <TableHead>Honest gaps / prerequisites</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="align-top font-medium">{r.label}</TableCell>
                <TableCell className="align-top">
                  <CapabilityBadge status={r.status} />
                </TableCell>
                <TableCell className="align-top text-sm text-muted-foreground">{r.works}</TableCell>
                <TableCell className="align-top text-sm text-muted-foreground">{r.gaps}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
