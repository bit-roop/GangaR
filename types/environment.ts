export type RiskLevel = "watch" | "moderate" | "severe";

export type WeatherForecast = {
  district: string;
  region: "Bihar" | "Jharkhand";
  condition: string;
  temperatureC: number;
  humidity: number;
  rainfallMmNext24h: number;
  rainfallMmNext48h: number;
  updatedAt: string;
};

export type RiverHealthMetric = {
  district: string;
  station: string;
  waterQualityIndex: number;
  status: "Good" | "Moderate" | "Poor";
  dischargeCumecs: number;
  dissolvedOxygenMgL: number;
  turbidityNTU: number;
  updatedAt: string;
};

export type FloodRisk = {
  id: string;
  district: string;
  region: "Bihar" | "Jharkhand";
  riskLevel: RiskLevel;
  confidence: number;
  rainfallForecastMm: number;
  affectedPopulationEstimate: number;
  riverDischargeCumecs: number;
  timestamp: string;
  sourceLabel: string;
  summary: string;
};

export type BiodiversitySighting = {
  id: string;
  speciesName: string;
  scientificName: string;
  conservationStatus: string;
  district: string;
  latitude: number;
  longitude: number;
  habitatZone: string;
  lastSighted: string;
  ecologicalNote: string;
  image: string;
};

export type EnvironmentalAlert = {
  id: string;
  type: "pollution alert" | "sewage leakage" | "flood warning" | "illegal sand mining" | "dead fish incident";
  title: string;
  district: string;
  severity: "low" | "moderate" | "high";
  status: "Open" | "Monitoring" | "Resolved";
  timestamp: string;
  summary: string;
};

export type CommunityReport = {
  id: string;
  issueType: string;
  district: string;
  locality: string;
  severity: "low" | "moderate" | "high";
  reportedAt: string;
  reporterLabel: string;
  status: "Pending Review" | "In Progress" | "Resolved";
  thumbnail?: string;
};

export type IncidentCategory =
  | "Flooding"
  | "Sewage Leakage"
  | "Dead Fish"
  | "Plastic Waste"
  | "Illegal Sand Mining"
  | "Riverbank Erosion"
  | "Biodiversity Threat"
  | "Other";

export type IncidentSeverity = "Low" | "Moderate" | "Severe";

export type IncidentStatus = "Reported" | "Under Review" | "Escalated" | "Resolved";

export type IncidentRole = "Citizen" | "Analyst" | "District Operations" | "Environmental Monitor";

export type VerificationStatus =
  | "Pending Verification"
  | "Under Analyst Review"
  | "Verified"
  | "Escalated"
  | "Resolved"
  | "Rejected";

export type IncidentEvidence = {
  id: string;
  name: string;
  previewUrl: string;
  mimeType: string;
  sizeKb: number;
};

export type IncidentReport = {
  id: string;
  title: string;
  description: string;
  category: IncidentCategory;
  severity: IncidentSeverity;
  district: string;
  locality: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  status: IncidentStatus;
  reportedAt: string;
  updatedAt: string;
  sourceLabel: string;
  reporterRole: IncidentRole;
  verificationStatus: VerificationStatus;
  analystSeverity?: IncidentSeverity;
  trustedReporter?: boolean;
  suspiciousActivity?: boolean;
  duplicateClusterId?: string | null;
  evidence: IncidentEvidence[];
  operationalNotes: string[];
};
