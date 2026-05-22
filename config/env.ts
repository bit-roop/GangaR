const asBoolean = (value: string | undefined, fallback: boolean) => {
  if (value === undefined) return fallback;
  return value === "true";
};

export const env = {
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api",
  useMockData: asBoolean(process.env.NEXT_PUBLIC_USE_MOCK_DATA, true),
  incidentApiBaseUrl: process.env.NEXT_PUBLIC_INCIDENT_API_BASE_URL ?? "http://localhost:8000/api",
  useIncidentBackend: asBoolean(process.env.NEXT_PUBLIC_USE_INCIDENT_BACKEND, true),
  waqiApiToken: process.env.NEXT_PUBLIC_WAQI_API_TOKEN ?? ""
};
