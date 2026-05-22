"use client";

import { AnimatePresence, motion, useDragControls } from "framer-motion";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import { useOperationalStore } from "@/lib/state/useOperationalStore";
import { getSubmissionFailureMessage } from "@/lib/feedback/operationalMessages";
import { useUiFeedbackStore } from "@/lib/state/useUiFeedbackStore";
import { formatOperationalDateTime } from "@/lib/utils";
import { getIncidentReports, updateIncidentVerification } from "@/services/incidentService";
import type { AnalystAction } from "@/types/dashboard";
import type { IncidentReport } from "@/types/environment";

type AnalystIncidentPanelProps = {
  initialReports?: IncidentReport[];
  embedded?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
};

type VolunteerAssessment = "Corroborated" | "Needs Analyst Review";
type PanelPosition = { x: number; y: number };

const REVIEW_PANEL_STORAGE_KEY = "ganga-rakshak-incident-review-panel-position";

export function AnalystIncidentPanel({
  initialReports = [],
  embedded = false,
  isOpen = true,
  onClose
}: AnalystIncidentPanelProps) {
  const [reports, setReports] = useState<IncidentReport[]>(initialReports);
  const [districtFilter, setDistrictFilter] = useState<string>("All");
  const [activeActionId, setActiveActionId] = useState<string | null>(null);
  const [volunteerAssessments, setVolunteerAssessments] = useState<Record<string, VolunteerAssessment>>({});
  const [panelPosition, setPanelPosition] = useState<PanelPosition>({ x: 0, y: 0 });
  const [dragConstraints, setDragConstraints] = useState({ left: -24, right: 0, top: 0, bottom: 0 });
  const activeRole = useOperationalStore((state) => state.activeRole);
  const pushToast = useUiFeedbackStore((state) => state.pushToast);
  const dragControls = useDragControls();
  const constraintsRef = useRef<HTMLDivElement | null>(null);
  const [isLoadingReports, setIsLoadingReports] = useState(initialReports.length === 0);
  const [panelError, setPanelError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    void getIncidentReports()
      .then((nextReports) => {
        if (!active) return;
        setReports(nextReports);
        setPanelError(null);
      })
      .catch((error) => {
        if (!active) return;
        const message = getSubmissionFailureMessage(error);
        setPanelError(message.detail);
      })
      .finally(() => {
        if (!active) return;
        setIsLoadingReports(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!embedded || !isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose?.();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [embedded, isOpen, onClose]);

  useEffect(() => {
    if (!embedded || typeof window === "undefined") return;

    const saved = window.sessionStorage.getItem(REVIEW_PANEL_STORAGE_KEY);
    if (!saved) return;

    try {
      const parsed = JSON.parse(saved) as PanelPosition;
      if (typeof parsed.x === "number" && typeof parsed.y === "number") {
        setPanelPosition(parsed);
      }
    } catch {
      window.sessionStorage.removeItem(REVIEW_PANEL_STORAGE_KEY);
    }
  }, [embedded]);

  useEffect(() => {
    if (!embedded || typeof window === "undefined") return;

    const updateConstraints = () => {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const panelWidth = Math.min(620, viewportWidth - 28);
      const panelHeight = viewportHeight - 28;

      setDragConstraints({
        left: -(viewportWidth - panelWidth - 14),
        right: 0,
        top: 0,
        bottom: Math.max(0, viewportHeight - panelHeight - 14)
      });
    };

    updateConstraints();
    window.addEventListener("resize", updateConstraints);
    return () => window.removeEventListener("resize", updateConstraints);
  }, [embedded]);

  const districtOptions = useMemo(
    () => ["All", ...new Set(reports.map((report) => report.district))],
    [reports]
  );

  const filteredReports = useMemo(
    () => reports.filter((report) => districtFilter === "All" || report.district === districtFilter),
    [districtFilter, reports]
  );

  const verificationQueue = filteredReports.filter(
    (report) =>
      report.verificationStatus === "Pending Verification" ||
      report.verificationStatus === "Under Analyst Review" ||
      report.verificationStatus === "Rejected"
  );

  const officialLayer = filteredReports.filter(
    (report) =>
      report.verificationStatus === "Verified" ||
      report.verificationStatus === "Escalated" ||
      report.verificationStatus === "Resolved"
  );

  const canAccessOperationalQueue =
    activeRole === "Environmental Monitor / Volunteer" || activeRole === "Analyst" || activeRole === "Admin";
  const canModerate = activeRole === "Analyst" || activeRole === "Admin";
  const isVolunteer = activeRole === "Environmental Monitor / Volunteer";
  const isAdmin = activeRole === "Admin";

  const stats = {
    total: filteredReports.length,
    queue: verificationQueue.length,
    escalated: filteredReports.filter((report) => report.verificationStatus === "Escalated").length,
    resolved: filteredReports.filter((report) => report.verificationStatus === "Resolved").length
  };

  const heroCopy =
    activeRole === "Citizen"
      ? "Citizen users do not access the operational moderation workspace. Use the dashboard intake flow to submit a report."
      : activeRole === "Environmental Monitor / Volunteer"
        ? "Volunteer review is limited to community verification support. Official moderation and lifecycle changes remain with analysts and operations."
        : activeRole === "Analyst"
          ? "Analysts can verify, reject, and escalate field reports into the operational incident layer."
          : "Admin view includes full operational visibility across intake, escalation, and resolution stages.";

  const handleAction = async (incidentId: string, action: AnalystAction) => {
    setActiveActionId(incidentId);
    const previous = reports;
    setReports((current) =>
      current.map((report) =>
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
      setReports((current) => current.map((report) => (report.id === updated.id ? updated : report)));
      pushToast({
        tone: "success",
        title: "Moderation updated",
        detail: `Incident ${action === "resolve" ? "resolved" : action === "escalate" ? "escalated" : action === "verify" ? "verified" : "rejected"} successfully.`
      });
    } catch (error) {
      setReports(previous);
      const message = getSubmissionFailureMessage(new Error(`moderation ${String(error)}`));
      pushToast({
        tone: "error",
        title: message.title,
        detail: message.detail
      });
    } finally {
      setActiveActionId(null);
    }
  };

  const handleVolunteerAssessment = (incidentId: string, assessment: VolunteerAssessment) => {
    setVolunteerAssessments((current) => ({
      ...current,
      [incidentId]: assessment
    }));
  };

  const content = (
    <div className={embedded ? "analyst-overlay-shell" : "analyst-page-frame"}>
      <section className="analyst-hero">
        <div>
          <p className="eyebrow">Incident Operations</p>
          <h1>Role-adaptive reporting and moderation workspace</h1>
          <p className="analyst-hero-copy">{heroCopy}</p>
        </div>
        <div className="analyst-hero-actions">
          <div className="analyst-mode-indicator">
            <span>Simulation Mode</span>
            <strong>{activeRole}</strong>
          </div>
          {embedded ? (
            <button type="button" className="analyst-link-button" onClick={onClose}>
              Close workspace
            </button>
          ) : (
            <Link href="/" className="analyst-link-button">
              Return to dashboard
            </Link>
          )}
        </div>
      </section>

      {activeRole === "Citizen" ? (
        <section className="analyst-panel citizen-redirect-panel">
          <div className="panel-head">
            <h4>Citizen access</h4>
            <span>Public workflow only</span>
          </div>
          <p className="analyst-hero-copy">
            The public-facing incident workflow is intentionally simple. Citizen users submit a geospatial report from
            the dashboard and do not see verification, escalation, or moderation controls.
          </p>
          <div className="incident-actions">
            <Link href="/" className="incident-primary analyst-primary-link">
              Open citizen reporting flow
            </Link>
          </div>
        </section>
      ) : (
        <>
          <section className="analyst-stats-grid">
            <article className="analyst-stat-card">
              <span>Visible incidents</span>
              <strong>{stats.total}</strong>
              <p>Current district filter</p>
            </article>
            <article className="analyst-stat-card">
              <span>Verification queue</span>
              <strong>{stats.queue}</strong>
              <p>{isVolunteer ? "Community reports awaiting support review" : "Pending review or rejected submissions"}</p>
            </article>
            <article className="analyst-stat-card">
              <span>Escalated cases</span>
              <strong>{stats.escalated}</strong>
              <p>Operational incidents in active handling</p>
            </article>
            <article className="analyst-stat-card">
              <span>Resolved</span>
              <strong>{stats.resolved}</strong>
              <p>Closed and logged for follow-up</p>
            </article>
          </section>

          <section className="analyst-filters">
            <div>
              <span className="incident-section-label">Current workflow</span>
              <strong>{activeRole}</strong>
            </div>
            <select value={districtFilter} onChange={(event) => setDistrictFilter(event.target.value)}>
              {districtOptions.map((district) => (
                <option key={district} value={district}>
                  {district === "All" ? "All districts" : district}
                </option>
              ))}
            </select>
          </section>

          <section className="analyst-grid">
            {canAccessOperationalQueue ? (
              <article className="analyst-panel">
                <div className="panel-head">
                  <h4>{isVolunteer ? "Community Verification Support" : "Verification Queue"}</h4>
                  <span>{verificationQueue.length} awaiting review</span>
                </div>
                {panelError ? <div className="inline-operational-error">{panelError}</div> : null}
                <div className="analyst-feed">
                  {isLoadingReports ? (
                    <div className="operational-skeleton-stack compact">
                      <div className="operational-skeleton-card" />
                      <div className="operational-skeleton-card" />
                    </div>
                  ) : null}
                  {verificationQueue.map((report) => (
                    <div key={report.id} className="analyst-incident-card">
                      <div className="analyst-incident-head">
                        <div>
                          <strong>{report.title}</strong>
                          <p>
                            {report.district} • {report.category} • {report.verificationStatus}
                          </p>
                        </div>
                        <span className={`incident-severity-pill severity-${(report.analystSeverity ?? report.severity).toLowerCase()}`}>
                          {report.analystSeverity ?? report.severity}
                        </span>
                      </div>
                      <p className="analyst-incident-description">{report.description}</p>
                      <div className="analyst-meta-row">
                        <span>{report.locality}</span>
                        <span>{formatOperationalDateTime(report.reportedAt)}</span>
                        <span>{report.reporterRole}</span>
                      </div>
                      <div className="analyst-note-strip">
                        {report.operationalNotes.slice(0, 2).map((note) => (
                          <span key={`${report.id}-${note}`}>{note}</span>
                        ))}
                      </div>
                      {isVolunteer ? (
                        <div className="incident-mini-actions">
                          <button type="button" onClick={() => handleVolunteerAssessment(report.id, "Corroborated")}>
                            Mark Corroborated
                          </button>
                          <button type="button" onClick={() => handleVolunteerAssessment(report.id, "Needs Analyst Review")}>
                            Needs Analyst Review
                          </button>
                        </div>
                      ) : canModerate ? (
                        <div className="incident-mini-actions">
                          <button
                            type="button"
                            disabled={activeActionId === report.id}
                            onClick={() => handleAction(report.id, "verify")}
                          >
                            Verify
                          </button>
                          <button
                            type="button"
                            disabled={activeActionId === report.id}
                            onClick={() => handleAction(report.id, "escalate")}
                          >
                            Escalate
                          </button>
                          <button
                            type="button"
                            disabled={activeActionId === report.id}
                            onClick={() => handleAction(report.id, "reject")}
                          >
                            Reject
                          </button>
                        </div>
                      ) : null}
                      {isVolunteer && volunteerAssessments[report.id] ? (
                        <div className="volunteer-assessment-pill">{volunteerAssessments[report.id]}</div>
                      ) : null}
                    </div>
                  ))}
                </div>
              </article>
            ) : null}

            {(canModerate || isAdmin) ? (
              <article className="analyst-panel">
                <div className="panel-head">
                  <h4>Operational Incident Layer</h4>
                  <span>{officialLayer.length} verified / escalated / resolved</span>
                </div>
                <div className="analyst-feed">
                  {officialLayer.map((report) => (
                    <div key={report.id} className="analyst-incident-card compact">
                      <div className="analyst-incident-head">
                        <div>
                          <strong>{report.title}</strong>
                          <p>
                            {report.district} • {report.verificationStatus} • {report.status}
                          </p>
                        </div>
                        <span className={`incident-severity-pill severity-${(report.analystSeverity ?? report.severity).toLowerCase()}`}>
                          {report.analystSeverity ?? report.severity}
                        </span>
                      </div>
                      <div className="analyst-meta-row">
                        <span>{report.locality}</span>
                        <span>{formatOperationalDateTime(report.updatedAt)}</span>
                        {isAdmin ? <span>{report.sourceLabel}</span> : null}
                      </div>
                      {report.verificationStatus !== "Resolved" && canModerate ? (
                        <div className="incident-mini-actions">
                          <button
                            type="button"
                            disabled={activeActionId === report.id}
                            onClick={() => handleAction(report.id, "resolve")}
                          >
                            Mark Resolved
                          </button>
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              </article>
            ) : null}
          </section>

          {isAdmin ? (
            <section className="analyst-panel admin-audit-panel">
              <div className="panel-head">
                <h4>Administrative Visibility</h4>
                <span>Prototype oversight view</span>
              </div>
              <div className="analyst-feed">
                {filteredReports.slice(0, 4).map((report) => (
                  <div key={`admin-${report.id}`} className="analyst-incident-card compact">
                    <div className="analyst-incident-head">
                      <div>
                        <strong>{report.title}</strong>
                        <p>
                          Reporter: {report.reporterRole} • Source: {report.sourceLabel}
                        </p>
                      </div>
                      <span className="incident-severity-pill">
                        {report.trustedReporter ? "Trusted" : "Standard"}
                      </span>
                    </div>
                    <div className="analyst-meta-row">
                      <span>Verification: {report.verificationStatus}</span>
                      <span>Duplicate cluster: {report.duplicateClusterId ?? "None"}</span>
                      <span>{report.suspiciousActivity ? "Potential duplicate activity" : "No suspicious activity"}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ) : null}
        </>
      )}
    </div>
  );

  if (embedded) {
    return (
      <AnimatePresence initial={false}>
        {isOpen ? (
          <>
            <motion.div
              className="incident-review-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              onClick={onClose}
            />
            <div ref={constraintsRef} className="incident-review-stage">
              <motion.aside
                className="incident-review-panel"
                drag
                dragListener={false}
                dragControls={dragControls}
                dragConstraints={dragConstraints}
                dragMomentum={false}
                dragElastic={0.04}
                initial={{ opacity: 0, x: 24, y: 8 }}
                animate={{ opacity: 1, x: panelPosition.x, y: panelPosition.y }}
                exit={{ opacity: 0, x: 24, y: 8 }}
                transition={{
                  opacity: { duration: 0.22, ease: "easeOut" },
                  x: { type: "spring", stiffness: 260, damping: 28 },
                  y: { type: "spring", stiffness: 260, damping: 28 }
                }}
                onDragEnd={(_, info) => {
                  const nextPosition = {
                    x: panelPosition.x + info.offset.x,
                    y: panelPosition.y + info.offset.y
                  };
                  setPanelPosition(nextPosition);
                  if (typeof window !== "undefined") {
                    window.sessionStorage.setItem(REVIEW_PANEL_STORAGE_KEY, JSON.stringify(nextPosition));
                  }
                }}
              >
                <div
                  className="incident-review-handle"
                  onPointerDown={(event) => dragControls.start(event)}
                >
                  <span className="incident-review-grabber" />
                  <strong className="incident-review-title">Operational Review Workspace</strong>
                  <button
                    type="button"
                    className="incident-review-close"
                    onClick={onClose}
                    aria-label="Close operational review workspace"
                  >
                    ×
                  </button>
                </div>
                {content}
              </motion.aside>
            </div>
          </>
        ) : null}
      </AnimatePresence>
    );
  }

  return (
    <main className="page-shell">
      <section className="desktop-frame analyst-page-frame">
        {content}
      </section>
    </main>
  );
}
