export const routes = {
  dashboard: "/",
  districtDetail: (district: string) => `/operations/district/${district.toLowerCase()}`,
  floodOperations: "/operations/flood",
  biodiversityIntelligence: "/operations/biodiversity",
  incidentMonitoring: "/operations/incidents",
  riverHealth: "/operations/river-health",
  community: "/community"
} as const;
