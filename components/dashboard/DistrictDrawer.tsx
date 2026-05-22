"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useShallow } from "zustand/shallow";

import { useOperationalContext } from "@/lib/state/useOperationalContext";
import { formatPopulation, formatTimestamp } from "@/lib/utils";
import { useOperationalStore } from "@/lib/state/useOperationalStore";
import { IntelligenceNode } from "@/components/dashboard/IntelligenceNode";
export function DistrictDrawer() {
  const { isDrawerOpen, closeDrawer, minimizeDrawer, restoreOperationalContext, focusDistrict } =
    useOperationalStore(
      useShallow((state) => ({
        isDrawerOpen: state.isDrawerOpen,
        closeDrawer: state.closeDrawer,
        minimizeDrawer: state.minimizeDrawer,
        restoreOperationalContext: state.restoreOperationalContext,
        focusDistrict: state.focusDistrict
      }))
    );
  const { selection, activeDistrict, data } = useOperationalContext();
  const current = activeDistrict;

  return (
    <>
      <IntelligenceNode
        label={selection.selectedDistrict ?? "Basin"}
        hidden={isDrawerOpen}
        onActivate={() => restoreOperationalContext()}
      />

      <AnimatePresence initial={false}>
        {isDrawerOpen ? (
          <motion.aside
            className="district-drawer open"
            initial={{ x: 32, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 32, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <div className="drawer-head">
              <div>
                <p>District Intelligence</p>
                <h3>{current.district}</h3>
              </div>
              <div className="drawer-actions">
                <button type="button" className="drawer-close" onClick={minimizeDrawer}>
                  -
                </button>
                <button type="button" className="drawer-close" onClick={closeDrawer}>
                  ×
                </button>
              </div>
            </div>

            <div className="drawer-switcher">
              {data.districtIntelligence.map((district) => (
                <button
                  key={district.district}
                  type="button"
                  className={`drawer-chip ${district.district === current.district ? "active" : ""}`}
                  onClick={() => focusDistrict(district.district, "drawer")}
                >
                  {district.district}
                </button>
              ))}
            </div>

            <div className="drawer-sections">
              <section className="drawer-section">
                <span className="drawer-label">Operational status</span>
                <strong>{current.operationalStatus}</strong>
                <p>{current.floodRisk} • {current.confidence}% confidence</p>
              </section>

              <section className="drawer-section">
                <span className="drawer-label">Flood and weather</span>
                <p>Rainfall forecast: {current.rainfallForecastMm} mm</p>
                <p>River pressure: {current.riverPressure}</p>
                <p>Weather: {current.weatherCondition}</p>
              </section>

              <section className="drawer-section">
                <span className="drawer-label">Environmental intelligence</span>
                {current.activeAlerts.map((alert, index) => (
                  <p key={`${current.district}-alert-${index}`}>{alert}</p>
                ))}
                {current.biodiversityActivity.map((entry, index) => (
                  <p key={`${current.district}-bio-${index}`}>{entry}</p>
                ))}
              </section>

              <section className="drawer-section">
                <span className="drawer-label">Population and feeds</span>
                <p>Affected population: {formatPopulation(current.affectedPopulation)}</p>
                <p>AQI: {current.aqiLabel}</p>
                <p>{current.delayedFeed ? "Some feeds delayed" : "Feeds synchronized"}</p>
                <p>Updated: {formatTimestamp(current.lastUpdated)}</p>
              </section>
            </div>
          </motion.aside>
        ) : null}
      </AnimatePresence>
    </>
  );
}
