import type { FloodMapData } from "@/types/dashboard";
import type { FloodRisk } from "@/types/environment";

export const floodRisks: FloodRisk[] = [
  {
    id: "patna-flood-risk",
    district: "Patna",
    region: "Bihar",
    riskLevel: "moderate",
    confidence: 68,
    rainfallForecastMm: 42,
    affectedPopulationEstimate: 182000,
    riverDischargeCumecs: 2350,
    timestamp: "20 May 2026, 2:40 PM IST",
    sourceLabel: "Source: rainfall forecast + river discharge",
    summary: "Localized embankment pressure likely across low-lying Patna riverfront wards."
  },
  {
    id: "bhagalpur-watch",
    district: "Bhagalpur",
    region: "Bihar",
    riskLevel: "watch",
    confidence: 57,
    rainfallForecastMm: 58,
    affectedPopulationEstimate: 124000,
    riverDischargeCumecs: 2510,
    timestamp: "20 May 2026, 2:32 PM IST",
    sourceLabel: "Source: basin rainfall guidance + gauge network",
    summary: "Floodplain watch continues near Vikramshila stretch and adjacent agricultural belts."
  },
  {
    id: "munger-severe",
    district: "Munger",
    region: "Bihar",
    riskLevel: "severe",
    confidence: 74,
    rainfallForecastMm: 49,
    affectedPopulationEstimate: 96000,
    riverDischargeCumecs: 2425,
    timestamp: "20 May 2026, 2:26 PM IST",
    sourceLabel: "Source: rainfall forecast + upstream release pattern",
    summary: "Rapid drainage congestion may affect embankment-adjacent settlements."
  },
  {
    id: "hajipur-watch",
    district: "Hajipur",
    region: "Bihar",
    riskLevel: "watch",
    confidence: 52,
    rainfallForecastMm: 39,
    affectedPopulationEstimate: 88000,
    riverDischargeCumecs: 2280,
    timestamp: "20 May 2026, 2:18 PM IST",
    sourceLabel: "Source: rainfall forecast + confluence monitoring",
    summary: "Watch zone remains active around river-confluence pockets and peri-urban drains."
  }
];

export const floodMapData: FloodMapData = {
  center: {
    latitude: 25.5941,
    longitude: 85.1376,
    zoom: 8.2
  },
  legendTimestamp: "20 May 2026, 2:40 PM IST",
  districtLabels: [
    { name: "Patna", latitude: 25.62, longitude: 85.16, operationalStatus: "Monitoring" },
    { name: "Hajipur", latitude: 25.71, longitude: 85.21, operationalStatus: "Watch" },
    { name: "Munger", latitude: 25.38, longitude: 86.48, operationalStatus: "Escalated" },
    { name: "Bhagalpur", latitude: 25.24, longitude: 86.98, operationalStatus: "Stable" }
  ],
  riverPath: [
    [84.6298, 25.7161],
    [84.808, 25.6908],
    [84.9473, 25.6627],
    [85.1376, 25.5941],
    [85.3094, 25.574],
    [85.5301, 25.6247],
    [85.8245, 25.4206],
    [86.1286, 25.3412],
    [86.4814, 25.3748],
    [86.9824, 25.2462]
  ],
  markers: [
    {
      id: "patna",
      name: "Patna flood watch",
      latitude: 25.5941,
      longitude: 85.1376,
      district: "Patna",
      category: "flood",
      detail: "Urban flood watch node"
    },
    {
      id: "hajipur",
      name: "Hajipur rain watch",
      latitude: 25.6925,
      longitude: 85.2083,
      district: "Hajipur",
      category: "flood",
      detail: "Rainfall accumulation node"
    },
    {
      id: "munger-severity",
      name: "Munger alert zone",
      latitude: 25.3748,
      longitude: 86.4735,
      district: "Munger",
      category: "flood",
      detail: "High bank saturation and drainage stress"
    },
    {
      id: "vikramshila-dolphin-zone",
      name: "Dolphin sighting zone",
      latitude: 25.2462,
      longitude: 86.9824,
      district: "Bhagalpur",
      category: "biodiversity",
      detail: "Recent Ganges river dolphin activity"
    },
    {
      id: "sarus-habitat",
      name: "Sarus habitat",
      latitude: 25.486,
      longitude: 86.221,
      district: "Munger",
      category: "biodiversity",
      detail: "Wet grassland habitat zone"
    }
  ],
  zones: [
    {
      id: "zone-severe-munger",
      district: "Munger",
      riskLevel: "severe",
      confidence: 74,
      rainfallDriver: "Upstream release + local saturation",
      updatedAt: "20 May 2026, 2:26 PM IST",
      coordinates: [
        [86.05, 25.47],
        [86.23, 25.55],
        [86.49, 25.52],
        [86.63, 25.39],
        [86.48, 25.27],
        [86.18, 25.24],
        [86.02, 25.34],
        [86.05, 25.47]
      ]
    },
    {
      id: "zone-moderate-patna",
      district: "Patna",
      riskLevel: "moderate",
      confidence: 68,
      rainfallDriver: "Urban rainfall + river discharge",
      updatedAt: "20 May 2026, 2:40 PM IST",
      coordinates: [
        [84.92, 25.78],
        [85.08, 25.82],
        [85.3, 25.78],
        [85.43, 25.65],
        [85.38, 25.49],
        [85.16, 25.43],
        [84.98, 25.49],
        [84.9, 25.63],
        [84.92, 25.78]
      ]
    },
    {
      id: "zone-watch-hajipur",
      district: "Hajipur",
      riskLevel: "watch",
      confidence: 52,
      rainfallDriver: "Confluence backflow watch",
      updatedAt: "20 May 2026, 2:18 PM IST",
      coordinates: [
        [85.13, 25.78],
        [85.28, 25.8],
        [85.43, 25.72],
        [85.47, 25.58],
        [85.35, 25.5],
        [85.18, 25.53],
        [85.08, 25.65],
        [85.13, 25.78]
      ]
    }
  ]
};
