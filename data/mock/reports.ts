import type { CommunityReport } from "@/types/environment";

export const communityReports: CommunityReport[] = [
  {
    id: "report-plastic-patna",
    issueType: "plastic waste",
    district: "Patna",
    locality: "Gandhi Ghat",
    severity: "moderate",
    reportedAt: "20 May 2026, 12:18 PM IST",
    reporterLabel: "River Guardian volunteer",
    status: "Pending Review"
  },
  {
    id: "report-sewage-hajipur",
    issueType: "sewage discharge",
    district: "Hajipur",
    locality: "Konhara drainage point",
    severity: "high",
    reportedAt: "20 May 2026, 11:54 AM IST",
    reporterLabel: "Ward observer",
    status: "In Progress"
  },
  {
    id: "report-sand-bhagalpur",
    issueType: "illegal sand mining",
    district: "Bhagalpur",
    locality: "Vikramshila stretch",
    severity: "high",
    reportedAt: "20 May 2026, 10:42 AM IST",
    reporterLabel: "Boat community report",
    status: "Pending Review"
  }
];
