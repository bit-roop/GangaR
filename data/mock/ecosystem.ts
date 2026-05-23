import { environmentalAlerts } from "@/data/mock/alerts";
import { biodiversitySightings } from "@/data/mock/biodiversity";
import { districtProfiles } from "@/data/mock/districts";
import { floodRisks } from "@/data/mock/flood";
import { incidentReports } from "@/data/mock/incidents";
import { riverHealthMetrics } from "@/data/mock/river";
import type { IncidentReport } from "@/types/environment";

export type EcosystemSeverity = "Low" | "Moderate" | "High" | "Critical";
export type EcosystemCategory =
  | "Flood"
  | "AQI"
  | "Biodiversity"
  | "Weather"
  | "River Health"
  | "Community"
  | "Emergency"
  | "Analyst";

export type EcosystemSignal = {
  id: string;
  title: string;
  category: EcosystemCategory;
  severity: EcosystemSeverity;
  district: string;
  location: string;
  timestamp: string;
  updatedAgo: string;
  icon: string;
  summary: string;
  status: string[];
  sourceId?: string;
  relatedIncidentId?: string;
};

export type EcosystemDistrictContext = {
  id: string;
  name: string;
  district: string;
  status: string;
  coordinates: [number, number];
  tone: "stable" | "watch" | "critical";
  wqi: number;
  floodRisk: string;
  biodiversityActivity: string;
  sediment: string;
  insight: string;
  signals: string[];
  relatedReports: number;
  confidence: number;
};

const severityMap = {
  low: "Low",
  moderate: "Moderate",
  high: "High"
} as const;

const incidentSeverityMap = {
  Low: "Low",
  Moderate: "Moderate",
  Severe: "High"
} as const;

function toUpdatedAgo(timestamp: string) {
  if (timestamp.includes("10:05")) return "24 min ago";
  if (timestamp.includes("9:42")) return "47 min ago";
  if (timestamp.includes("8:35")) return "1 hr 54 min ago";
  if (timestamp.includes("2:26")) return "4 min ago";
  if (timestamp.includes("1:50")) return "39 min ago";
  return "live sync";
}

function toClock(timestamp: string) {
  return timestamp
    .replace(/^\d{1,2} \w+ \d{4}, /, "")
    .replace(" IST", " IST");
}

function categoryForIncident(report: IncidentReport): EcosystemCategory {
  if (report.category === "Flooding" || report.category === "Riverbank Erosion") return "Flood";
  if (report.category === "Biodiversity Threat") return "Biodiversity";
  if (report.category === "Sewage Leakage" || report.category === "Dead Fish") return "River Health";
  return "Community";
}

function iconForCategory(category: EcosystemCategory) {
  if (category === "Flood") return "△";
  if (category === "Biodiversity") return "◒";
  if (category === "River Health") return "≋";
  if (category === "Emergency") return "!";
  if (category === "Analyst") return "i";
  return "◌";
}

function alertCategory(type: string): EcosystemCategory {
  if (type.includes("flood")) return "Flood";
  if (type.includes("sand")) return "Biodiversity";
  if (type.includes("sewage") || type.includes("pollution") || type.includes("dead fish")) return "River Health";
  return "Community";
}

export const operationalWorkflow = [
  "Citizen Report",
  "Analyst Review",
  "Verification",
  "Alert Generated",
  "Map Overlay Updated",
  "Community Notification"
] as const;

