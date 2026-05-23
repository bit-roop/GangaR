export const routes = {
  dashboard: "/operations/dashboard",
  districtDetail: (district: string) => `/operations/district/${district.toLowerCase()}`,
  floodOperations: "/operations/flood",
  biodiversityIntelligence: "/operations/biodiversity",
  incidentMonitoring: "/operations/incidents",
  riverHealth: "/operations/river-health",
  mapExplorer: "/operations/map-explorer",
  community: "/operations/community",
  traditionalKnowledge: "/operations/traditional-knowledge",
  alerts: "/operations/alerts",
  settings: "/operations/settings"
} as const;
