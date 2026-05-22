import type { EnvironmentalAlert } from "@/types/environment";

export const environmentalAlerts: EnvironmentalAlert[] = [
  {
    id: "alert-pollution-patna",
    type: "pollution alert",
    title: "Elevated organic load near Gandhi Ghat",
    district: "Patna",
    severity: "moderate",
    status: "Monitoring",
    timestamp: "20 May 2026, 1:50 PM IST",
    summary: "Field readings indicate elevated organic content near a stormwater outfall."
  },
  {
    id: "alert-sewage-hajipur",
    type: "sewage leakage",
    title: "Drain outfall discharging untreated sewage",
    district: "Hajipur",
    severity: "high",
    status: "Open",
    timestamp: "20 May 2026, 12:35 PM IST",
    summary: "Continuous sewage leakage reported into a tributary channel during afternoon flow."
  },
  {
    id: "alert-flood-munger",
    type: "flood warning",
    title: "Floodplain watch escalated around Munger lowlands",
    district: "Munger",
    severity: "high",
    status: "Monitoring",
    timestamp: "20 May 2026, 2:26 PM IST",
    summary: "Bank-side settlements should monitor drainage congestion through the evening."
  },
  {
    id: "alert-sand-bhagalpur",
    type: "illegal sand mining",
    title: "Unlicensed extraction flagged upstream of Vikramshila",
    district: "Bhagalpur",
    severity: "moderate",
    status: "Open",
    timestamp: "20 May 2026, 11:48 AM IST",
    summary: "Community observers flagged active extraction near a dolphin-sensitive reach."
  },
  {
    id: "alert-dead-fish-sahibganj",
    type: "dead fish incident",
    title: "Fish mortality cluster under investigation",
    district: "Sahibganj",
    severity: "moderate",
    status: "Open",
    timestamp: "20 May 2026, 9:12 AM IST",
    summary: "A small cluster of dead fish was found near a stagnant backwater pocket."
  }
];
