"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

import { formatOperationalDateTime, getOperationalTimestampValue } from "@/lib/utils";
import { useOperationalStore } from "@/lib/state/useOperationalStore";
import { getIncidentReports, resolveIncidentEvidenceUrl, updateIncidentVerification } from "@/services/incidentService";
import { getSubmissionFailureMessage } from "@/lib/feedback/operationalMessages";
import { useUiFeedbackStore } from "@/lib/state/useUiFeedbackStore";
import { OperationalDetailSkeleton, OperationalEmptyState, OperationalSkeletonRows } from "@/components/ui/OperationalState";
import { ecosystemSignals, operationalWorkflow } from "@/data/mock";
import type { AnalystAction } from "@/types/dashboard";
import type { IncidentCategory, IncidentReport, IncidentSeverity, IncidentStatus, VerificationStatus } from "@/types/environment";

type IncidentReportsWorkspaceProps = {
  initialReports?: IncidentReport[];
};

type ReportFilters = {
  district: string | "All";
  severity: IncidentSeverity | "All";
  status: IncidentStatus | "All";
  category: IncidentCategory | "All";
  search: string;
};

const defaultFilters: ReportFilters = {
  district: "All",
  severity: "All",
  status: "All",
  category: "All",
  search: ""
};

function normalizeForSearch(value: string) {
  return value.trim().toLowerCase();
}

function getVerificationTone(status: VerificationStatus) {
  if (status === "Escalated") return "tone-escalated";
  if (status === "Resolved") return "tone-resolved";
  if (status === "Verified") return "tone-verified";
  if (status === "Rejected") return "tone-rejected";
  return "tone-pending";
}

function buildDistrictSummary(reports: IncidentReport[]) {
  return [...reports]
    .reduce<Array<{ district: string; total: number; escalated: number; pending: number }>>((acc, report) => {
      const existing = acc.find((item) => item.district === report.district);
      if (existing) {
        existing.total += 1;
        if (report.verificationStatus === "Escalated") existing.escalated += 1;
        if (report.verificationStatus === "Pending Verification" || report.verificationStatus === "Under Analyst Review") {
          existing.pending += 1;
        }
        return acc;
      }

      acc.push({
        district: report.district,
        total: 1,
        escalated: report.verificationStatus === "Escalated" ? 1 : 0,
        pending:
          report.verificationStatus === "Pending Verification" || report.verificationStatus === "Under Analyst Review" ? 1 : 0
      });
      return acc;
    }, [])
    .sort((left, right) => right.total - left.total || left.district.localeCompare(right.district));
}

function buildModerationHistory(report: IncidentReport) {
  const history = [
    {
      label: "Incident reported",
      detail: `${report.reporterRole} submission from ${report.sourceLabel}`,
      timestamp: report.reportedAt
    }
  ];

  if (report.updatedAt !== report.reportedAt) {
    history.push({
      label: report.verificationStatus,
      detail: `Lifecycle updated to ${report.status}`,
      timestamp: report.updatedAt
    });
  }

  report.operationalNotes.slice(0, 4).forEach((note, index) => {
    history.push({
      label: `Operational note ${index + 1}`,
      detail: note,
      timestamp: index === 0 ? report.updatedAt : report.reportedAt
    });
  });

  return history;
}

function summarizeReport(report: IncidentReport) {
  return report.operationalNotes[0] ?? report.description;
}

function buildDisplayReportId(report: IncidentReport) {
  const compactId = report.id.split("-").slice(-1)[0]?.toUpperCase() ?? "0000";
  return `Report ${report.district.slice(0, 3).toUpperCase()}-${compactId}`;
}

function EvidencePreview({ src, alt }: { src: string; alt: string }) {
  const [hasFailed, setHasFailed] = useState(false);
  const pushToast = useUiFeedbackStore((state) => state.pushToast);

  if (!src || hasFailed) {
    return (
      <div className="reports-evidence-fallback" aria-label="Evidence preview unavailable">
        <strong>Preview unavailable</strong>
        <span>Stored evidence could not be rendered.</span>
      </div>
    );
  }

  return (
    <img
      src={resolveIncidentEvidenceUrl(src)}
      alt={alt}
      className="reports-evidence-image"
      onError={() => {
        setHasFailed(true);
        pushToast({
          tone: "error",
          title: "Image preview unavailable",
          detail: "The evidence asset could not be rendered in the inspector."
        });
      }}
    />
  );
}

