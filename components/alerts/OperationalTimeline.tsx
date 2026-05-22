"use client";
import { motion } from "framer-motion";
import { useShallow } from "zustand/shallow";

import { useOperationalContext } from "@/lib/state/useOperationalContext";
import { useOperationalStore } from "@/lib/state/useOperationalStore";
import { OperationalEmptyState } from "@/components/ui/OperationalState";
import type { TimelineEvent } from "@/types/dashboard";

type OperationalTimelineProps = { events: TimelineEvent[] };

export function OperationalTimeline({ events: _events }: OperationalTimelineProps) {
  const { filteredTimeline, activeTimelineContext } = useOperationalContext();
  const { timelineFilter, setTimelineFilter, focusDistrict } = useOperationalStore(
    useShallow((state) => ({
      timelineFilter: state.timelineFilter,
      setTimelineFilter: state.setTimelineFilter,
      focusDistrict: state.focusDistrict
    }))
  );

  return (
    <article className="panel timeline-panel">
      <div className="panel-head">
        <h4>Operational Timeline</h4>
        <span>{activeTimelineContext === "district" ? "Live feed" : `${activeTimelineContext} context`}</span>
      </div>
      <div className="timeline-filters">
        {[
          ["all", "All"],
          ["flood", "Flood"],
          ["biodiversity", "Biodiversity"],
          ["sewage", "Sewage"],
          ["district", "District"]
        ].map(([key, label]) => (
          <button
            key={key}
            type="button"
            className={`timeline-filter ${timelineFilter === key ? "active" : ""}`}
            onClick={() => setTimelineFilter(key as Parameters<typeof setTimelineFilter>[0])}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="timeline-list">
        {!filteredTimeline.length ? (
          <OperationalEmptyState
            compact
            title="No alerts in this view"
            detail="There are no active operational alerts for the current context or timeline filter."
          />
        ) : null}
        {filteredTimeline.map((event) => (
          <motion.button
            key={event.id}
            type="button"
            className="timeline-item"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            onClick={() => focusDistrict(event.district, "timeline")}
          >
            <span className={`timeline-dot ${event.category}`} />
            <div className="timeline-copy">
              <div className="timeline-head">
                <strong>{event.title}</strong>
                <span>{event.timestamp}</span>
              </div>
              <p>{event.detail}</p>
              <div className="timeline-meta">
                <span>{event.district}</span>
                <span>{event.status}</span>
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </article>
  );
}
