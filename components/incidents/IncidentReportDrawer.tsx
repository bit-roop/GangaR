"use client";

import { ChangeEvent, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useShallow } from "zustand/shallow";

import { IncidentLocationPicker } from "@/components/incidents/IncidentLocationPicker";
import { useDashboardData } from "@/components/dashboard/DashboardDataProvider";
import { ApiError } from "@/lib/api/client";
import { getSubmissionFailureMessage } from "@/lib/feedback/operationalMessages";
import { useOperationalContext } from "@/lib/state/useOperationalContext";
import { useUiFeedbackStore } from "@/lib/state/useUiFeedbackStore";
import { useOperationalStore } from "@/lib/state/useOperationalStore";
import { submitIncidentReport, uploadIncidentEvidence } from "@/services/incidentService";

type IncidentReportDrawerProps = {
  hasHydratedIncidentFeed?: boolean;
};

function formatLocationLabel(district: string, latitude: string, longitude: string) {
  if (!latitude || !longitude) return `${district} reporting point`;
  return `${district} river-edge point`;
}

function buildIncidentTitle(category: string, district: string) {
  return `${category} reported in ${district}`;
}

export function IncidentReportDrawer({ hasHydratedIncidentFeed = true }: IncidentReportDrawerProps) {
  const data = useDashboardData();
  const { activeDistrictName, activeRole } = useOperationalContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locationMessage, setLocationMessage] = useState<string | null>(null);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [isUploadingEvidence, setIsUploadingEvidence] = useState(false);
  const pushToast = useUiFeedbackStore((state) => state.pushToast);
  const {
    isIncidentDrawerOpen,
    incidentDraft,
    closeIncidentDrawer,
    updateIncidentDraft,
    resetIncidentDraft,
    addIncidentReport,
    openIncidentReviewPanel
  } = useOperationalStore(
    useShallow((state) => ({
      isIncidentDrawerOpen: state.isIncidentDrawerOpen,
      incidentDraft: state.incidentDraft,
      closeIncidentDrawer: state.closeIncidentDrawer,
      updateIncidentDraft: state.updateIncidentDraft,
      resetIncidentDraft: state.resetIncidentDraft,
      addIncidentReport: state.addIncidentReport,
      openIncidentReviewPanel: state.openIncidentReviewPanel
    }))
  );

  const districtOptions = useMemo(
    () => data.districtIntelligence.map((item) => item.district),
    [data.districtIntelligence]
  );

  const districtPoints = useMemo(
    () =>
      data.floodPanel.map.districtLabels.map((label) => ({
        district: label.name,
        latitude: label.latitude,
        longitude: label.longitude
      })),
    [data.floodPanel.map.districtLabels]
  );

  const selectedDistrict = incidentDraft.district || activeDistrictName;

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;

    setIsUploadingEvidence(true);
    setSubmissionError(null);

    try {
      const nextEvidence = await Promise.all(files.map((file) => uploadIncidentEvidence(file)));
      updateIncidentDraft({ evidence: [...incidentDraft.evidence, ...nextEvidence] });
      pushToast({
        tone: "success",
        title: "Evidence uploaded",
        detail: "Media has been attached to the incident draft."
      });
    } catch (error) {
      const message = getSubmissionFailureMessage(error);
      setSubmissionError(message.detail);
      pushToast({
        tone: "error",
        title: message.title,
        detail: message.detail
      });
    } finally {
      setIsUploadingEvidence(false);
      event.target.value = "";
    }
  };

  const handleLocationSelect = (latitude: number, longitude: number) => {
    updateIncidentDraft({
      latitude: latitude.toFixed(6),
      longitude: longitude.toFixed(6),
      locality: formatLocationLabel(selectedDistrict, latitude.toFixed(6), longitude.toFixed(6))
    });
    setLocationMessage("Location pinned for environmental review.");
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationMessage("Current location is not available on this device. Tap the map to place the report.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        handleLocationSelect(position.coords.latitude, position.coords.longitude);
        setLocationMessage("Current location captured for the report.");
      },
      () => {
        setLocationMessage("Location permission was not granted. Tap the map to place the report manually.");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000
      }
    );
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmissionError(null);

    try {
      const district = incidentDraft.district || activeDistrictName;
      const report = await submitIncidentReport({
        ...incidentDraft,
        title: buildIncidentTitle(incidentDraft.category, district),
        district,
        locality: incidentDraft.locality || formatLocationLabel(district, incidentDraft.latitude, incidentDraft.longitude),
        latitude: incidentDraft.latitude || districtPoints.find((point) => point.district === district)?.latitude.toFixed(6) || "25.594100",
        longitude: incidentDraft.longitude || districtPoints.find((point) => point.district === district)?.longitude.toFixed(6) || "85.137600"
      });

      addIncidentReport(report);
      resetIncidentDraft();
      closeIncidentDrawer();
      setLocationMessage(null);
      setSubmissionError(null);
      pushToast({
        tone: "success",
        title: "Report submitted",
        detail: "The environmental incident has entered the verification queue."
      });
    } catch (error) {
      if (error instanceof ApiError) {
        const diagnostics = [
          error.message,
          error.status ? `Status: ${error.status}` : null,
          error.url ? `Endpoint: ${error.url}` : null,
          error.details ? `Details: ${error.details}` : null
        ]
          .filter(Boolean)
          .join(" ");

        const message = getSubmissionFailureMessage(new Error(diagnostics));
        setSubmissionError(message.detail);
        pushToast({
          tone: "error",
          title: message.title,
          detail: message.detail
        });
        console.error("Incident submission failed", {
          code: error.code,
          status: error.status,
          url: error.url,
          details: error.details
        });
      } else {
        const message = getSubmissionFailureMessage(error);
        setSubmissionError(message.detail);
        pushToast({
          tone: "error",
          title: message.title,
          detail: message.detail
        });
        console.error("Incident submission failed", error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence initial={false}>
      {isIncidentDrawerOpen ? (
        <motion.aside
          className="incident-drawer citizen-drawer"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          <div className="incident-drawer-head">
            <div>
              <p>Citizen Environmental Report</p>
              <h3>Report what you see along the river system</h3>
            </div>
            <button type="button" className="drawer-close" onClick={closeIncidentDrawer}>
              ×
            </button>
          </div>

          <div className="incident-guidance-banner">
            <strong>Public reporting is kept lightweight.</strong>
            <span>Choose the issue, place it on the map, and submit it for environmental review.</span>
          </div>

          <div className="incident-form-grid citizen-form-grid">
            <label>
              <span>Incident category</span>
              <select
                value={incidentDraft.category}
                onChange={(event) => updateIncidentDraft({ category: event.target.value as typeof incidentDraft.category })}
              >
                {data.incidentCategories.map((category) => (
                  <option key={category.category} value={category.category}>
                    {category.category}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>Severity</span>
              <select
                value={incidentDraft.severity}
                onChange={(event) => updateIncidentDraft({ severity: event.target.value as typeof incidentDraft.severity })}
              >
                <option value="Low">Low</option>
                <option value="Moderate">Moderate</option>
                <option value="Severe">Severe</option>
              </select>
            </label>
            <label className="span-2">
              <span>District</span>
              <select
                value={selectedDistrict}
                onChange={(event) => {
                  const district = event.target.value;
                  updateIncidentDraft({
                    district,
                    latitude: "",
                    longitude: "",
                    locality: `${district} reporting point`
                  });
                  setLocationMessage("District focus moved. Tap the map to refine the reporting point.");
                }}
              >
                {districtOptions.map((district) => (
                  <option key={district} value={district}>
                    {district}
                  </option>
                ))}
              </select>
            </label>
            <label className="span-2">
              <span>Short description</span>
              <textarea
                value={incidentDraft.description}
                onChange={(event) => updateIncidentDraft({ description: event.target.value })}
                placeholder="Briefly describe what you observed and the visible impact."
                rows={4}
              />
            </label>
            <label className="span-2 upload-field">
              <span>Photo evidence</span>
              <input type="file" accept="image/*" multiple onChange={handleFileChange} />
              <small>
                {isUploadingEvidence
                  ? "Uploading evidence to the incident service..."
                  : "Photos help field teams confirm pollution, flooding, wildlife threats, or riverbank damage."}
              </small>
            </label>
          </div>

          <IncidentLocationPicker
            districtPoints={districtPoints}
            selectedDistrict={selectedDistrict}
            latitude={incidentDraft.latitude}
            longitude={incidentDraft.longitude}
            onSelect={handleLocationSelect}
            onUseCurrentLocation={handleUseCurrentLocation}
          />

          {locationMessage ? (
            <div className="incident-warning subtle">
              <strong>Location update</strong>
              <span>{locationMessage}</span>
            </div>
          ) : null}

          {!hasHydratedIncidentFeed ? (
            <div className="incident-warning subtle">
              <strong>Syncing field intake</strong>
              <span>The reporting queue is connecting to the operational incident service.</span>
            </div>
          ) : null}

          {submissionError ? (
            <div className="incident-warning">
              <strong>Submission failed</strong>
              <span>{submissionError}</span>
            </div>
          ) : null}

          {incidentDraft.evidence.length ? (
            <div className="incident-evidence-strip">
              {incidentDraft.evidence.map((item) => (
                <div key={item.id} className="incident-evidence-card">
                  <div className="incident-evidence-thumb" style={{ backgroundImage: `url(${item.previewUrl})` }} />
                  <div>
                    <strong>{item.name}</strong>
                    <span>{item.sizeKb} KB</span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      updateIncidentDraft({
                        evidence: incidentDraft.evidence.filter((entry) => entry.id !== item.id)
                      })
                    }
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          ) : null}

          {activeRole !== "Citizen" ? (
            <div className="incident-internal-link">
              <div>
                <span className="incident-section-label">Internal workflow</span>
                <strong>Moderation and escalation stay in the analyst panel</strong>
              </div>
              <button
                type="button"
                className="incident-inline-link"
                onClick={() => {
                  closeIncidentDrawer();
                  openIncidentReviewPanel();
                }}
              >
                Open operations review
              </button>
            </div>
          ) : null}

          <div className="incident-actions">
            <button
              type="button"
              className="incident-secondary"
              onClick={() => {
                resetIncidentDraft();
                closeIncidentDrawer();
                setLocationMessage(null);
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              className="incident-primary"
              onClick={handleSubmit}
              disabled={isSubmitting || isUploadingEvidence || !incidentDraft.description}
            >
              {isSubmitting ? "Submitting..." : "Submit Report"}
            </button>
          </div>
        </motion.aside>
      ) : null}
    </AnimatePresence>
  );
}
