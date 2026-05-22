import type { IncidentCategoryDefinition } from "@/types/dashboard";
import type { IncidentReport } from "@/types/environment";

export const incidentCategoryDefinitions: IncidentCategoryDefinition[] = [
  { category: "Flooding", icon: "≈", severityHint: "Severe", note: "Floodwater, backflow, or embankment stress" },
  { category: "Sewage Leakage", icon: "◉", severityHint: "Moderate", note: "Drainage leakage or untreated discharge" },
  { category: "Dead Fish", icon: "◌", severityHint: "Moderate", note: "Fish mortality, odor, or stagnant water distress" },
  { category: "Plastic Waste", icon: "□", severityHint: "Low", note: "Floating litter, ghat accumulation, or bank dumping" },
  { category: "Illegal Sand Mining", icon: "△", severityHint: "Severe", note: "Unauthorized extraction near sensitive reaches" },
  { category: "Riverbank Erosion", icon: "∿", severityHint: "Severe", note: "Slope instability or active bank cutting" },
  { category: "Biodiversity Threat", icon: "✧", severityHint: "Moderate", note: "Habitat disruption or protected species threat" },
  { category: "Other", icon: "+", severityHint: "Low", note: "Other environmental monitoring report" }
];

export const incidentReports: IncidentReport[] = [
  {
    id: "incident-patna-sewage-001",
    title: "Untreated drain outfall near Gandhi Ghat",
    description: "Dark discharge observed entering the river edge during late-morning flow. Odor persists across the steps and near the storm drain mouth.",
    category: "Sewage Leakage",
    severity: "Moderate",
    district: "Patna",
    locality: "Gandhi Ghat",
    coordinates: {
      latitude: 25.6138,
      longitude: 85.1647
    },
    status: "Under Review",
    reportedAt: "21 May 2026, 9:18 AM IST",
    updatedAt: "21 May 2026, 9:42 AM IST",
    sourceLabel: "Citizen river watch intake",
    reporterRole: "Citizen",
    verificationStatus: "Under Analyst Review",
    analystSeverity: "Moderate",
    trustedReporter: false,
    suspiciousActivity: false,
    duplicateClusterId: "cluster-gandhi-ghat-sewage",
    evidence: [
      {
        id: "evidence-patna-001",
        name: "ghat-outfall.jpg",
        previewUrl: "/land-1.png",
        mimeType: "image/jpeg",
        sizeKb: 428
      }
    ],
    operationalNotes: [
      "Ward observer verification requested",
      "Water quality field strip recommended within 2 hrs"
    ]
  },
  {
    id: "incident-munger-erosion-002",
    title: "Riverbank erosion advancing near lowland edge",
    description: "Fresh slumping visible along embankment-adjacent soil face after overnight rainfall.",
    category: "Riverbank Erosion",
    severity: "Severe",
    district: "Munger",
    locality: "Kasim Bazar lowland edge",
    coordinates: {
      latitude: 25.3819,
      longitude: 86.4804
    },
    status: "Escalated",
    reportedAt: "21 May 2026, 7:54 AM IST",
    updatedAt: "21 May 2026, 8:35 AM IST",
    sourceLabel: "District operations field channel",
    reporterRole: "District Operations",
    verificationStatus: "Escalated",
    analystSeverity: "Severe",
    trustedReporter: true,
    suspiciousActivity: false,
    duplicateClusterId: null,
    evidence: [],
    operationalNotes: [
      "Escalated to embankment monitoring unit",
      "Bank saturation linked to severe flood-watch corridor"
    ]
  },
  {
    id: "incident-bhagalpur-biodiversity-003",
    title: "Boat disturbance inside dolphin-sensitive stretch",
    description: "High-speed vessel movement reported near active dolphin channel window.",
    category: "Biodiversity Threat",
    severity: "Moderate",
    district: "Bhagalpur",
    locality: "Vikramshila stretch",
    coordinates: {
      latitude: 25.2473,
      longitude: 86.9862
    },
    status: "Reported",
    reportedAt: "21 May 2026, 10:05 AM IST",
    updatedAt: "21 May 2026, 10:05 AM IST",
    sourceLabel: "Boat community intake",
    reporterRole: "Environmental Monitor",
    verificationStatus: "Pending Verification",
    analystSeverity: undefined,
    trustedReporter: true,
    suspiciousActivity: false,
    duplicateClusterId: null,
    evidence: [],
    operationalNotes: [
      "Habitat patrol notification pending"
    ]
  }
];
