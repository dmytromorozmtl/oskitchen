import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { CateringBeoDocument } from "@/lib/catering/catering-beo-p2-64-types";

type Props = {
  beo: CateringBeoDocument;
};

export function CateringBeoDocumentView({ beo }: Props) {
  return (
    <article className="space-y-6" data-testid="catering-beo-document">
      <header className="space-y-1 border-b pb-4">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">Banquet Event Order</h1>
          <Badge variant="secondary">{beo.beoNumber}</Badge>
        </div>
        <p className="text-lg font-medium">{beo.eventTitle}</p>
        <p className="text-sm text-muted-foreground">
          {beo.client.name}
          {beo.client.company ? ` · ${beo.client.company}` : ""}
          {beo.eventDateLabel ? ` · ${beo.eventDateLabel}` : ""}
        </p>
        <p className="text-xs text-muted-foreground">
          {beo.client.email}
          {beo.client.phone ? ` · ${beo.client.phone}` : ""}
        </p>
      </header>

      <Card data-testid="catering-beo-layout">
        <CardHeader>
          <CardTitle className="text-base">Layout &amp; room setup</CardTitle>
          <CardDescription>Service style, guest count, and venue configuration</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <p className="font-medium">Event type</p>
            <p className="text-muted-foreground">{beo.layout.roomSetup}</p>
          </div>
          <div>
            <p className="font-medium">Guest count</p>
            <p className="text-muted-foreground">{beo.layout.guestCount ?? "TBD"}</p>
          </div>
          <div className="sm:col-span-2">
            <p className="font-medium">Table configuration</p>
            <p className="text-muted-foreground">{beo.layout.tableConfiguration}</p>
          </div>
          {beo.layout.venueAddress ? (
            <div className="sm:col-span-2">
              <p className="font-medium">Venue</p>
              <p className="text-muted-foreground">{beo.layout.venueAddress}</p>
            </div>
          ) : null}
          {beo.layout.deliveryNotes ? (
            <div>
              <p className="font-medium">Delivery</p>
              <p className="text-muted-foreground">{beo.layout.deliveryNotes}</p>
            </div>
          ) : null}
          {beo.layout.setupNotes ? (
            <div>
              <p className="font-medium">Setup</p>
              <p className="text-muted-foreground">{beo.layout.setupNotes}</p>
            </div>
          ) : null}
          {beo.layout.staffingNotes ? (
            <div>
              <p className="font-medium">Staffing</p>
              <p className="text-muted-foreground">{beo.layout.staffingNotes}</p>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card data-testid="catering-beo-menu">
        <CardHeader>
          <CardTitle className="text-base">Menu</CardTitle>
          <CardDescription>Food, beverage, and service lines from the quote</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {beo.menu.length === 0 ? (
            <p className="text-sm text-muted-foreground">No menu lines on this quote yet.</p>
          ) : (
            beo.menu.map((section) => (
              <div key={section.category}>
                <h3 className="mb-2 text-sm font-semibold">{section.category}</h3>
                <ul className="space-y-1 text-sm">
                  {section.items.map((item, index) => (
                    <li key={`${section.category}-${index}`} className="flex justify-between gap-2">
                      <span>
                        {item.title}
                        {item.notes ? (
                          <span className="text-muted-foreground"> — {item.notes}</span>
                        ) : null}
                      </span>
                      <span className="tabular-nums text-muted-foreground">×{item.quantity}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card data-testid="catering-beo-timeline">
        <CardHeader>
          <CardTitle className="text-base">Service timeline</CardTitle>
          <CardDescription>Load-in through breakdown — Tripleseat-style run of show</CardDescription>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="py-2 pr-4">Time</th>
                <th className="py-2 pr-4">Activity</th>
                <th className="py-2">Owner</th>
              </tr>
            </thead>
            <tbody>
              {beo.timeline.map((entry, index) => (
                <tr key={`${entry.timeLabel}-${index}`} className="border-b border-border/60">
                  <td className="py-2 pr-4 whitespace-nowrap font-medium">{entry.timeLabel}</td>
                  <td className="py-2 pr-4">{entry.activity}</td>
                  <td className="py-2 text-muted-foreground">{entry.owner}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {beo.specialInstructions.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Special instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
              {beo.specialInstructions.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}
    </article>
  );
}
