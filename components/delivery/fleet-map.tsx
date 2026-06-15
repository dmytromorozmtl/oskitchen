"use client";

import * as React from "react";
import { MapPin } from "lucide-react";

export type FleetMapMarker = {
  id: string;
  label: string;
  lat: number;
  lng: number;
  status?: string;
};

/** Lightweight fleet map (OpenStreetMap embed) — no extra map SDK required. */
export function FleetMap({
  markers,
  center,
  className,
}: {
  markers: FleetMapMarker[];
  center?: { lat: number; lng: number };
  className?: string;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const c =
    center ??
    (markers[0]
      ? { lat: markers[0].lat, lng: markers[0].lng }
      : { lat: 43.6532, lng: -79.3832 });

  const bbox = React.useMemo(() => {
    if (!markers.length) {
      const pad = 0.02;
      return [c.lng - pad, c.lat - pad, c.lng + pad, c.lat + pad];
    }
    const lats = markers.map((m) => m.lat);
    const lngs = markers.map((m) => m.lng);
    const pad = 0.01;
    return [
      Math.min(...lngs) - pad,
      Math.min(...lats) - pad,
      Math.max(...lngs) + pad,
      Math.max(...lats) + pad,
    ];
  }, [markers, c.lat, c.lng]);

  const embedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox.join("%2C")}&layer=mapnik&marker=${c.lat}%2C${c.lng}`;

  return (
    <div className={className}>
      <div className="relative overflow-hidden rounded-xl border border-border/80 bg-muted/30">
        <iframe
          title="Fleet map"
          src={embedUrl}
          className="h-[320px] w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
        <div className="absolute bottom-0 left-0 right-0 max-h-28 overflow-y-auto bg-background/90 p-2 text-xs backdrop-blur-sm">
          {markers.length === 0 ? (
            <p className="text-muted-foreground">No active driver pings.</p>
          ) : (
            <ul className="space-y-1">
              {markers.map((m) => (
                <li key={m.id} className="flex items-center gap-2">
                  <MapPin className="h-3 w-3 shrink-0 text-primary" />
                  <span className="font-medium">{m.label}</span>
                  <span className="text-muted-foreground tabular-nums">
                    {m.lat.toFixed(4)}, {m.lng.toFixed(4)}
                    {m.status ? ` · ${m.status}` : ""}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
