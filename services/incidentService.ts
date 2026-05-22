import { incidentCategoryDefinitions, incidentReports } from "@/data/mock";
import { env } from "@/config/env";
import { apiClient } from "@/lib/api/client";
import { getCurrentUtcIsoTimestamp, getOperationalTimestampValue } from "@/lib/utils";
import type { AnalystAction, IncidentCategoryDefinition, IncidentDraft } from "@/types/dashboard";
import type { IncidentEvidence, IncidentReport } from "@/types/environment";

type IncidentActionResponse = {
  incident: IncidentReport;
};

const incidentRequestOptions = {
  baseUrl: env.incidentApiBaseUrl,
  skipMock: env.useIncidentBackend
};

function buildAbsoluteIncidentUrl(path: string) {
  return new URL(path, `${env.incidentApiBaseUrl.replace(/\/api\/?$/, "")}/`).toString();
}

export function resolveIncidentEvidenceUrl(previewUrl: string) {
  if (!previewUrl) return "";
  if (previewUrl.startsWith("blob:") || previewUrl.startsWith("data:")) return previewUrl;
  if (/^https?:\/\//i.test(previewUrl)) return previewUrl;
  if (previewUrl.startsWith("/")) return buildAbsoluteIncidentUrl(previewUrl);
  return buildAbsoluteIncidentUrl(`/${previewUrl}`);
}

function normalizeIncidentEvidence(item: IncidentEvidence): IncidentEvidence {
  return {
    ...item,
    previewUrl: resolveIncidentEvidenceUrl(item.previewUrl)
  };
}

function normalizeIncidentReport(report: IncidentReport): IncidentReport {
  return {
    ...report,
    evidence: report.evidence.map(normalizeIncidentEvidence)
  };
}

function sortIncidentReports(reports: IncidentReport[]) {
  return [...reports].sort(
    (left, right) => getOperationalTimestampValue(right.reportedAt) - getOperationalTimestampValue(left.reportedAt)
  );
}

export async function getIncidentReports(): Promise<IncidentReport[]> {
  const reports = await apiClient.get("/incidents", {
    ...incidentRequestOptions,
    mockData: incidentReports,
    mockLatencyMs: 600
  });

  return sortIncidentReports(reports.map(normalizeIncidentReport));
}

export async function getIncidentCategoryDefinitions(): Promise<IncidentCategoryDefinition[]> {
  return apiClient.get("/incidents/categories", {
    ...incidentRequestOptions,
    mockData: incidentCategoryDefinitions,
    mockLatencyMs: 300
  });
}

export async function submitIncidentReport(draft: IncidentDraft): Promise<IncidentReport> {
  const now = getCurrentUtcIsoTimestamp();

  const created = await apiClient.post("/incidents", {
    ...incidentRequestOptions,
    mockData: {
      id: `incident-${draft.district.toLowerCase()}-${Date.now()}`,
      title: draft.title,
      description: draft.description,
      category: draft.category,
      severity: draft.severity,
      district: draft.district,
      locality: draft.locality,
      coordinates: {
        latitude: Number(draft.latitude) || 25.5941,
        longitude: Number(draft.longitude) || 85.1376
      },
      status: "Reported",
      reportedAt: now,
      updatedAt: now,
      sourceLabel: "Citizen incident intake",
      reporterRole: "Citizen",
      verificationStatus: "Pending Verification",
      analystSeverity: undefined,
      trustedReporter: false,
      suspiciousActivity: false,
      duplicateClusterId: null,
      evidence: draft.evidence,
      operationalNotes: ["Awaiting analyst triage"]
    } satisfies IncidentReport,
    body: draft,
    mockLatencyMs: 1200
  });

  return normalizeIncidentReport(created);
}

export async function updateIncidentVerification(
  incidentId: string,
  action: AnalystAction
): Promise<IncidentReport> {
  const nowByAction: Record<AnalystAction, string> = {
    verify: getCurrentUtcIsoTimestamp(),
    escalate: getCurrentUtcIsoTimestamp(),
    reject: getCurrentUtcIsoTimestamp(),
    resolve: getCurrentUtcIsoTimestamp()
  };

  const sourceIncident = incidentReports.find((incident) => incident.id === incidentId);
  if (!sourceIncident && !env.useIncidentBackend) {
    throw new Error(`Incident ${incidentId} not found.`);
  }

  const mockIncident: IncidentReport | undefined = !sourceIncident
    ? undefined
    : {
        ...sourceIncident,
        verificationStatus:
          action === "verify"
            ? "Verified"
            : action === "escalate"
              ? "Escalated"
              : action === "resolve"
                ? "Resolved"
                : "Rejected",
        status:
          action === "escalate"
            ? "Escalated"
            : action === "resolve"
              ? "Resolved"
              : "Under Review",
        analystSeverity:
          action === "escalate"
            ? "Severe"
            : sourceIncident.analystSeverity ?? sourceIncident.severity,
        updatedAt: nowByAction[action],
        operationalNotes: [
          action === "verify"
            ? "Analyst verification completed"
            : action === "escalate"
              ? "Escalated into operational incident layer"
              : action === "resolve"
                ? "Resolution logged by district operations"
                : "Rejected during analyst review",
          ...sourceIncident.operationalNotes
        ]
      };

  const response = await apiClient.patch<IncidentActionResponse>(`/incidents/${incidentId}`, {
    ...incidentRequestOptions,
    body: { action },
    mockData: {
      incident: mockIncident ?? incidentReports[0]
    },
    mockLatencyMs: 600
  });

  return normalizeIncidentReport(response.incident);
}

export async function uploadIncidentEvidence(file: File): Promise<IncidentEvidence> {
  if (env.useMockData && !env.useIncidentBackend) {
    return {
      id: `evidence-${Date.now()}`,
      name: file.name,
      previewUrl: URL.createObjectURL(file),
      mimeType: file.type || "image/jpeg",
      sizeKb: Math.max(1, Math.round(file.size / 1024))
    };
  }

  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${env.incidentApiBaseUrl}/incidents/uploads`, {
    method: "POST",
    body: formData
  });

  if (!response.ok) {
    const details = await response.text().catch(() => "");
    throw new Error(details || "Evidence upload failed.");
  }

  const evidence = (await response.json()) as IncidentEvidence;
  return normalizeIncidentEvidence(evidence);
}
