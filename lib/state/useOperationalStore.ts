"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { StateStorage } from "zustand/middleware";

import { debugOperationalState } from "@/lib/state/operationalDebug";
import type { IncidentDraft, IncidentFilterState, SimulationRole } from "@/types/dashboard";
import type { IncidentReport } from "@/types/environment";

export type LayerKey = "flood" | "biodiversity" | "districtLabels";
export type TimelineFilter = "all" | "flood" | "biodiversity" | "sewage" | "district";
export type InteractionSource =
  | "system"
  | "drawer"
  | "map"
  | "timeline"
  | "biodiversity"
  | "node";
export type OperationalContextLevel = "district" | "floodZone" | "marker" | "biodiversity";

type OperationalSelection = {
  selectedDistrict: string | null;
  selectedFloodZone: string | null;
  selectedBiodiversityEntity: string | null;
  selectedMapMarker: string | null;
};

type OperationalState = OperationalSelection & {
  isDrawerOpen: boolean;
  isDrawerMinimized: boolean;
  isIncidentDrawerOpen: boolean;
  isIncidentReviewPanelOpen: boolean;
  layers: Record<LayerKey, boolean>;
  timelineFilter: TimelineFilter;
  activeContextLevel: OperationalContextLevel;
  lastInteractionSource: InteractionSource;
  contextUpdatedAt: number;
  incidentReports: IncidentReport[];
  incidentFilters: IncidentFilterState;
  incidentDraft: IncidentDraft;
  activeRole: SimulationRole;
  submissionCooldownUntil: number | null;
  setSelectedDistrict: (district: string | null) => void;
  setSelectedFloodZone: (zoneId: string | null) => void;
  setSelectedBiodiversityEntity: (entity: string | null) => void;
  setSelectedMapMarker: (markerId: string | null) => void;
  setLayerVisible: (layer: LayerKey, visible: boolean) => void;
  setTimelineFilter: (filter: TimelineFilter) => void;
  setIncidentReports: (reports: IncidentReport[]) => void;
  addIncidentReport: (report: IncidentReport) => void;
  replaceIncidentReport: (report: IncidentReport) => void;
  setIncidentFilter: <K extends keyof IncidentFilterState>(key: K, value: IncidentFilterState[K]) => void;
  resetIncidentFilters: () => void;
  updateIncidentDraft: (draft: Partial<IncidentDraft>) => void;
  resetIncidentDraft: () => void;
  setActiveRole: (role: SimulationRole) => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  minimizeDrawer: () => void;
  expandDrawer: () => void;
  openIncidentDrawer: (district?: string | null) => void;
  closeIncidentDrawer: () => void;
  openIncidentReviewPanel: () => void;
  closeIncidentReviewPanel: () => void;
  focusDistrict: (district: string, source?: InteractionSource) => void;
  selectFloodZone: (zoneId: string, district: string, source?: InteractionSource) => void;
  selectBiodiversityEntity: (entity: string, district: string, source?: InteractionSource) => void;
  selectMapMarker: (
    markerId: string,
    district: string,
    options?: {
      biodiversityEntity?: string | null;
      source?: InteractionSource;
    }
  ) => void;
  restoreOperationalContext: () => void;
};

const DEFAULT_DISTRICT = "Patna";
const DEFAULT_ROLE: SimulationRole = "Citizen";
const simulationRoles: SimulationRole[] = [
  "Citizen",
  "Environmental Monitor / Volunteer",
  "Analyst",
  "Admin"
];

const defaultIncidentFilters: IncidentFilterState = {
  district: "All",
  severity: "All",
  category: "All",
  status: "All",
  verificationStatus: "All"
};

const defaultIncidentDraft: IncidentDraft = {
  title: "",
  description: "",
  category: "Flooding",
  severity: "Moderate",
  district: DEFAULT_DISTRICT,
  locality: "",
  latitude: "",
  longitude: "",
  evidence: []
};

function isSimulationRole(value: unknown): value is SimulationRole {
  return typeof value === "string" && simulationRoles.includes(value as SimulationRole);
}

function normalizeActiveRole(value: unknown): SimulationRole {
  if (isSimulationRole(value)) return value;
  return DEFAULT_ROLE;
}

const safeLocalStorage = createJSONStorage((): StateStorage => localStorage);

function buildSelectionState(
  selection: Partial<OperationalSelection>,
  source: InteractionSource
): Pick<
  OperationalState,
  | "selectedDistrict"
  | "selectedFloodZone"
  | "selectedBiodiversityEntity"
  | "selectedMapMarker"
  | "isDrawerOpen"
  | "isDrawerMinimized"
  | "activeContextLevel"
  | "lastInteractionSource"
  | "contextUpdatedAt"
> {
  return {
    selectedDistrict: selection.selectedDistrict ?? DEFAULT_DISTRICT,
    selectedFloodZone: selection.selectedFloodZone ?? null,
    selectedBiodiversityEntity: selection.selectedBiodiversityEntity ?? null,
    selectedMapMarker: selection.selectedMapMarker ?? null,
    isDrawerOpen: true,
    isDrawerMinimized: false,
    activeContextLevel:
      selection.selectedFloodZone
        ? "floodZone"
        : selection.selectedMapMarker
          ? "marker"
          : selection.selectedBiodiversityEntity
            ? "biodiversity"
            : "district",
    lastInteractionSource: source,
    contextUpdatedAt: Date.now()
  };
}

