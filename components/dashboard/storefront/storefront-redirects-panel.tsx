import {
  deleteStorefrontRedirectFormAction,
  upsertStorefrontRedirectFormAction,
} from "@/actions/storefront-advanced";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type StorefrontRedirectRow = {
  id: string;
  fromPath: string;
  toPath: string;
  httpStatus: number;
  active: boolean;
  hitCount: number;
};

export function StorefrontRedirectsPanel({ rows }: { rows: StorefrontRedirectRow[] }) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium">URL redirects</p>
        <p className="text-xs text-muted-foreground">
          Paths are relative to your storefront host (e.g. <code className="rounded bg-muted px-1">/old-menu</code> →{" "}
          <code className="rounded bg-muted px-1">/menu</code>). Enable{" "}
          <code className="rounded bg-muted px-1">STOREFRONT_REDIRECTS_ENABLED=true</code> in production for middleware
          execution.
        </p>
      </div>

      {rows.length > 0 ? (
        <ul className="divide-y divide-border/80 rounded-xl border border-border/80 text-sm">
          {rows.map((r) => (
            <li key={r.id} className="space-y-3 px-4 py-4">
              <form action={upsertStorefrontRedirectFormAction} className="grid gap-3 sm:grid-cols-2">
                <input type="hidden" name="id" value={r.id} />
                <div className="space-y-2">
                  <Label htmlFor={`from-${r.id}`}>From</Label>
                  <Input
                    id={`from-${r.id}`}
                    name="fromPath"
                    defaultValue={r.fromPath}
                    className="rounded-xl font-mono text-xs"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`to-${r.id}`}>To</Label>
                  <Input
                    id={`to-${r.id}`}
                    name="toPath"
                    defaultValue={r.toPath}
                    className="rounded-xl font-mono text-xs"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`status-${r.id}`}>HTTP status</Label>
                  <select
                    id={`status-${r.id}`}
                    name="httpStatus"
                    defaultValue={String(r.httpStatus)}
                    className="flex h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
                  >
                    <option value="301">301 Permanent</option>
                    <option value="302">302 Temporary</option>
                  </select>
                </div>
                <label className="flex items-center gap-2 text-sm sm:col-span-2">
                  <input type="checkbox" name="active" value="on" defaultChecked={r.active} className="h-4 w-4" />
                  Active
                  <span className="text-muted-foreground">({r.hitCount} hits)</span>
                </label>
                <div className="flex flex-wrap gap-2 sm:col-span-2">
                  <Button type="submit" size="sm" className="rounded-full">
                    Save
                  </Button>
                </div>
              </form>
              <form action={deleteStorefrontRedirectFormAction}>
                <input type="hidden" name="id" value={r.id} />
                <Button type="submit" variant="outline" size="sm" className="rounded-full">
                  Delete
                </Button>
              </form>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">No redirects yet.</p>
      )}

      <form
        action={upsertStorefrontRedirectFormAction}
        className="grid gap-3 rounded-xl border border-dashed border-border/80 p-4 sm:grid-cols-2"
      >
        <p className="text-sm font-medium sm:col-span-2">Add redirect</p>
        <div className="space-y-2">
          <Label htmlFor="redirect-from-new">From path</Label>
          <Input
            id="redirect-from-new"
            name="fromPath"
            placeholder="/legacy"
            className="rounded-xl font-mono text-xs"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="redirect-to-new">To path</Label>
          <Input
            id="redirect-to-new"
            name="toPath"
            placeholder="/menu"
            className="rounded-xl font-mono text-xs"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="redirect-status-new">HTTP status</Label>
          <select
            id="redirect-status-new"
            name="httpStatus"
            defaultValue="302"
            className="flex h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
          >
            <option value="301">301 Permanent</option>
            <option value="302">302 Temporary</option>
          </select>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="active" value="on" defaultChecked className="h-4 w-4" />
          Active
        </label>
        <div className="sm:col-span-2">
          <Button type="submit" className="rounded-full">
            Add redirect
          </Button>
        </div>
      </form>
    </div>
  );
}
