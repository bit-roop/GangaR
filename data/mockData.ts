import { environmentalAlerts, biodiversitySightings, floodMapData, floodRisks, communityReports, riverHealthMetrics, weatherForecasts } from "@/data/mock";
import { routes } from "@/config/routes";
import { incidentCategoryDefinitions, incidentReports } from "@/data/mock";
import type { DashboardData, Stat } from "@/types/dashboard";

function statToneFromStatus(status: string): Stat["tone"] {
  if (status === "Good") return "green";
  if (status === "Poor") return "red";
  return "amber";
}

export const dashboardData: DashboardData = {
  location: "Patna, Bihar",
  greeting: "Namaste, Ananya 👋",
  subcopy: "Let's protect our Gangetic ecosystem together.",
  heroTitle: ["Clean River", "Healthy Future"],
  heroImage: "/land-1.png",
  thought: {
    title: "Today's Thought",
    quote: ["गंगा केवल नदी नहीं,", "हमारी संस्कृति, हमारी विरासत है।"],
    author: "Traditional Saying"
  },
  weather: {
    temperatureC: weatherForecasts[0].temperatureC,
    condition: weatherForecasts[0].condition,
    aqi: 42,
    aqiLabel: "Good"
  },
  sidebarItems: [
    { label: "Dashboard", icon: "▥", active: true },
    { label: "River Health", icon: "◔" },
    { label: "Biodiversity", icon: "🪶" },
    { label: "Flood Prediction", icon: "△" },
    { label: "Reports", icon: "📄" },
    { label: "Traditional Knowledge", icon: "⚚", href: routes.traditionalKnowledge },
    { label: "Map Explorer", icon: "✧", href: "/operations/map-explorer" },
    { label: "Community", icon: "👥", href: "/operations/community" },
    { label: "Alerts & News", icon: "🔔" },
    { label: "Settings", icon: "⚙", href: routes.settings }
  ],
  stats: [
    {
      title: "Water Quality Index",
      value: String(riverHealthMetrics[0].waterQualityIndex),
      suffix: "/100",
      detail: riverHealthMetrics[0].status,
      tone: statToneFromStatus(riverHealthMetrics[0].status),
      updatedAt: riverHealthMetrics[0].updatedAt
    },
    {
      title: "River Flow Status",
      value: riverHealthMetrics[0].status === "Good" ? "Normal" : "Watch",
      detail: `Discharge: ${riverHealthMetrics[0].dischargeCumecs.toLocaleString()} m³/s`,
      tone: "green",
      updatedAt: riverHealthMetrics[0].updatedAt
    },
    {
      title: "Dolphin Sightings",
      value: String(biodiversitySightings.filter((item) => item.speciesName === "Ganges River Dolphin").length * 12),
      detail: "Spotted this week",
      tone: "blue",
      updatedAt: biodiversitySightings[0].lastSighted
    },
    {
      title: "Active Alerts",
      value: String(environmentalAlerts.filter((alert) => alert.status !== "Resolved").length),
      detail: environmentalAlerts
        .slice(0, 2)
        .map((alert) => alert.type.replace(/\b\w/g, (char) => char.toUpperCase()))
        .join("\n"),
      tone: "red",
      updatedAt: environmentalAlerts[0].timestamp
    }
  ],
  biodiversity: biodiversitySightings.map((item) => ({
    name: item.speciesName,
    meta: item.scientificName,
    status: item.conservationStatus,
    image: item.image,
    lastSighted: item.lastSighted,
    habitatZone: item.habitatZone,
    districtTag: item.district,
    seasonalActivity:
      item.speciesName === "Sarus Crane"
        ? "Peak wetland activity"
        : item.speciesName === "Ganges River Dolphin"
          ? "Channel movement active"
          : "Mid-channel basking observed",
    freshnessLabel:
      item.lastSighted.includes("20 May 2026") ? "Fresh sighting" : "Observed within 24 hrs"
  })),
  biodiversityInsights: [
    {
      label: "Migration activity",
      value: "3 stable species",
      note: "Bhagalpur to Munger movement remains stable",
      tone: "blue"
    },
    {
      label: "Habitat pressure",
      value: "Moderate",
      note: "Sandbar and wetland disturbance under watch",
      tone: "amber"
    },
    {
      label: "Protected wetland zones",
      value: "5 monitored",
      note: "Two sites flagged for seasonal field review",
      tone: "green"
    }
  ],
  floodRisks,
  incidents: incidentReports,
  incidentCategories: incidentCategoryDefinitions,
  userState: {
    activeRole: "Analyst"
  },
  floodPanel: {
    headline: `${floodRisks[0].riskLevel[0].toUpperCase()}${floodRisks[0].riskLevel.slice(1)} Risk`,
    confidence: floodRisks[0].confidence,
    summary: floodRisks[0].summary,
    ctaLabel: "See Details",
    sourceLabel: floodRisks[0].sourceLabel,
    timestamp: floodRisks[0].timestamp,
    affectedDistricts: floodRisks.map((item) => item.district),
    rainfallForecastMm: floodRisks[0].rainfallForecastMm,
    riverDischargeCumecs: floodRisks[0].riverDischargeCumecs,
    affectedPopulationEstimate: floodRisks[0].affectedPopulationEstimate,
    freshnessState: "Feed synced 6 min ago",
    syncIndicator: "Live basin monitoring",
    map: floodMapData
  },
  districtIntelligence: [
    {
      district: "Patna",
      operationalStatus: "Monitoring",
      floodRisk: "Moderate flood risk",
      confidence: 68,
      rainfallForecastMm: 42,
      riverPressure: "2,350 m³/s discharge pressure",
      activeAlerts: ["Elevated organic load near Gandhi Ghat"],
      biodiversityActivity: ["Indian Softshell Turtle • Mid-channel sandbar"],
      affectedPopulation: 182000,
      weatherCondition: "Partly Cloudy",
      aqiLabel: "Good",
      lastUpdated: "20 May 2026, 2:40 PM IST"
    },
    {
      district: "Bhagalpur",
      operationalStatus: "Routine watch",
      floodRisk: "Watch flood risk",
      confidence: 57,
      rainfallForecastMm: 58,
      riverPressure: "2,510 m³/s discharge pressure",
      activeAlerts: ["Unlicensed extraction flagged upstream of Vikramshila"],
      biodiversityActivity: ["Ganges River Dolphin • Vikramshila Dolphin Sanctuary"],
      affectedPopulation: 124000,
      weatherCondition: "Humid Haze",
      aqiLabel: "Good",
      lastUpdated: "20 May 2026, 2:32 PM IST",
      delayedFeed: true
    },
    {
      district: "Munger",
      operationalStatus: "Escalated field watch",
      floodRisk: "Severe flood risk",
      confidence: 74,
      rainfallForecastMm: 49,
      riverPressure: "2,425 m³/s discharge pressure",
      activeAlerts: ["Floodplain watch escalated around Munger lowlands"],
      biodiversityActivity: ["Sarus Crane • Seasonal wet grassland"],
      affectedPopulation: 96000,
      weatherCondition: "Cloud Build-Up",
      aqiLabel: "Good",
      lastUpdated: "20 May 2026, 2:26 PM IST"
    },
    {
      district: "Hajipur",
      operationalStatus: "Routine watch",
      floodRisk: "Watch flood risk",
      confidence: 52,
      rainfallForecastMm: 39,
      riverPressure: "2,280 m³/s discharge pressure",
      activeAlerts: ["Drain outfall discharging untreated sewage"],
      biodiversityActivity: ["No recent biodiversity events"],
      affectedPopulation: 88000,
      weatherCondition: "Scattered Showers",
      aqiLabel: "Good",
      lastUpdated: "20 May 2026, 2:18 PM IST"
    }
  ],
  operationalTimeline: [
    {
      id: "timeline-patna-flood",
      title: "Patna flood watch updated",
      category: "flood",
      district: "Patna",
      timestamp: "2:40 PM",
      detail: "Confidence lifted to 68% after discharge and rainfall convergence.",
      status: "Live"
    },
    {
      id: "timeline-munger-rainfall",
      title: "Munger rainfall escalation",
      category: "rainfall",
      district: "Munger",
      timestamp: "2:26 PM",
      detail: "Localized saturation risk increased near embankment-adjacent settlements.",
      status: "Monitoring"
    },
    {
      id: "timeline-bhagalpur-dolphin",
      title: "Bhagalpur dolphin movement logged",
      category: "biodiversity",
      district: "Bhagalpur",
      timestamp: "8:30 AM",
      detail: "Fresh channel movement logged inside Vikramshila habitat corridor.",
      status: "Logged"
    },
    {
      id: "timeline-hajipur-sewage",
      title: "Hajipur sewage discharge under review",
      category: "pollution",
      district: "Hajipur",
      timestamp: "11:54 AM",
      detail: "Drain outfall verification remains active with ward-level observers.",
      status: "Monitoring"
    }
  ],
  quickActions: [
    { label: "Report Issue" },
    { label: "Check River Health" },
    { label: "Biodiversity Map" },
    { label: "Flood Updates" }
  ],
  mobileTiles: [
    { label: "River Flow", value: "Normal" },
    { label: "Dolphin Sightings", value: "12" },
    { label: "Active Alerts", value: String(environmentalAlerts.filter((alert) => alert.status !== "Resolved").length) }
  ],
  bottomNav: [
    { label: "Home", icon: "⌂", active: true },
    { label: "Map", icon: "⌖" },
    { label: "+", icon: "+", active: true, center: true },
    { label: "Reports", icon: "📄" },
    { label: "Profile", icon: "◯" }
  ],
  activity: {
    title: "Recent Activity",
    timestamp: communityReports[0].reportedAt,
    detail: `${communityReports[0].issueType.replace(/\b\w/g, (char) => char.toUpperCase())} reported near ${communityReports[0].locality}, ${communityReports[0].district}`
  }
};
