import { incidentCategoryDefinitions, incidentReports } from "@/data/mock";
import { env } from "@/config/env";
import { apiClient, ApiError } from "@/lib/api/client";
import { getCurrentUtcIsoTimestamp, getOperationalTimestampValue, normalizeOperationalTimestamp } from "@/lib/utils";
import type { AnalystAction, IncidentCategoryDefinition, IncidentDraft } from "@/types/dashboard";
import type { IncidentEvidence, IncidentReport } from "@/types/environment";

type IncidentActionResponse = {
  incident: IncidentReport;
};

const INCIDENT_STORAGE_KEY = "ganga-rakshak-incident-cache-v1";

const incidentRequestOptions = {
  baseUrl: env.incidentApiBaseUrl,
  skipMock: env.useIncidentBackend
};

let incidentCache: IncidentReport[] = normalizeIncidentReports(incidentReports);

function buildAbsoluteIncidentUrl(path: string) {
  return new URL(path, `${env.incidentApiBaseUrl.replace(/\/api\/?$/, "")}/`).toString();
}

function isBrowser() {
  return typeof window !== "undefined";
}

function readStoredIncidentCache() {
  if (!isBrowser()) return [];

  try {
    const raw = window.localStorage.getItem(INCIDENT_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as IncidentReport[];
    return normalizeIncidentReports(parsed);
  } catch (error) {
    console.warn("[Incidents] Unable to read local incident cache.", error);
    return [];
  }
}

function writeStoredIncidentCache(reports: IncidentReport[]) {
  if (!isBrowser()) return;

  try {
    window.localStorage.setItem(INCIDENT_STORAGE_KEY, JSON.stringify(reports));
  } catch (error) {
    console.warn("[Incidents] Unable to persist local incident cache.", error);
  }
}

function mergeIncidentReports(...collections: IncidentReport[][]) {
  const merged = new Map<string, IncidentReport>();

  collections.flat().forEach((report) => {
    const normalized = normalizeIncidentReport(report);
    const existing = merged.get(normalized.id);
    if (!existing || getOperationalTimestampValue(normalized.updatedAt) >= getOperationalTimestampValue(existing.updatedAt)) {
      merged.set(normalized.id, normalized);
    }
  });

  return sortIncidentReports([...merged.values()]);
}

function setIncidentCache(reports: IncidentReport[]) {
  incidentCache = mergeIncidentReports(reports);
  writeStoredIncidentCache(incidentCache);
  return incidentCache;
}

function buildFallbackIncident(draft: IncidentDraft) {
  const now = getCurrentUtcIsoTimestamp();

  return normalizeIncidentReport({
    id: `incident-${draft.district.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`,
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
  } satisfies IncidentReport);
}

function buildFallbackModeration(sourceIncident: IncidentReport, action: AnalystAction) {
  const now = getCurrentUtcIsoTimestamp();

  return normalizeIncidentReport({
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
    updatedAt: now,
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
  });
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
    reportedAt: normalizeOperationalTimestamp(report.reportedAt),
    updatedAt: normalizeOperationalTimestamp(report.updatedAt || report.reportedAt),
    evidence: report.evidence.map(normalizeIncidentEvidence)
  };
}

function normalizeIncidentReports(reports: IncidentReport[]) {
  return sortIncidentReports(reports.map(normalizeIncidentReport));
}

function sortIncidentReports(reports: IncidentReport[]) {
  return [...reports].sort(
    (left, right) => getOperationalTimestampValue(right.reportedAt) - getOperationalTimestampValue(left.reportedAt)
  );
}

export function getCachedIncidentReports() {
  if (isBrowser()) {
    const stored = readStoredIncidentCache();
    if (stored.length) {
      incidentCache = mergeIncidentReports(incidentCache, stored);
    }
  }

  return incidentCache;
}

export async function getIncidentReports(): Promise<IncidentReport[]> {
  return getCachedIncidentReports();
}

export async function getIncidentCategoryDefinitions(): Promise<IncidentCategoryDefinition[]> {
  return incidentCategoryDefinitions;
}

export async function submitIncidentReport(draft: IncidentDraft): Promise<IncidentReport> {
  const fallbackIncident = buildFallbackIncident(draft);

  try {
    const created = await apiClient.post("/incidents", {
      ...incidentRequestOptions,
      mockData: fallbackIncident,
      body: draft,
      mockLatencyMs: 1200
    });

    const normalized = normalizeIncidentReport(created);
    setIncidentCache(mergeIncidentReports([normalized], getCachedIncidentReports()));
    return normalized;
  } catch (error) {
    console.warn("[Incidents] Submission fell back to local cache.", error);
    setIncidentCache(mergeIncidentReports([fallbackIncident], getCachedIncidentReports()));
    return fallbackIncident;
  }
}

export async function updateIncidentVerification(
  incidentId: string,
  action: AnalystAction
): Promise<IncidentReport> {
  const currentReports = getCachedIncidentReports();
  const sourceIncident = currentReports.find((incident) => incident.id === incidentId);

  if (!sourceIncident) {
    throw new ApiError(`Incident ${incidentId} not found.`, "INCIDENT_NOT_FOUND");
  }

  const fallbackIncident = buildFallbackModeration(sourceIncident, action);

  try {
    const response = await apiClient.patch<IncidentActionResponse>(`/incidents/${incidentId}`, {
      ...incidentRequestOptions,
      body: { action },
      mockData: {
        incident: fallbackIncident
      },
      mockLatencyMs: 600
    });

    const normalized = normalizeIncidentReport(response.incident);
    setIncidentCache(
      mergeIncidentReports(
        currentReports.map((report) => (report.id === normalized.id ? normalized : report))
      )
    );
    return normalized;
  } catch (error) {
    console.warn("[Incidents] Moderation update fell back to local cache.", error);
    setIncidentCache(
      mergeIncidentReports(
        currentReports.map((report) => (report.id === fallbackIncident.id ? fallbackIncident : report))
      )
    );
    return fallbackIncident;
  }
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

  try {
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
  } catch (error) {
    console.warn("[Incidents] Evidence upload fell back to local object URL.", error);
    return {
      id: `evidence-${Date.now()}`,
      name: file.name,
      previewUrl: URL.createObjectURL(file),
      mimeType: file.type || "image/jpeg",
      sizeKb: Math.max(1, Math.round(file.size / 1024))
    };
  }
}
