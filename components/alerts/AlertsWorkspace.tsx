"use client";

import { useMemo, useState } from "react";

import { ecosystemSignals, operationalWorkflow } from "@/data/mock";

type AlertCategory = "Flood" | "AQI" | "Biodiversity" | "Weather" | "River Health" | "Community" | "Emergency" | "Analyst";
type Severity = "Low" | "Moderate" | "High" | "Critical";

type AlertItem = {
  id: string;
  title: string;
  category: AlertCategory;
  severity: Severity;
  district: string;
  location: string;
  timestamp: string;
  updatedAgo: string;
  icon: string;
  summary: string;
  status: string[];
};

const filters = ["All", "Flood", "AQI", "Biodiversity", "River Health", "Community", "Emergency", "Analyst"] as const;
const districts = ["All districts", "Patna", "Munger", "Bhagalpur", "Hajipur", "Sahibganj"] as const;
const severities = ["All severity", "Low", "Moderate", "High", "Critical"] as const;

const liveAlerts: AlertItem[] = ecosystemSignals.slice(0, 10);

const heroNotices = [
  { label: "Current environmental status", value: "Watch active", severity: "Moderate", district: "Ganga basin", updated: "updated 4 minutes ago" },
  { label: "Regional flood advisory", value: "Munger lowlands", severity: "High", district: "Munger", updated: "updated 4 minutes ago" },
  { label: "AQI advisory", value: "Sensitive groups caution", severity: "Moderate", district: "Patna", updated: "updated 11 minutes ago" },
  { label: "Rainfall warning", value: "Evening cell building", severity: "High", district: "Patna-Munger", updated: "updated 1 hour ago" },
  { label: "Active environmental notices", value: `${liveAlerts.length} monitored items`, severity: "Low", district: "Basin network", updated: "live sync" }
];

const reports = [
  { title: "Analyst advisory: drainage pressure rising", image: "/land-1.png", source: "Analyst advisory", district: "Munger", time: "3:30 PM", badge: "Verified", summary: "Flood model review links rainfall escalation with narrow drainage lanes in Munger lowlands." },
  { title: "Community report: fresh erosion marks", image: "/WETLAND-BIRDS.png", source: "Community report", district: "Hajipur", time: "2:54 PM", badge: "Field checked", summary: "Ward observer photos confirm slumping near Konhara wetland after afternoon ferry movement." },
  { title: "Restoration update: reed cover stabilizing", image: "/GRD.png", source: "Restoration update", district: "Vikramshila", time: "12:45 PM", badge: "Verified", summary: "Habitat team reports reduced trampling near the protected channel buffer." },
  { title: "Government notice: rainfall preparedness", image: "/SC.png", source: "Government notice", district: "Patna", time: "11:20 AM", badge: "Official", summary: "District control room requests close watch on low-lying riverfront neighborhoods." }
];

const timeline = [
  ["9:18 AM", operationalWorkflow[0], "Patna sewage intake logged from Gandhi Ghat citizen channel."],
  ["9:42 AM", operationalWorkflow[1], "Analyst requests ward observer verification and water quality strip."],
  ["10:05 AM", operationalWorkflow[2], "Bhagalpur biodiversity report waits for habitat patrol confirmation."],
  ["1:50 PM", operationalWorkflow[3], "Pollution alert links Gandhi Ghat outfall and river-health feed."],
  ["2:26 PM", operationalWorkflow[4], "Munger floodplain watch updates map overlay and district drawer."],
  ["2:40 PM", operationalWorkflow[5], "Community readiness message sent to Munger lowland volunteers."]
];

function severityClass(severity: Severity | string) {
  return `severity-${severity.toLowerCase()}`;
}

