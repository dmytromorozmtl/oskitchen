/** Location filter for dashboards and reports (additive — single-location workspaces default to "all"). */
export type LocationScopeMode = "ALL" | "SINGLE";

export type LocationScope = {
  mode: LocationScopeMode;
  locationId: string | null;
};

export function allLocations(): LocationScope {
  return { mode: "ALL", locationId: null };
}

export function singleLocation(locationId: string): LocationScope {
  return { mode: "SINGLE", locationId };
}
