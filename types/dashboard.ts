import type { FloodRisk, IncidentCategory, IncidentReport, IncidentSeverity, IncidentStatus, RiskLevel, VerificationStatus } from "@/types/environment";

export type SidebarItem = {
  label: string;
  icon: string;
  href?: string;
  active?: boolean;
};

export type StatTone = "amber" | "green" | "blue" | "red";

export type Stat = {
  title: string;
  value: string;
  suffix?: string;
  detail: string;
  tone: StatTone;
  updatedAt: string;
  trendLabel?: string;
};

export type BiodiversityEntry = {
  name: string;
  meta: string;
  status: string;
  image: string;
  lastSighted: string;
  habitatZone: string;
  districtTag: string;
  seasonalActivity: string;
  freshnessLabel: string;
  habitatCondition?: string;
  conservationTrend?: string;
};

export type BiodiversityInsight = {
  label: string;
  value: string;
  note: string;
  tone?: "green" | "amber" | "blue";
};

export type QuickAction = {
  label: string;
};

export type MobileTile = {
  label: string;
  value: string;
};

export type ThoughtOfDay = {
  title: string;
  quote: string[];
  author: string;
};

export type WeatherSummary = {
  temperatureC: number | null;
  condition: string;
  aqi: number | null;
  aqiLabel: string;
  aqiColor?: string;
  pm25?: number | null;
  pm10?: number | null;
  updatedAt?: string;
  trend?: "improving" | "worsening" | "stable" | null;
};

export type FloodMarker = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  district?: string;
  category?: "flood" | "biodiversity" | "incident";
  detail?: string;
};

export type FloodZone = {
  id: string;
  district: string;
  riskLevel: RiskLevel;
  coordinates: [number, number][];
  confidence?: number;
  rainfallDriver?: string;
  updatedAt?: string;
};

export type FloodMapData = {
  center: {
    latitude: number;
    longitude: number;
    zoom: number;
  };
  legendTimestamp: string;
  districtLabels: Array<{
    name: string;
    latitude: number;
    longitude: number;
    operationalStatus?: string;
  }>;
  riverPath: [number, number][];
  markers: FloodMarker[];
  zones: FloodZone[];
};

export type FloodPanelData = {
  headline: string;
  confidence: number;
  summary: string;
  ctaLabel: string;
  sourceLabel: string;
  timestamp: string;
  affectedDistricts: string[];
  rainfallForecastMm: number;
  riverDischargeCumecs: number;
  affectedPopulationEstimate: number;
  freshnessState: string;
  syncIndicator: string;
  map: FloodMapData;
};

export type DistrictIntelligence = {
  district: string;
  operationalStatus: string;
  floodRisk: string;
  confidence: number;
  rainfallForecastMm: number;
  riverPressure: string;
  activeAlerts: string[];
  biodiversityActivity: string[];
  affectedPopulation: number;
  weatherCondition: string;
  aqiLabel: string;
  lastUpdated: string;
  delayedFeed?: boolean;
};

export type TimelineEvent = {
  id: string;
  title: string;
  category: "flood" | "rainfall" | "biodiversity" | "pollution" | "operations" | "incident";
  district: string;
  timestamp: string;
  detail: string;
  status: "Live" | "Monitoring" | "Logged";
};

export type IncidentCategoryDefinition = {
  category: IncidentCategory;
  icon: string;
  severityHint: IncidentSeverity;
  note: string;
};

export type IncidentFilterState = {
  district: string | "All";
  severity: IncidentSeverity | "All";
  category: IncidentCategory | "All";
  status: IncidentStatus | "All";
  verificationStatus: VerificationStatus | "All";
};

export type IncidentDraft = {
  title: string;
  description: string;
  category: IncidentCategory;
  severity: IncidentSeverity;
  district: string;
  locality: string;
  latitude: string;
  longitude: string;
  evidence: Array<{
    id: string;
    name: string;
    previewUrl: string;
    mimeType: string;
    sizeKb: number;
  }>;
};

export type CommunityQueueItem = IncidentReport & {
  queueLabel: string;
};

export type AnalystAction = "verify" | "reject" | "escalate" | "resolve";

export type SimulationRole =
  | "Citizen"
  | "Analyst"
  | "Admin";

export type OperationalUserState = {
  activeRole: SimulationRole;
};

export type BottomNavItem = {
  label: string;
  icon: string;
  active?: boolean;
  center?: boolean;
};

export type DashboardData = {
  location: string;
  greeting: string;
  subcopy: string;
  heroTitle: string[];
  heroImage: string;
  thought: ThoughtOfDay;
  weather: WeatherSummary;
  sidebarItems: SidebarItem[];
  stats: Stat[];
  biodiversity: BiodiversityEntry[];
  biodiversityInsights: BiodiversityInsight[];
  floodRisks: FloodRisk[];
  floodPanel: FloodPanelData;
  districtIntelligence: DistrictIntelligence[];
  operationalTimeline: TimelineEvent[];
  incidents: IncidentReport[];
  incidentCategories: IncidentCategoryDefinition[];
  userState: OperationalUserState;
  quickActions: QuickAction[];
  mobileTiles: MobileTile[];
  bottomNav: BottomNavItem[];
  activity: {
    title: string;
    timestamp: string;
    detail: string;
  };
};
