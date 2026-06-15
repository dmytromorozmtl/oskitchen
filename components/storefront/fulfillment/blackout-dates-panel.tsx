import {
  createStorefrontBlackoutDateFormAction,
  deleteStorefrontBlackoutDateFormAction,
} from "@/actions/storefront-blackout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export type BlackoutRow = {
  id: string;
  startDate: string;
  endDate: string;
  message: string | null;
};

export function BlackoutDatesPanel({ rows }: { rows: BlackoutRow[] }) {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium">Blackout dates</p>
        <p className="text-xs text-muted-foreground">
          Blocks checkout on selected days (in addition to site-wide closure). Evaluated in your kitchen timezone.
        </p>
      </div>
      {rows.length > 0 ? (
        <ul className="divide-y divide-border/80 rounded-xl border border-border/80 text-sm">
          {rows.map((r) => (
            <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
              <div>
                <span className="font-mono text-xs">
                  {r.startDate} → {r.endDate}
                </span>
                {r.message ? <p className="mt-1 text-muted-foreground">{r.message}</p> : null}
              </div>
              <form action={deleteStorefrontBlackoutDateFormAction}>
                <input type="hidden" name="id" value={r.id} />
                <Button type="submit" variant="outline" size="sm" className="rounded-full">
                  Remove
                </Button>
              </form>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">No blackout windows — add one below.</p>
      )}
      <form action={createStorefrontBlackoutDateFormAction} className="grid gap-3 rounded-xl border border-border/60 p-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="blackout-start">Start date</Label>
          <Input id="blackout-start" name="startDate" type="date" required className="rounded-xl" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="blackout-end">End date</Label>
          <Input id="blackout-end" name="endDate" type="date" required className="rounded-xl" />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="blackout-message">Message (optional)</Label>
          <Textarea id="blackout-message" name="message" rows={2} className="rounded-xl" placeholder="Closed for maintenance" />
        </div>
        <Button type="submit" className="rounded-full sm:col-span-2">
          Add blackout
        </Button>
      </form>
    </div>
  );
}
