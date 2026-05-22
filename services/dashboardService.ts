import { communityReports } from "@/data/mock";
import { biodiversitySightings, districtProfiles, environmentalAlerts, floodRisks, incidentCategoryDefinitions, incidentReports, weatherForecasts } from "@/data/mock";
import { routes } from "@/config/routes";
import { dashboardData as dashboardMockData } from "@/data/mockData";
import { getEnvironmentalAlerts } from "@/services/alertsService";
import { getBiodiversityHighlights } from "@/services/biodiversityService";
import { getFloodPanelData } from "@/services/floodService";
import { getRiverHealthMetrics } from "@/services/riverService";
import { getWeatherSummary } from "@/services/weatherService";
import type { DashboardData } from "@/types/dashboard";

export async function getDashboardData(): Promise<DashboardData> {
  const [weatherResult, floodPanelResult, biodiversityResult, alertsResult, riverHealthResult] = await Promise.allSettled([
    getWeatherSummary(),
    getFloodPanelData(),
    getBiodiversityHighlights(),
    getEnvironmentalAlerts(),
    getRiverHealthMetrics()
  ]);

  const weather =
    weatherResult.status === "fulfilled"
      ? weatherResult.value
      : dashboardMockData.weather;
  const floodPanel =
    floodPanelResult.status === "fulfilled"
      ? floodPanelResult.value
      : dashboardMockData.floodPanel;
  const biodiversity =
    biodiversityResult.status === "fulfilled" && biodiversityResult.value.length
      ? biodiversityResult.value
      : dashboardMockData.biodiversity;
  const alerts =
    alertsResult.status === "fulfilled" && alertsResult.value.length
      ? alertsResult.value
      : environmentalAlerts;
  const riverHealth =
    riverHealthResult.status === "fulfilled" && riverHealthResult.value.length
      ? riverHealthResult.value
      : dashboardMockData.stats.length
        ? [
            {
              district: "Patna",
              station: "Patna Main",
              waterQualityIndex: 74,
              status: "Moderate" as const,
              dischargeCumecs: 2350,
              dissolvedOxygenMgL: 6.2,
              turbidityNTU: 31,
              updatedAt: "Updated today"
            }
          ]
        : [];

  return {
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
      weather,
      sidebarItems: [
        { label: "Dashboard", icon: "▥", href: routes.dashboard, active: true },
        { label: "River Health", icon: "◔", href: routes.riverHealth },
        { label: "Biodiversity", icon: "🪶", href: routes.biodiversityIntelligence },
        { label: "Flood Prediction", icon: "△", href: routes.floodOperations },
        { label: "Reports", icon: "📄", href: routes.incidentMonitoring },
        { label: "Traditional Knowledge", icon: "⚚" },
        { label: "Map Explorer", icon: "✧" },
        { label: "Community", icon: "👥", href: routes.community },
        { label: "Alerts & News", icon: "🔔" },
        { label: "Settings", icon: "⚙" }
      ],
      stats: [
        {
          title: "Water Quality Index",
          value: String(riverHealth[0]?.waterQualityIndex ?? 74),
          suffix: "/100",
          detail: riverHealth[0]?.status ?? "Moderate",
          tone: riverHealth[0]?.status === "Good" ? "green" : riverHealth[0]?.status === "Poor" ? "red" : "amber",
          updatedAt: riverHealth[0]?.updatedAt ?? "Updated today",
          trendLabel: "AQI improving"
        },
        {
          title: "River Flow Status",
          value: riverHealth[0]?.status === "Good" ? "Normal" : "Watch",
          detail: `Discharge: ${(riverHealth[0]?.dischargeCumecs ?? 2350).toLocaleString()} m³/s`,
          tone: "green",
          updatedAt: riverHealth[0]?.updatedAt ?? "Updated today",
          trendLabel: "River flow rising"
        },
        {
          title: "Dolphin Sightings",
          value: "12",
          detail: "Spotted this week",
          tone: "blue",
          updatedAt: biodiversity[0]?.lastSighted ?? "Updated today",
          trendLabel: "Rainfall +12%"
        },
        {
          title: "Active Alerts",
          value: String(alerts.filter((alert) => alert.status !== "Resolved").length),
          detail: alerts
            .slice(0, 2)
            .map((alert) => alert.type.replace(/\b\w/g, (char) => char.toUpperCase()))
            .join("\n"),
          tone: "red",
          updatedAt: alerts[0]?.timestamp ?? "Updated today",
          trendLabel: "2 new alerts today"
        }
      ],
      biodiversity,
      biodiversityInsights: [
        {
          label: "Migration activity",
          value: "3 active corridors",
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
      floodPanel,
      incidents: incidentReports,
      incidentCategories: incidentCategoryDefinitions,
      userState: {
        activeRole: "Analyst"
      },
      districtIntelligence: districtProfiles
        .filter((district) => ["Patna", "Bhagalpur", "Munger", "Hajipur"].includes(district.name))
        .map((district) => {
          const flood = floodRisks.find((item) => item.district === district.name) ?? floodRisks[0];
          const weatherItem = weatherForecasts.find((item) => item.district === district.name) ?? weatherForecasts[0];
          const districtAlerts = environmentalAlerts.filter((item) => item.district === district.name).slice(0, 2);
          const districtIncidents = incidentReports
            .filter((item) => item.district === district.name && (item.verificationStatus === "Verified" || item.verificationStatus === "Escalated"))
            .slice(0, 1);
          const districtBiodiversity = biodiversitySightings.filter((item) => item.district === district.name);

          return {
            district: district.name,
            operationalStatus:
              flood.riskLevel === "severe" ? "Escalated field watch" : flood.riskLevel === "moderate" ? "Monitoring" : "Routine watch",
            floodRisk: `${flood.riskLevel[0].toUpperCase()}${flood.riskLevel.slice(1)} flood risk`,
            confidence: flood.confidence,
            rainfallForecastMm: flood.rainfallForecastMm,
            riverPressure: `${flood.riverDischargeCumecs.toLocaleString()} m³/s discharge pressure`,
            activeAlerts: [
              ...(districtAlerts.length ? districtAlerts.map((item) => item.title) : ["No active district alerts"]),
              ...districtIncidents.map((item) => `${item.category} • ${item.status}`)
            ].slice(0, 3),
            biodiversityActivity: districtBiodiversity.length
              ? districtBiodiversity.map((item) => `${item.speciesName} • ${item.habitatZone}`)
              : ["No recent biodiversity events"],
            affectedPopulation: flood.affectedPopulationEstimate,
            weatherCondition: weatherItem.condition,
            aqiLabel: weather.aqiLabel,
            lastUpdated: flood.timestamp,
            delayedFeed: district.name === "Bhagalpur"
          };
        }),
      operationalTimeline: [
        {
          id: "timeline-patna-incident",
          title: "Patna sewage report submitted",
          category: "incident",
          district: "Patna",
          timestamp: "9:18 AM",
          detail: "Citizen intake created for untreated outfall near Gandhi Ghat.",
          status: "Logged"
        },
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
        { label: "Active Alerts", value: String(alerts.filter((alert) => alert.status !== "Resolved").length) }
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
    } satisfies DashboardData;
}
