import type { FloodOperationsData } from "@/types/flood";

export const floodOperationsData: FloodOperationsData = {
  hero: {
    eyebrow: "Flood forecast",
    title: "Moderate flood risk in the next 48 hours.",
    summary: "Rainfall is building across Patna to Munger, with the strongest risk near low-lying river edges.",
    badges: ["4 districts affected", "Rainfall rising east", "Next update in 3 hrs"],
    status: "Live forecast",
    pulse: "Munger remains the most exposed district this morning.",
    actionLabel: "View safety tips"
  },
  metrics: [
    {
      label: "Flood risk",
      value: "Moderate",
      delta: "Munger highest",
      tone: "elevated",
      detail: "Risk is highest near low-lying settlements and floodplain edges."
    },
    {
      label: "Rainfall trend",
      value: "Rising",
      delta: "Moving east",
      tone: "watch",
      detail: "Showers are expected to strengthen from Patna toward Bhagalpur."
    },
    {
      label: "Affected districts",
      value: "04",
      delta: "Mostly riverfront",
      tone: "steady",
      detail: "Patna, Hajipur, Munger, and Bhagalpur remain under close watch."
    },
    {
      label: "Peak window",
      value: "4-8 hrs",
      delta: "Late morning",
      tone: "watch",
      detail: "The heaviest rain is most likely before midday."
    }
  ],
  rainfallForecast: [
    { label: "6 AM", value: 18, unit: " mm", interpretation: "18 mm rainfall expected at 6 AM.", confidence: 71, comparison: "3 mm above yesterday", trend: "rising" },
    { label: "9 AM", value: 26, unit: " mm", interpretation: "26 mm rainfall expected at 9 AM.", confidence: 74, comparison: "Rainfall building through the morning", trend: "rising" },
    { label: "12 PM", value: 31, unit: " mm", interpretation: "31 mm rainfall expected at 12 PM.", confidence: 78, comparison: "Peak rainfall window", trend: "rising" },
    { label: "3 PM", value: 24, unit: " mm", interpretation: "24 mm rainfall expected at 3 PM.", confidence: 73, comparison: "Showers begin to ease", trend: "falling" },
    { label: "6 PM", value: 16, unit: " mm", interpretation: "16 mm rainfall expected at 6 PM.", confidence: 69, comparison: "Lighter rain into the evening", trend: "falling" }
  ],
  floodProbability: [
    { label: "Now", value: 42, unit: "%", interpretation: "Flood probability is 42% right now.", confidence: 72, comparison: "Stable start", trend: "steady" },
    { label: "Morning", value: 58, unit: "%", interpretation: "Flood probability rises to 58% by mid-morning.", confidence: 75, comparison: "Upstream rain pushing risk higher", trend: "rising" },
    { label: "Noon", value: 71, unit: "%", interpretation: "Flood probability peaks near noon due to upstream rainfall.", confidence: 79, comparison: "Highest risk period", trend: "rising" },
    { label: "Afternoon", value: 63, unit: "%", interpretation: "Flood probability stays elevated through the afternoon.", confidence: 74, comparison: "Risk remains broad but easing", trend: "falling" },
    { label: "Evening", value: 39, unit: "%", interpretation: "Flood probability drops to 39% by evening.", confidence: 70, comparison: "Conditions should calm later", trend: "falling" }
  ],
  riverTrend: [
    { label: "Mon", value: 38, unit: "%", interpretation: "River level held 38% above the low-season baseline on Monday.", comparison: "Start of weekly rise", trend: "rising" },
    { label: "Tue", value: 44, unit: "%", interpretation: "River level reached 44% above baseline on Tuesday.", comparison: "6% higher than Monday", trend: "rising" },
    { label: "Wed", value: 49, unit: "%", interpretation: "River level reached 49% above baseline on Wednesday.", comparison: "Steady midweek rise", trend: "rising" },
    { label: "Thu", value: 57, unit: "%", interpretation: "River level reached 57% above baseline on Thursday.", comparison: "Sharpest daily climb", trend: "rising" },
    { label: "Fri", value: 61, unit: "%", interpretation: "River level expected to rise 7% by Friday.", comparison: "Highest point this week", trend: "rising" }
  ],
  districtCards: [
    {
      id: "dist-munger",
      district: "Munger",
      risk: "severe",
      rainfall: "49 mm forecast",
      riverSignal: "Water likely to hold",
      pressure: "High local risk",
      summary: "Low-lying neighborhoods may face the earliest spread."
    },
    {
      id: "dist-patna",
      district: "Patna",
      risk: "moderate",
      rainfall: "42 mm forecast",
      riverSignal: "Runoff building",
      pressure: "Riverfront watch",
      summary: "Localized waterlogging risk is higher near riverfront wards."
    },
    {
      id: "dist-hajipur",
      district: "Hajipur",
      risk: "watch",
      rainfall: "39 mm forecast",
      riverSignal: "Confluence response",
      pressure: "Patchy spread",
      summary: "Risk is lighter here, but a few low-drainage pockets remain exposed."
    },
    {
      id: "dist-bhagalpur",
      district: "Bhagalpur",
      risk: "watch",
      rainfall: "58 mm forecast",
      riverSignal: "Downstream rise possible",
      pressure: "Early watch",
      summary: "Conditions are calmer for now, but the next rain shift may raise local risk."
    }
  ],
  map: {
    center: {
      latitude: 25.5,
      longitude: 85.95,
      zoom: 8.1
    },
    legendTimestamp: "22 May 2026, 07:20 IST",
    riverPath: [
      [84.98, 25.7],
      [85.14, 25.63],
      [85.32, 25.59],
      [85.55, 25.58],
      [85.86, 25.44],
      [86.12, 25.36],
      [86.48, 25.38],
      [86.73, 25.31],
      [86.99, 25.25]
    ],
    districtGradients: [
      {
        id: "grad-patna",
        district: "Patna",
        risk: "moderate",
        confidence: 68,
        coordinates: [[84.92, 25.78], [85.08, 25.82], [85.29, 25.79], [85.41, 25.64], [85.34, 25.5], [85.1, 25.46], [84.95, 25.55]]
      },
      {
        id: "grad-hajipur",
        district: "Hajipur",
        risk: "watch",
        confidence: 52,
        coordinates: [[85.1, 25.78], [85.29, 25.8], [85.44, 25.72], [85.43, 25.58], [85.26, 25.52], [85.11, 25.61]]
      },
      {
        id: "grad-munger",
        district: "Munger",
        risk: "severe",
        confidence: 74,
        coordinates: [[86.03, 25.47], [86.22, 25.56], [86.5, 25.51], [86.63, 25.38], [86.45, 25.26], [86.16, 25.25], [86.01, 25.34]]
      },
      {
        id: "grad-bhagalpur",
        district: "Bhagalpur",
        risk: "watch",
        confidence: 57,
        coordinates: [[86.71, 25.37], [86.95, 25.38], [87.08, 25.28], [86.99, 25.17], [86.77, 25.14], [86.64, 25.24]]
      }
    ],
    rainCells: [
      { id: "rain-1", center: [85.18, 25.67], radius: 12500, intensity: "moderate", rainfallRate: "22 mm/hr" },
      { id: "rain-2", center: [85.53, 25.6], radius: 14800, intensity: "heavy", rainfallRate: "31 mm/hr" },
      { id: "rain-3", center: [86.28, 25.39], radius: 13200, intensity: "heavy", rainfallRate: "29 mm/hr" },
      { id: "rain-4", center: [86.86, 25.25], radius: 10800, intensity: "moderate", rainfallRate: "18 mm/hr" }
    ],
    spreadZones: [
      {
        id: "spread-1",
        label: "Patna riverfront spread",
        district: "Patna",
        phase: "forecast",
        coordinates: [[85.04, 25.68], [85.18, 25.7], [85.25, 25.61], [85.1, 25.56]],
        summary: "Forecast-stage surface spread along low riverfront wards."
      },
      {
        id: "spread-2",
        label: "Munger lowland spread",
        district: "Munger",
        phase: "active",
        coordinates: [[86.2, 25.43], [86.42, 25.46], [86.47, 25.34], [86.28, 25.3]],
        summary: "Active spread zone where drainage release is lagging."
      },
      {
        id: "spread-3",
        label: "Bhagalpur floodplain watch",
        district: "Bhagalpur",
        phase: "contained",
        coordinates: [[86.8, 25.28], [86.95, 25.29], [86.97, 25.2], [86.83, 25.19]],
        summary: "Contained for now, but aligned with eastward rainfall progression."
      }
    ],
    embankmentRegions: [
      {
        id: "emb-1",
        label: "Gandhi Setu embankment chain",
        district: "Patna",
        status: "pressured",
        coordinates: [[85.02, 25.63], [85.14, 25.64], [85.21, 25.6], [85.08, 25.58]],
        note: "Moderate saturation with manageable urban runoff stress."
      },
      {
        id: "emb-2",
        label: "Munger east embankment seam",
        district: "Munger",
        status: "critical",
        coordinates: [[86.31, 25.43], [86.5, 25.42], [86.48, 25.35], [86.34, 25.33]],
        note: "Highest pressure zone in the current forecast cycle."
      }
    ],
    telemetry: [
      { id: "tel-1", label: "Patna gauge", district: "Patna", latitude: 25.61, longitude: 85.16, metric: "Stage +0.4 m", status: "watch" },
      { id: "tel-2", label: "Hajipur confluence", district: "Hajipur", latitude: 25.71, longitude: 85.22, metric: "Backflow active", status: "active" },
      { id: "tel-3", label: "Munger crest monitor", district: "Munger", latitude: 25.38, longitude: 86.47, metric: "Pressure elevated", status: "active" },
      { id: "tel-4", label: "Bhagalpur floodplain node", district: "Bhagalpur", latitude: 25.25, longitude: 86.98, metric: "Spread watch", status: "watch" }
    ],
    forecastMarkers: [
      { id: "mark-1", label: "Patna", district: "Patna", latitude: 25.6, longitude: 85.15, kind: "district", note: "Urban fringe watch" },
      { id: "mark-2", label: "Upstream pressure", district: "Patna", latitude: 25.69, longitude: 84.99, kind: "upstream", note: "Sustained discharge support" },
      { id: "mark-3", label: "Munger", district: "Munger", latitude: 25.37, longitude: 86.48, kind: "district", note: "Lead escalation district" },
      { id: "mark-4", label: "Bhagalpur", district: "Bhagalpur", latitude: 25.24, longitude: 86.98, kind: "downstream", note: "Next active watch pocket" }
    ]
  }
};