export const useOperationalStore = create<OperationalState>()(
  persist(
    (set) => ({
      selectedDistrict: DEFAULT_DISTRICT,
      selectedFloodZone: null,
      selectedBiodiversityEntity: null,
      selectedMapMarker: null,
      isDrawerOpen: false,
      isDrawerMinimized: false,
      isIncidentDrawerOpen: false,
      isIncidentReviewPanelOpen: false,
      layers: {
        flood: true,
        biodiversity: true,
        districtLabels: true
      },
      timelineFilter: "all",
      activeContextLevel: "district",
      lastInteractionSource: "system",
      contextUpdatedAt: Date.now(),
      incidentReports: [],
      incidentFilters: defaultIncidentFilters,
      incidentDraft: defaultIncidentDraft,
      activeRole: DEFAULT_ROLE,
      submissionCooldownUntil: null,
      setSelectedDistrict: (district) =>
        set((state) => {
          const nextState = {
            ...state,
            selectedDistrict: district,
            activeContextLevel: district ? state.activeContextLevel : "district",
            contextUpdatedAt: Date.now()
          };
          debugOperationalState("setSelectedDistrict", nextState);
          return nextState;
        }),
      setSelectedFloodZone: (zoneId) =>
        set((state) => {
          const nextState = {
            ...state,
            selectedFloodZone: zoneId,
            activeContextLevel: (zoneId ? "floodZone" : "district") as OperationalContextLevel,
            contextUpdatedAt: Date.now()
          };
          debugOperationalState("setSelectedFloodZone", nextState);
          return nextState;
        }),
      setSelectedBiodiversityEntity: (entity) =>
        set((state) => {
          const nextState = {
            ...state,
            selectedBiodiversityEntity: entity,
            activeContextLevel: (entity ? "biodiversity" : "district") as OperationalContextLevel,
            contextUpdatedAt: Date.now()
          };
          debugOperationalState("setSelectedBiodiversityEntity", nextState);
          return nextState;
        }),
      setSelectedMapMarker: (markerId) =>
        set((state) => {
          const nextState = {
            ...state,
            selectedMapMarker: markerId,
            activeContextLevel: (markerId ? "marker" : "district") as OperationalContextLevel,
            contextUpdatedAt: Date.now()
          };
          debugOperationalState("setSelectedMapMarker", nextState);
          return nextState;
        }),
      setLayerVisible: (layer, visible) =>
        set((state) => {
          const nextState = {
            ...state,
            layers: {
              ...state.layers,
              [layer]: visible
            },
            selectedFloodZone: !visible && layer === "flood" ? null : state.selectedFloodZone,
            selectedMapMarker: !visible ? null : state.selectedMapMarker,
            selectedBiodiversityEntity:
              !visible && layer === "biodiversity" ? null : state.selectedBiodiversityEntity,
            activeContextLevel: (
              !visible && layer === "biodiversity"
                ? "district"
                : !visible && layer === "flood"
                  ? "district"
                  : state.activeContextLevel
            ) as OperationalContextLevel,
            contextUpdatedAt: Date.now()
          };
          debugOperationalState("setLayerVisible", nextState);
          return nextState;
        }),
      setTimelineFilter: (filter) =>
        set((state) => {
          const nextState = {
            ...state,
            timelineFilter: filter,
            lastInteractionSource: "timeline" as const,
            selectedDistrict:
              filter === "district" && !state.selectedDistrict ? DEFAULT_DISTRICT : state.selectedDistrict,
            contextUpdatedAt: Date.now()
          };
          debugOperationalState("setTimelineFilter", nextState);
          return nextState;
        }),
      setIncidentReports: (reports) =>
        set((state) => ({
          ...state,
          incidentReports: reports
        })),
      addIncidentReport: (report) =>
        set((state) => ({
          ...state,
          incidentReports: [report, ...state.incidentReports],
          submissionCooldownUntil: Date.now() + 1000 * 60 * 3
        })),
      replaceIncidentReport: (report) =>
        set((state) => ({
          ...state,
          incidentReports: state.incidentReports.map((incident) =>
            incident.id === report.id ? report : incident
          )
        })),
      setIncidentFilter: (key, value) =>
        set((state) => ({
          ...state,
          incidentFilters: {
            ...state.incidentFilters,
            [key]: value
          }
        })),
      resetIncidentFilters: () =>
        set((state) => ({
          ...state,
          incidentFilters: defaultIncidentFilters
        })),
      updateIncidentDraft: (draft) =>
        set((state) => ({
          ...state,
          incidentDraft: {
            ...state.incidentDraft,
            ...draft
          }
        })),
      resetIncidentDraft: () =>
        set((state) => ({
          ...state,
          incidentDraft: defaultIncidentDraft
        })),
      setActiveRole: (role) =>
        set((state) => ({
          ...state,
          activeRole: normalizeActiveRole(role)
        })),
      openDrawer: () =>
        set((state) => ({
          ...state,
          isDrawerOpen: true,
          isDrawerMinimized: false,
          activeContextLevel: state.activeContextLevel,
          contextUpdatedAt: Date.now()
        })),
      closeDrawer: () =>
        set((state) => ({
          ...state,
          isDrawerOpen: false,
          isDrawerMinimized: false,
          activeContextLevel: state.activeContextLevel,
          contextUpdatedAt: Date.now()
        })),
      minimizeDrawer: () =>
        set((state) => ({
          ...state,
          isDrawerMinimized: true,
          isDrawerOpen: false,
          activeContextLevel: state.activeContextLevel,
          contextUpdatedAt: Date.now()
        })),
      expandDrawer: () =>
        set((state) => ({
          ...state,
          isDrawerOpen: true,
          isDrawerMinimized: false,
          selectedDistrict: state.selectedDistrict ?? DEFAULT_DISTRICT,
          activeContextLevel: state.activeContextLevel,
          contextUpdatedAt: Date.now()
        })),
      openIncidentDrawer: (district) =>
        set((state) => ({
          ...state,
          isIncidentDrawerOpen: true,
          incidentDraft: {
            ...state.incidentDraft,
            district: district ?? state.selectedDistrict ?? DEFAULT_DISTRICT
          }
        })),
      closeIncidentDrawer: () =>
        set((state) => ({
          ...state,
          isIncidentDrawerOpen: false
        })),
      openIncidentReviewPanel: () =>
        set((state) => ({
          ...state,
          isIncidentReviewPanelOpen: true
        })),
      closeIncidentReviewPanel: () =>
        set((state) => ({
          ...state,
          isIncidentReviewPanelOpen: false
        })),
      focusDistrict: (district, source = "drawer") =>
        set((state) => {
          const nextState = {
            ...state,
            ...buildSelectionState(
              {
                selectedDistrict: district,
                selectedFloodZone: null,
                selectedMapMarker: null,
                selectedBiodiversityEntity: null
              },
              source
            )
          };
          debugOperationalState("focusDistrict", nextState);
          return nextState;
        }),
      selectFloodZone: (zoneId, district, source = "map") =>
        set((state) => {
          const nextState = {
            ...state,
            ...buildSelectionState(
              {
                selectedDistrict: district,
                selectedFloodZone: zoneId,
                selectedMapMarker: null,
                selectedBiodiversityEntity: null
              },
              source
            )
          };
          debugOperationalState("selectFloodZone", nextState);
          return nextState;
        }),
      selectBiodiversityEntity: (entity, district, source = "biodiversity") =>
        set((state) => {
          const nextState = {
            ...state,
            ...buildSelectionState(
              {
                selectedDistrict: district,
                selectedFloodZone: null,
                selectedMapMarker: null,
                selectedBiodiversityEntity: entity
              },
              source
            )
          };
          debugOperationalState("selectBiodiversityEntity", nextState);
          return nextState;
        }),
      selectMapMarker: (markerId, district, options) =>
        set((state) => {
          const nextState = {
            ...state,
            ...buildSelectionState(
              {
                selectedDistrict: district,
                selectedFloodZone: null,
                selectedMapMarker: markerId,
                selectedBiodiversityEntity: options?.biodiversityEntity ?? null
              },
              options?.source ?? "map"
            )
          };
          debugOperationalState("selectMapMarker", nextState);
          return nextState;
        }),
      restoreOperationalContext: () =>
        set((state) => {
          const nextState = {
            ...state,
            isDrawerOpen: true,
            isDrawerMinimized: false,
            selectedDistrict: state.selectedDistrict ?? DEFAULT_DISTRICT,
            activeContextLevel: state.activeContextLevel,
            lastInteractionSource: "node" as const,
            contextUpdatedAt: Date.now()
          };
          debugOperationalState("restoreOperationalContext", nextState);
          return nextState;
        })
    }),
    {
      name: "ganga-rakshak-operational-ui",
      version: 2,
      storage: safeLocalStorage,
      migrate: (persistedState) => {
        if (!persistedState || typeof persistedState !== "object") {
          return persistedState;
        }

        const nextState = persistedState as Record<string, unknown>;

        return {
          ...nextState,
          activeRole: normalizeActiveRole(nextState.activeRole)
        };
      },
      partialize: (state) => ({
        selectedDistrict: state.selectedDistrict,
        selectedFloodZone: state.selectedFloodZone,
        selectedBiodiversityEntity: state.selectedBiodiversityEntity,
        selectedMapMarker: state.selectedMapMarker,
        layers: state.layers,
        timelineFilter: state.timelineFilter,
        activeContextLevel: state.activeContextLevel,
        lastInteractionSource: state.lastInteractionSource,
        incidentFilters: state.incidentFilters,
        incidentReports: state.incidentReports,
        activeRole: normalizeActiveRole(state.activeRole),
        submissionCooldownUntil: state.submissionCooldownUntil,
        isIncidentReviewPanelOpen: state.isIncidentReviewPanelOpen
      })
    }
  )
);
