export type ExplorerRegion = {
  id: string;
  name: string;
  district: string;
  status: string;
  coordinates: [number, number];
  tone: "stable" | "watch";
  wqi: number;
  floodRisk: string;
  dolphinActivity: string;
  sediment: string;
  insight: string;
  signals: string[];
};

export type ExplorerTelemetryPoint = {
  label: string;
  movement: number;
  flood: number;
  quality: number;
  reports: number;
};