export function IncidentReportsWorkspace({ initialReports = [] }: IncidentReportsWorkspaceProps) {
  const [filters, setFilters] = useState<ReportFilters>(defaultFilters);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(initialReports[0]?.id ?? null);
  const [activeActionId, setActiveActionId] = useState<string | null>(null);
  const [isLoadingReports, setIsLoadingReports] = useState(initialReports.length === 0);
  const [reportsError, setReportsError] = useState<string | null>(null);
  const activeRole = useOperationalStore((state) => state.activeRole);
  const reports = useOperationalStore((state) => state.incidentReports);
  const setIncidentReports = useOperationalStore((state) => state.setIncidentReports);
  const replaceIncidentReport = useOperationalStore((state) => state.replaceIncidentReport);
  const pushToast = useUiFeedbackStore((state) => state.pushToast);

  function syncReports(nextReports: IncidentReport[]) {
    setIncidentReports(nextReports);
  }

  useEffect(() => {
    if (initialReports.length) {
      setIncidentReports(initialReports);
    }
  }, [initialReports, setIncidentReports]);

  useEffect(() => {
    let active = true;

    void getIncidentReports()
      .then((nextReports) => {
        if (!active) return;
        syncReports(nextReports);
        setReportsError(null);
        if (!selectedReportId && nextReports[0]) {
          setSelectedReportId(nextReports[0].id);
        }
      })
      .catch((error) => {
        if (!active) return;
        const message = getSubmissionFailureMessage(error);
        setReportsError(message.detail);
      })
      .finally(() => {
        if (!active) return;
        setIsLoadingReports(false);
      });

    return () => {
      active = false;
    };
  }, [setIncidentReports]);

  const districtOptions = useMemo(
    () => ["All", ...new Set(reports.map((report) => report.district))],
    [reports]
  );
  const severityOptions = useMemo(
    () => ["All", ...new Set(reports.map((report) => report.analystSeverity ?? report.severity))],
    [reports]
  );
  const statusOptions = useMemo(
    () => ["All", ...new Set(reports.map((report) => report.status))],
    [reports]
  );
  const categoryOptions = useMemo(
    () => ["All", ...new Set(reports.map((report) => report.category))],
    [reports]
  );

  const filteredReports = useMemo(() => {
    const search = normalizeForSearch(filters.search);

    return reports.filter((report) => {
      const severity = report.analystSeverity ?? report.severity;
      const haystack = normalizeForSearch(
        `${report.title} ${report.category} ${report.district} ${report.status} ${report.reporterRole} ${report.description} ${report.locality}`
      );

      return (
        (filters.district === "All" || report.district === filters.district) &&
        (filters.severity === "All" || severity === filters.severity) &&
        (filters.status === "All" || report.status === filters.status) &&
        (filters.category === "All" || report.category === filters.category) &&
        (!search || haystack.includes(search))
      );
    });
  }, [filters, reports]);

  const selectedReport =
    filteredReports.find((report) => report.id === selectedReportId) ??
    reports.find((report) => report.id === selectedReportId) ??
    filteredReports[0] ??
    reports[0] ??
    null;

  useEffect(() => {
    if (!selectedReport && selectedReportId !== null) {
      setSelectedReportId(null);
      return;
    }

    if (!selectedReportId && selectedReport) {
      setSelectedReportId(selectedReport.id);
    }
  }, [selectedReport, selectedReportId]);

  const districtSummary = useMemo(() => buildDistrictSummary(filteredReports), [filteredReports]);

  const stats = useMemo(
    () => ({
      total: filteredReports.length,
      pending: filteredReports.filter(
        (report) =>
          report.verificationStatus === "Pending Verification" ||
          report.verificationStatus === "Under Analyst Review"
      ).length,
      escalated: filteredReports.filter((report) => report.verificationStatus === "Escalated").length,
      resolved: filteredReports.filter((report) => report.verificationStatus === "Resolved").length
    }),
    [filteredReports]
  );

  const canModerate = activeRole === "Analyst" || activeRole === "Admin";
  const selectedLinkedSignals = useMemo(
    () =>
      selectedReport
        ? ecosystemSignals
            .filter((signal) => signal.relatedIncidentId === selectedReport.id || signal.district === selectedReport.district)
            .slice(0, 3)
        : [],
    [selectedReport]
  );

  async function handleAction(incidentId: string, action: AnalystAction) {
    setActiveActionId(incidentId);
    const previous = reports;
    syncReports(
      reports.map((report) =>
        report.id !== incidentId
          ? report
          : {
              ...report,
              verificationStatus:
                action === "verify"
                  ? "Verified"
                  : action === "escalate"
                    ? "Escalated"
                    : action === "resolve"
                      ? "Resolved"
                      : "Rejected",
              status: action === "resolve" ? "Resolved" : action === "escalate" ? "Escalated" : "Under Review"
            }
      )
    );

    try {
      const updated = await updateIncidentVerification(incidentId, action);
      const nextReports = [...reports.map((report) => (report.id === updated.id ? updated : report))].sort(
          (left, right) => getOperationalTimestampValue(right.reportedAt) - getOperationalTimestampValue(left.reportedAt)
        );
      syncReports(nextReports);
      replaceIncidentReport(updated);
      pushToast({
        tone: "success",
        title: "Report updated",
        detail: `Moderation change saved to the operational incident archive.`
      });
    } catch (error) {
      syncReports(previous);
      const message = getSubmissionFailureMessage(new Error(`moderation ${String(error)}`));
      pushToast({
        tone: "error",
        title: message.title,
        detail: message.detail
      });
    } finally {
      setActiveActionId(null);
    }
  }

  return (
    <section className="reports-workspace">
      <motion.div
        className="reports-hero analyst-hero"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.24, ease: "easeOut" }}
      >
        <div>
          <p className="eyebrow">Environmental Incident Archive</p>
          <h1>Operational reports and moderation ledger</h1>
          <p className="analyst-hero-copy">
            This workspace extends the dashboard with a searchable incident archive, verification visibility, and a compact
            review panel for operational follow-through.
          </p>
        </div>
        <div className="analyst-mode-indicator reports-mode-indicator">
          <span>Simulation Mode</span>
          <strong>{activeRole}</strong>
        </div>
      </motion.div>

      <motion.section
        className="reports-filters analyst-filters"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.24, delay: 0.04, ease: "easeOut" }}
      >
        <div>
          <span className="incident-section-label">Operational overview</span>
          <strong>
            {stats.total} total • {stats.pending} pending • {stats.escalated} escalated • {stats.resolved} resolved
          </strong>
        </div>
        <div className="reports-filter-grid">
          <input
            type="search"
            value={filters.search}
            onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
            placeholder="Search title, district, role, locality"
          />
          <select
            value={filters.district}
            onChange={(event) => setFilters((current) => ({ ...current, district: event.target.value as ReportFilters["district"] }))}
          >
            {districtOptions.map((option) => (
              <option key={option} value={option}>
                {option === "All" ? "All districts" : option}
              </option>
            ))}
          </select>
          <select
            value={filters.severity}
            onChange={(event) => setFilters((current) => ({ ...current, severity: event.target.value as ReportFilters["severity"] }))}
          >
            {severityOptions.map((option) => (
              <option key={option} value={option}>
                {option === "All" ? "All severities" : option}
              </option>
            ))}
          </select>
          <select
            value={filters.status}
            onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value as ReportFilters["status"] }))}
          >
            {statusOptions.map((option) => (
              <option key={option} value={option}>
                {option === "All" ? "All statuses" : option}
              </option>
            ))}
          </select>
          <select
            value={filters.category}
            onChange={(event) => setFilters((current) => ({ ...current, category: event.target.value as ReportFilters["category"] }))}
          >
            {categoryOptions.map((option) => (
              <option key={option} value={option}>
                {option === "All" ? "All categories" : option}
              </option>
            ))}
          </select>
          <button type="button" className="incident-secondary reports-reset-button" onClick={() => setFilters(defaultFilters)}>
            Reset filters
          </button>
        </div>
      </motion.section>

      <motion.section
        className="reports-layout"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.26, delay: 0.08, ease: "easeOut" }}
      >
        <article className="analyst-panel reports-feed-panel">
          <div className="panel-head">
            <h4>Incident Feed</h4>
            <span>{filteredReports.length} records • {districtSummary.length} districts</span>
          </div>

          <div className="reports-district-summary-row">
            {districtSummary.slice(0, 4).map((item) => (
              <div key={item.district} className="reports-district-chip">
                <strong>{item.district}</strong>
                <span>{item.total} logged</span>
              </div>
            ))}
          </div>

          <div className="reports-feed-list">
            {reportsError ? <div className="inline-operational-error">{reportsError}</div> : null}
            {isLoadingReports ? <OperationalSkeletonRows rows={4} /> : null}
            {filteredReports.map((report) => {
              const severity = report.analystSeverity ?? report.severity;
              const isActive = selectedReport?.id === report.id;

              return (
                <button
                  key={report.id}
                  type="button"
                  className={`reports-feed-card ${isActive ? "active" : ""}`}
                  onClick={() => setSelectedReportId(report.id)}
                >
                  <div className="reports-feed-card-top">
                    <div className="reports-feed-title">
                      <strong>{report.title}</strong>
                      <p>{report.category}</p>
                    </div>
                    <div className="reports-feed-badges">
                      <span className={`incident-severity-pill severity-${severity.toLowerCase()}`}>{severity}</span>
                      <span className={`reports-status-pill ${getVerificationTone(report.verificationStatus)}`}>
                        {report.verificationStatus}
                      </span>
                    </div>
                  </div>

                  <div className="reports-feed-meta">
                    <span>{report.district}</span>
                    <span>{report.status}</span>
                    <span>{formatOperationalDateTime(report.reportedAt)}</span>
                    <span>{report.reporterRole}</span>
                  </div>

                  <p className="reports-feed-summary">{summarizeReport(report)}</p>
                </button>
              );
            })}

            {!isLoadingReports && !filteredReports.length ? (
              <OperationalEmptyState
                title={reports.length ? "No incidents found" : "No incidents logged"}
                detail={
                  reports.length
                    ? "Current filters returned zero results. Clear one or more filters to widen the archive view."
                    : "The incident archive is ready, but no reports have been submitted yet."
                }
              />
            ) : null}
          </div>
        </article>

        <aside className="analyst-panel reports-detail-panel">
          <div className="panel-head">
            <h4>Report Detail</h4>
            <span>{selectedReport ? buildDisplayReportId(selectedReport) : "No selection"}</span>
          </div>

          {isLoadingReports ? (
            <OperationalDetailSkeleton />
          ) : selectedReport ? (
            <div className="reports-detail-content">
              <div className="reports-detail-head">
                <div>
                  <h3>{selectedReport.title}</h3>
                  <p>
                    {selectedReport.district} • {selectedReport.locality} • {selectedReport.category}
                  </p>
                </div>
                <span
                  className={`incident-severity-pill severity-${(selectedReport.analystSeverity ?? selectedReport.severity).toLowerCase()}`}
                >
                  {selectedReport.analystSeverity ?? selectedReport.severity}
                </span>
              </div>

              <div className="reports-pill-row">
                <span className={`reports-status-pill ${getVerificationTone(selectedReport.verificationStatus)}`}>
                  {selectedReport.verificationStatus}
                </span>
                <span className="reports-status-pill tone-neutral">{selectedReport.status}</span>
                <span className="reports-status-pill tone-neutral">{selectedReport.reporterRole}</span>
              </div>

              <section className="reports-detail-section">
                <span className="incident-section-label">Full description</span>
                <p>{selectedReport.description}</p>
              </section>

              <section className="reports-detail-section">
                <span className="incident-section-label">Evidence preview</span>
                {selectedReport.evidence.length ? (
                  <div className="reports-evidence-stack">
                    {selectedReport.evidence.slice(0, 1).map((item) => (
                      <div key={item.id} className="reports-evidence-card">
                        <div className="reports-evidence-media">
                          <EvidencePreview src={item.previewUrl} alt="Incident evidence preview" />
                        </div>
                        <p>{item.mimeType} • {item.sizeKb} KB</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <OperationalEmptyState
                    compact
                    title="No evidence attached"
                    detail="This incident was logged without photo evidence."
                  />
                )}
              </section>

              <section className="reports-detail-section">
                <span className="incident-section-label">Moderation history</span>
                <div className="reports-history-list">
                  {buildModerationHistory(selectedReport).map((item, index) => (
                    <div key={`${selectedReport.id}-${item.label}-${index}`} className="reports-history-item">
                      <strong>{item.label}</strong>
                      <p>{item.detail}</p>
                      <span>{formatOperationalDateTime(item.timestamp)}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section className="reports-detail-section">
                <span className="incident-section-label">Connected ecosystem flow</span>
                <div className="reports-pill-row">
                  {operationalWorkflow.map((step) => (
                    <span className="reports-status-pill tone-neutral" key={step}>{step}</span>
                  ))}
                </div>
                <div className="reports-history-list">
                  {selectedLinkedSignals.map((signal) => (
                    <div key={signal.id} className="reports-history-item">
                      <strong>{signal.category} · {signal.severity}</strong>
                      <p>{signal.title}</p>
                      <span>{signal.district} • {signal.updatedAgo}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section className="reports-detail-section">
                <span className="incident-section-label">Operational metadata</span>
                <div className="reports-metadata-list">
                  <div>
                    <strong>Reported</strong>
                    <span>{formatOperationalDateTime(selectedReport.reportedAt)}</span>
                  </div>
                  <div>
                    <strong>Last updated</strong>
                    <span>{formatOperationalDateTime(selectedReport.updatedAt)}</span>
                  </div>
                  <div>
                    <strong>Source label</strong>
                    <span>{selectedReport.sourceLabel}</span>
                  </div>
                  <div>
                    <strong>Coordinates</strong>
                    <span>
                      {selectedReport.coordinates.latitude.toFixed(4)}, {selectedReport.coordinates.longitude.toFixed(4)}
                    </span>
                  </div>
                </div>
              </section>

              <details className="reports-detail-accordion">
                <summary>Analyst notes</summary>
                <div className="reports-notes-list">
                  {selectedReport.operationalNotes.map((note) => (
                    <div key={`${selectedReport.id}-${note}`} className="reports-note-item">
                      {note}
                    </div>
                  ))}
                </div>
              </details>

              <details className="reports-detail-accordion">
                <summary>Internal escalation signals</summary>
                <div className="reports-meta-grid">
                  <div className="reports-meta-card">
                    <strong>{selectedReport.verificationStatus}</strong>
                    <p>Current verification stage</p>
                  </div>
                  <div className="reports-meta-card">
                    <strong>{selectedReport.duplicateClusterId ?? "Standalone"}</strong>
                    <p>Cluster grouping</p>
                  </div>
                  <div className="reports-meta-card">
                    <strong>{selectedReport.trustedReporter ? "Trusted channel" : "Standard channel"}</strong>
                    <p>Reporter trust signal</p>
                  </div>
                  <div className="reports-meta-card">
                    <strong>{selectedReport.suspiciousActivity ? "Flagged" : "Clear"}</strong>
                    <p>Suspicious activity screening</p>
                  </div>
                </div>
              </details>

              {canModerate ? (
                <section className="reports-detail-section">
                  <span className="incident-section-label">Moderation controls</span>
                  <div className="incident-mini-actions reports-action-row">
                    {selectedReport.verificationStatus === "Pending Verification" ||
                    selectedReport.verificationStatus === "Under Analyst Review" ||
                    selectedReport.verificationStatus === "Rejected" ? (
                      <>
                        <button
                          type="button"
                          disabled={activeActionId === selectedReport.id}
                          onClick={() => handleAction(selectedReport.id, "verify")}
                        >
                          Verify
                        </button>
                        <button
                          type="button"
                          disabled={activeActionId === selectedReport.id}
                          onClick={() => handleAction(selectedReport.id, "escalate")}
                        >
                          Escalate
                        </button>
                        <button
                          type="button"
                          disabled={activeActionId === selectedReport.id}
                          onClick={() => handleAction(selectedReport.id, "reject")}
                        >
                          Reject
                        </button>
                      </>
                    ) : null}
                    {selectedReport.verificationStatus !== "Resolved" &&
                    (selectedReport.verificationStatus === "Verified" || selectedReport.verificationStatus === "Escalated") ? (
                      <button
                        type="button"
                        disabled={activeActionId === selectedReport.id}
                        onClick={() => handleAction(selectedReport.id, "resolve")}
                      >
                        Mark Resolved
                      </button>
                    ) : null}
                  </div>
                </section>
              ) : null}
            </div>
          ) : (
            <OperationalEmptyState
              title="No report selected"
              detail="Select a record from the incident feed to inspect its operational detail."
            />
          )}
        </aside>
      </motion.section>
    </section>
  );
}