export const ecosystemSignals: EcosystemSignal[] = [
  ...incidentReports.map((report) => {
    const category = categoryForIncident(report);
    const severity = report.verificationStatus === "Escalated" ? "High" : incidentSeverityMap[report.analystSeverity ?? report.severity];

    return {
      id: `signal-${report.id}`,
      title:
        report.verificationStatus === "Escalated"
          ? `Escalated report: ${report.title}`
          : `Community report: ${report.title}`,
      category,
      severity,
      district: report.district,
      location: report.locality,
      timestamp: toClock(report.updatedAt),
      updatedAgo: toUpdatedAgo(report.updatedAt),
      icon: iconForCategory(category),
      summary: report.operationalNotes[0] ?? report.description,
      status: [report.verificationStatus, report.status, report.reporterRole],
      sourceId: report.id,
      relatedIncidentId: report.id
    };
  }),
  ...environmentalAlerts.map((alert) => {
    const category = alertCategory(alert.type);
    const relatedIncident = incidentReports.find(
      (report) =>
        report.district === alert.district &&
        (alert.title.toLowerCase().includes(report.locality.toLowerCase().split(" ")[0]) ||
          alert.summary.toLowerCase().includes(report.category.toLowerCase().split(" ")[0]))
    );

    return {
      id: `signal-${alert.id}`,
      title: alert.title,
      category,
      severity: severityMap[alert.severity],
      district: alert.district,
      location: relatedIncident?.locality ?? districtProfiles.find((district) => district.name === alert.district)?.riverBasin ?? "Ganga corridor",
      timestamp: toClock(alert.timestamp),
      updatedAgo: toUpdatedAgo(alert.timestamp),
      icon: iconForCategory(category),
      summary: relatedIncident
        ? `${alert.summary} Linked to ${relatedIncident.sourceLabel.toLowerCase()} ${relatedIncident.id.split("-").slice(-1)[0]?.toUpperCase()}.`
        : alert.summary,
      status: [alert.status, relatedIncident ? "Linked report" : "Monitoring", alert.type],
      sourceId: alert.id,
      relatedIncidentId: relatedIncident?.id
    };
  }),
  ...biodiversitySightings.map((sighting) => ({
    id: `signal-${sighting.id}`,
    title: `${sighting.speciesName} observation logged`,
    category: "Biodiversity" as const,
    severity: sighting.conservationStatus === "Endangered" ? "Moderate" as const : "Low" as const,
    district: sighting.district,
    location: sighting.habitatZone,
    timestamp: toClock(sighting.lastSighted),
    updatedAgo: toUpdatedAgo(sighting.lastSighted),
    icon: "◒",
    summary: sighting.ecologicalNote,
    status: [sighting.conservationStatus, "Map overlay", "Habitat signal"],
    sourceId: sighting.id
  }))
].sort((left, right) => left.district.localeCompare(right.district));

export const ecosystemDistrictContexts = districtProfiles
  .map((district) => {
    const river = riverHealthMetrics.find((item) => item.district === district.name);
    const flood = floodRisks.find((item) => item.district === district.name);
    const sightings = biodiversitySightings.filter((item) => item.district === district.name);
    const incidents = incidentReports.filter((item) => item.district === district.name);
    const signals = ecosystemSignals.filter((item) => item.district === district.name).slice(0, 4);

    if (!river && !flood && !sightings.length && !incidents.length) return null;

    const firstCoordinate =
      incidents[0]?.coordinates
        ? [incidents[0].coordinates.latitude, incidents[0].coordinates.longitude]
        : sightings[0]
          ? [sightings[0].latitude, sightings[0].longitude]
          : [25.61, 85.16];
    const hasEscalation = incidents.some((item) => item.verificationStatus === "Escalated") || flood?.riskLevel === "severe";

    return {
      id: district.name.toLowerCase(),
      name: `${district.name} ecosystem corridor`,
      district: district.name,
      status: hasEscalation ? "Operational watch active" : river?.status === "Good" ? "Stable ecological recovery" : "Monitoring environmental pressure",
      coordinates: firstCoordinate as [number, number],
      tone: hasEscalation ? "critical" : river?.status === "Good" ? "stable" : "watch",
      wqi: river?.waterQualityIndex ?? 72,
      floodRisk: flood ? `${flood.riskLevel[0].toUpperCase()}${flood.riskLevel.slice(1)}` : "Watch",
      biodiversityActivity: sightings[0]?.speciesName ?? "No fresh species signal",
      sediment: river && river.turbidityNTU > 20 ? "Rising" : "Stable",
      insight:
        signals[0]?.summary ??
        `${district.riverBasin} telemetry is synchronized with district-level reports and field observations.`,
      signals: signals.length ? signals.map((signal) => signal.title) : ["Telemetry synced", "No active incident cluster"],
      relatedReports: incidents.length,
      confidence: Math.min(96, 72 + signals.length * 5 + incidents.length * 3)
    };
  })
  .filter(Boolean) as EcosystemDistrictContext[];
