export type FloodLayerKey =
  | "rainfall"
  | "districtRisk"
  | "floodSpread"
  | "embankments"
  | "riverIntensity"
  | "telemetry";

export type FloodMetric = {
  label: string;
  value: string;
  delta: string;
  tone: "steady" | "watch" | "elevated" | "critical";
  detail: string;
};

export type FloodChartPoint = {
  label: string;
  value: number;
  unit: string;
  interpretation: string;
  confidence?: number;
  comparison?: string;
  trend?: "rising" | "steady" | "falling";
};

export type FloodDistrictCard = {
  id: string;
  district: string;
  risk: "watch" | "moderate" | "severe";
  rainfall: string;
  riverSignal: string;
  pressure: string;
  summary: string;
};

export type FloodRainCell = {
  id: string;
  center: [number, number];
  radius: number;
  intensity: "light" | "moderate" | "heavy";
  rainfallRate: string;
};

export type FloodSpreadZone = {
  id: string;
  label: string;
  district: string;
  phase: "active" | "forecast" | "contained";
  coordinates: [number, number][];
  summary: string;
};

export type FloodEmbankmentRegion = {
  id: string;
  label: string;
  district: string;
  status: "stable" | "pressured" | "critical";
  coordinates: [number, number][];
  note: string;
};

export type FloodTelemetryPoint = {
  id: string;
  label: string;
  district: string;
  latitude: number;
  longitude: number;
  metric: string;
  status: "watch" | "active" | "stable";
};

export type FloodForecastMarker = {
  id: string;
  label: string;
  district: string;
  latitude: number;
  longitude: number;
  kind: "district" | "upstream" | "downstream";
  note: string;
};

export type FloodOperationsMapData = {
  center: {
    latitude: number;
    longitude: number;
    zoom: number;
  };
  legendTimestamp: string;
  riverPath: [number, number][];
  districtGradients: Array<{
    id: string;
    district: string;
    risk: "watch" | "moderate" | "severe";
    confidence: number;
    coordinates: [number, number][];
  }>;
  rainCells: FloodRainCell[];
  spreadZones: FloodSpreadZone[];
  embankmentRegions: FloodEmbankmentRegion[];
  telemetry: FloodTelemetryPoint[];
  forecastMarkers: FloodForecastMarker[];
};

export type FloodOperationsData = {
  hero: {
    eyebrow: string;
    title: string;
    summary: string;
    badges: string[];
    status: string;
    pulse: string;
    actionLabel: string;
  };
  metrics: FloodMetric[];
  rainfallForecast: FloodChartPoint[];
  floodProbability: FloodChartPoint[];
  riverTrend: FloodChartPoint[];
  districtCards: FloodDistrictCard[];
  map: FloodOperationsMapData;
};