export function AlertsWorkspace() {
  const [activeFilter, setActiveFilter] = useState<(typeof filters)[number]>("All");
  const [district, setDistrict] = useState<(typeof districts)[number]>("All districts");
  const [severity, setSeverity] = useState<(typeof severities)[number]>("All severity");
  const [query, setQuery] = useState("");

  const filteredAlerts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return liveAlerts.filter((alert) => {
      const matchesFilter = activeFilter === "All" || alert.category === activeFilter;
      const matchesDistrict = district === "All districts" || alert.district === district || alert.location.includes(district);
      const matchesSeverity = severity === "All severity" || alert.severity === severity;
      const matchesQuery =
        !normalizedQuery ||
        `${alert.title} ${alert.summary} ${alert.district} ${alert.category}`.toLowerCase().includes(normalizedQuery);
      return matchesFilter && matchesDistrict && matchesSeverity && matchesQuery;
    });
  }, [activeFilter, district, query, severity]);

  return (
    <section className="alerts-workspace">
      <section className="alerts-hero">
        <div className="alerts-hero-copy">
          <span className="alerts-eyebrow"><i /> Live environmental command bulletin</span>
          <h1>Alerts & News</h1>
          <p>Operational alerts, verified field reports, and ecological advisories across Patna, Munger, Bhagalpur, Hajipur, and the Ganga basin.</p>
          <div className="alerts-location-row">
            {["Patna", "Munger", "Bhagalpur", "Hajipur", "Vikramshila"].map((item, index) => <span key={`${item}-${index}`}>{item}</span>)}
          </div>
        </div>
        <div className="alerts-hero-grid">
          {heroNotices.map((notice) => (
            <article className={`alerts-hero-notice ${severityClass(notice.severity)}`} key={notice.label}>
              <span>{notice.label}</span>
              <strong>{notice.value}</strong>
              <div><em>{notice.severity}</em><small>{notice.district}</small></div>
              <p>{notice.updated}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="alerts-toolbar">
        <div className="alerts-filter-row">
          {filters.map((filter) => (
            <button
              className={activeFilter === filter ? "active" : ""}
              key={filter}
              onClick={() => setActiveFilter(filter)}
              suppressHydrationWarning
              type="button"
            >
              {filter}
            </button>
          ))}
        </div>
        <div className="alerts-control-row">
          <label>
            <span>Search</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search alerts, districts, advisories"
              suppressHydrationWarning
            />
          </label>
          <label>
            <span>District</span>
            <select
              value={district}
              onChange={(event) => setDistrict(event.target.value as (typeof districts)[number])}
              suppressHydrationWarning
            >
              {districts.map((item, index) => <option key={`${item}-${index}`}>{item}</option>)}
            </select>
          </label>
          <label>
            <span>Severity</span>
            <select
              value={severity}
              onChange={(event) => setSeverity(event.target.value as (typeof severities)[number])}
              suppressHydrationWarning
            >
              {severities.map((item, index) => <option key={`${item}-${index}`}>{item}</option>)}
            </select>
          </label>
        </div>
      </section>

      <section className="alerts-grid">
        <div className="alerts-main-column">
          <article className="alerts-panel">
            <div className="alerts-panel-head">
              <div><span>Live alert feed</span><h2>{filteredAlerts.length} operational signals</h2></div>
              <p><i /> streaming from field, weather, river, and analyst channels</p>
            </div>
            <div className="alerts-feed" role="feed">
              {filteredAlerts.map((alert) => (
                <article className={`alert-feed-card ${severityClass(alert.severity)}`} key={alert.id}>
                  <div className="alert-feed-icon">{alert.icon}</div>
                  <div className="alert-feed-body">
                    <div className="alert-feed-top">
                      <span>{alert.category}</span>
                      <em>{alert.severity}</em>
                    </div>
                    <h3>{alert.title}</h3>
                    <p>{alert.summary}</p>
                    <div className="alert-feed-meta">
                      <span>{alert.district}</span><span>{alert.location}</span><span>{alert.timestamp}</span><span>{alert.updatedAgo}</span>
                    </div>
                    <div className="alert-status-row">
                      {alert.status.map((item, index) => <span key={`${item}-${index}`}>{item}</span>)}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </article>

          <article className="alerts-panel">
            <div className="alerts-panel-head">
              <div><span>Verified news & field reports</span><h2>Analyst-cleared updates</h2></div>
              <p>Compact, source-tagged bulletins from trusted operations channels.</p>
            </div>
            <div className="alerts-report-grid">
              {reports.map((report) => (
                <article className="alerts-report-card" key={report.title}>
                  <div className="alerts-report-image" style={{ backgroundImage: `url(${report.image})` }} />
                  <div>
                    <div className="alerts-report-top"><span>{report.source}</span><em>{report.badge}</em></div>
                    <strong>{report.title}</strong>
                    <p>{report.summary}</p>
                    <div className="alerts-report-meta"><span>{report.district}</span><span>{report.time}</span></div>
                  </div>
                </article>
              ))}
            </div>
          </article>

          <article className="alerts-panel alerts-timeline-panel">
            <div className="alerts-panel-head">
              <div><span>Environmental timeline</span><h2>Command log</h2></div>
              <p>Linked sequence behind the current advisory state.</p>
            </div>
            <div className="alerts-timeline">
              {timeline.map(([time, title, detail]) => (
                <div className="alerts-timeline-item" key={`${time}-${title}`}>
                  <time>{time}</time>
                  <i />
                  <div><strong>{title}</strong><p>{detail}</p></div>
                </div>
              ))}
            </div>
          </article>
        </div>

        <aside className="alerts-side-panel">
          <div className="alerts-side-head"><span>Operations pulse</span><strong>Live</strong></div>
          {[
            ["Active alerts", "8", "+2 last hour"],
            ["Districts affected", "4", "Patna, Munger, Bhagalpur, Hajipur"],
            ["Volunteer readiness", "82%", "Munger team mobilized"],
            ["Analyst activity", "14 reviews", "5 awaiting second check"],
            ["Latest escalation", "Flood warning", "Munger at 3:42 PM"],
            ["Environmental confidence", "91%", "multi-source verified"]
          ].map(([label, value, detail], index) => (
            <div className="alerts-side-metric" key={`${label}-${index}`}>
              <span>{label}</span>
              <strong>{value}</strong>
              <p>{detail}</p>
            </div>
          ))}
          <div className="alerts-confidence">
            <span>Confidence indicator</span>
            <div><i style={{ width: "91%" }} /></div>
            <p>Weather, hydrology, field photos, and analyst checks aligned.</p>
          </div>
        </aside>
      </section>
    </section>
  );
}
