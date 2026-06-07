import Link from "next/link";
import { ArrowRight, GitBranch } from "lucide-react";

import { toggleKdsDaisyChainLinkAction } from "@/actions/kitchen/daisy-chain";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DESIGN_POLISH_ABSOLUTE_FINAL_POLICY_ID,
  DESIGN_POLISH_BADGE_ROW_CLASS,
  DESIGN_POLISH_CARD_CLASS,
  DESIGN_POLISH_HERO_BANNER_CLASS,
  DESIGN_POLISH_ROW_SURFACE_CLASS,
  DESIGN_POLISH_STRIPE_OK_CLASS,
} from "@/lib/design/absolute-final-design-polish-tokens";
import { KDS_DAISY_CHAIN_CONFIG_ROUTE } from "@/lib/kitchen/kds-daisy-chain-config-absolute-final-policy";
import type { KdsDaisyChainConfigModel } from "@/services/kitchen/kds-daisy-chain-config-service";

export function KdsDaisyChainConfigPanel({ model }: { model: KdsDaisyChainConfigModel }) {
  const { links, enabledLinkCount, chainPaths, bumpPreview } = model;

  return (
    <div className="space-y-6" data-testid="kds-daisy-chain-config-panel">
      <div className={DESIGN_POLISH_HERO_BANNER_CLASS} role="note">
        <p className="font-medium text-foreground">KDS daisy-chain config (Beta)</p>
        <p className="mt-1 text-sm text-muted-foreground dark:text-muted-foreground/90">
          <strong className="text-foreground">NCR Aloha parity — BETA daisy-chain config.</strong>{" "}
          Defines bump handoff links between KDS screens (Prep → line → Expo). Routing rules still
          assign the first station; daisy-chain controls the next screen after bump. Not a proprietary
          terminal hub sync.
        </p>
      </div>

      <div className={DESIGN_POLISH_BADGE_ROW_CLASS}>
        <Badge variant="outline" className="rounded-full">
          {enabledLinkCount}/{links.length} links enabled
        </Badge>
        <Badge variant="secondary" className="rounded-full">
          {chainPaths.length} active paths
        </Badge>
        <Badge variant="outline" className="rounded-full">
          bump handoff · settingsCenterJson
        </Badge>
      </div>

      <Card className={DESIGN_POLISH_CARD_CLASS}>
        <CardHeader>
          <CardTitle className="text-lg">Chain paths</CardTitle>
          <CardDescription>
            Enabled Prep → specialty → Expo paths — mirrors NCR Aloha multi-screen bump flow.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {chainPaths.length ? (
            chainPaths.map((path) => (
              <Badge
                key={path}
                variant="outline"
                className="rounded-full font-normal"
                data-testid="kds-daisy-chain-path"
              >
                <GitBranch className={`mr-1 h-3 w-3 ${DESIGN_POLISH_STRIPE_OK_CLASS}`} aria-hidden />
                {path}
              </Badge>
            ))
          ) : (
            <p className="text-sm text-muted-foreground dark:text-muted-foreground/90">
              No enabled chain paths — enable links below.
            </p>
          )}
        </CardContent>
      </Card>

      <Card className={DESIGN_POLISH_CARD_CLASS}>
        <CardHeader>
          <CardTitle className="text-lg">Bump handoff links</CardTitle>
          <CardDescription>
            Toggle each from → to link. Disabled links skip that bump handoff step.
          </CardDescription>
        </CardHeader>
        <CardContent className={`overflow-x-auto ${DESIGN_POLISH_ROW_SURFACE_CLASS}`}>
          <Table>
            <TableHeader>
              <TableRow className="dark:border-border/50">
                <TableHead>Link</TableHead>
                <TableHead>From</TableHead>
                <TableHead>To</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Toggle</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {links.map((link) => (
                <TableRow
                  key={link.id}
                  className="dark:border-border/50"
                  data-testid="kds-daisy-chain-link-row"
                >
                  <TableCell className="font-medium">{link.label}</TableCell>
                  <TableCell className="font-mono text-xs">{link.fromStationId}</TableCell>
                  <TableCell className="font-mono text-xs">{link.toStationId}</TableCell>
                  <TableCell>
                    <Badge
                      variant={link.enabled ? "secondary" : "outline"}
                      className="rounded-full text-[10px]"
                    >
                      {link.enabled ? "enabled" : "disabled"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <form action={toggleKdsDaisyChainLinkAction}>
                      <input type="hidden" name="linkId" value={link.id} />
                      <input type="hidden" name="enabled" value={link.enabled ? "false" : "true"} />
                      <Button type="submit" size="sm" variant="ghost" className="rounded-full">
                        {link.enabled ? "Disable" : "Enable"}
                      </Button>
                    </form>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className={DESIGN_POLISH_CARD_CLASS}>
        <CardHeader>
          <CardTitle className="text-lg">Bump preview</CardTitle>
          <CardDescription>
            Next station after bump for each configured screen — used by production KDS handoff.
          </CardDescription>
        </CardHeader>
        <CardContent className={`overflow-x-auto ${DESIGN_POLISH_ROW_SURFACE_CLASS}`}>
          <Table>
            <TableHeader>
              <TableRow className="dark:border-border/50">
                <TableHead>Current screen</TableHead>
                <TableHead>Next after bump</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bumpPreview.map((row) => (
                <TableRow
                  key={row.linkId}
                  className="dark:border-border/50"
                  data-testid="kds-daisy-chain-bump-preview-row"
                >
                  <TableCell className="font-medium">{row.fromStation}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1">
                      <ArrowRight
                        className={`h-3.5 w-3.5 ${DESIGN_POLISH_STRIPE_OK_CLASS}`}
                        aria-hidden
                      />
                      {row.nextStation}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        <Button asChild variant="outline" size="sm" className="rounded-full">
          <Link href="/dashboard/kitchen/routing-rules">Station routing rules</Link>
        </Button>
        <Button asChild variant="outline" size="sm" className="rounded-full">
          <Link href="/dashboard/kitchen/production">Open production view</Link>
        </Button>
      </div>

      <p className="sr-only">
        {KDS_DAISY_CHAIN_CONFIG_ROUTE} · kds-daisy-chain-config-absolute-final-v1
      </p>
      <p className="sr-only">{DESIGN_POLISH_ABSOLUTE_FINAL_POLICY_ID}</p>
    </div>
  );
}
