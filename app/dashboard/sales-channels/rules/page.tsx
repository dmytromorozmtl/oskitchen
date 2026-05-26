import { getTenantActor } from "@/lib/scope/cached-tenant";
import { prisma } from "@/lib/prisma";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChannelRuleCreateForm } from "@/components/sales-channels/channel-rule-create-form";
import { ChannelRuleToggleButton } from "@/components/sales-channels/channel-rule-toggle-button";

export default async function ChannelRulesPage() {
  const { userId } = await getTenantActor();
  const rules = await prisma.channelRule.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    take: 50,
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Channel rules</h2>
        <p className="text-sm text-muted-foreground">
          Declarative automation on import lifecycle events. Conditions and actions are JSON for now
          — execution wiring lands incrementally without faking partner callbacks.
        </p>
      </div>

      <ChannelRuleCreateForm />

      {rules.length === 0 ? (
        <p className="text-sm text-muted-foreground">No rules yet. Create one above.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Trigger</TableHead>
              <TableHead>Active</TableHead>
              <TableHead className="text-right"> </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rules.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="font-medium">{r.name}</TableCell>
                <TableCell className="text-xs">{r.trigger}</TableCell>
                <TableCell>{r.active ? "yes" : "no"}</TableCell>
                <TableCell className="text-right">
                  <ChannelRuleToggleButton ruleId={r.id} active={r.active} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
