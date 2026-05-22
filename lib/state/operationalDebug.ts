type DebuggableOperationalState = {
  selectedDistrict: string | null;
  selectedFloodZone: string | null;
  selectedBiodiversityEntity: string | null;
  selectedMapMarker?: string | null;
  isDrawerOpen: boolean;
  isDrawerMinimized: boolean;
  timelineFilter: string;
  activeContextLevel?: string;
  lastInteractionSource: string;
};

export function debugOperationalState(
  action: string,
  state: DebuggableOperationalState
) {
  if (process.env.NODE_ENV !== "development") return;

  console.debug("[operational-state]", action, {
    district: state.selectedDistrict,
    floodZone: state.selectedFloodZone,
    marker: state.selectedMapMarker ?? null,
    biodiversity: state.selectedBiodiversityEntity,
    drawerOpen: state.isDrawerOpen,
    drawerMinimized: state.isDrawerMinimized,
    filter: state.timelineFilter,
    contextLevel: state.activeContextLevel ?? "district",
    source: state.lastInteractionSource
  });
}
