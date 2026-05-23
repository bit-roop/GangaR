"use client";

import { memo, useCallback, useEffect, useMemo, useState } from "react";

import { useOperationalStore } from "@/lib/state/useOperationalStore";
import type { SimulationRole } from "@/types/dashboard";

type ToggleKey =
  | "floodAlerts"
  | "aqiAlerts"
  | "biodiversityUpdates"
  | "analystAdvisories"
  | "volunteerMobilization"
  | "restorationUpdates"
  | "misinformationWarnings"
  | "floodOverlay"
  | "biodiversityOverlay"
  | "liveTelemetry"
  | "reducedMotion"
  | "highContrast"
  | "compactLayout"
  | "verifiedFirst"
  | "scientificInsights"
  | "localKnowledge"
  | "hideLowConfidence"
  | "compactDiscussion";

type ToggleItem = {
  key: ToggleKey;
  label: string;
  helper: string;
};

const districts = ["Patna", "Bhagalpur", "Munger", "Hajipur", "Varanasi"];
const interests = ["River health", "Flood resilience", "Dolphin habitats", "Wetland restoration"];
const mapLayers = ["Operational risk", "River health", "Biodiversity", "Community reports"];
const textScaleOptions = ["Compact", "Standard", "Large"];

const notificationItems: ToggleItem[] = [
  { key: "floodAlerts", label: "Flood alerts", helper: "Escalation and district watch signals" },
  { key: "aqiAlerts", label: "AQI alerts", helper: "Air quality changes near monitored ghats" },
  { key: "biodiversityUpdates", label: "Biodiversity updates", helper: "Species and habitat movement" },
  { key: "analystAdvisories", label: "Analyst advisories", helper: "Review-ready operational notes" },
  { key: "volunteerMobilization", label: "Volunteer mobilization", helper: "Local campaign coordination" },
  { key: "restorationUpdates", label: "Restoration updates", helper: "Wetland and riverbank progress" },
  { key: "misinformationWarnings", label: "Misinformation warnings", helper: "Low-trust claims and rumor signals" }
];

const communityItems: ToggleItem[] = [
  { key: "verifiedFirst", label: "Show verified content first", helper: "Prioritize reviewed reports" },
  { key: "scientificInsights", label: "Prioritize scientific insights", helper: "Surface lab and analyst context" },
  { key: "localKnowledge", label: "Prioritize local knowledge", helper: "Respect field and community memory" },
  { key: "hideLowConfidence", label: "Hide low-confidence reports", helper: "Reduce noisy intake items" },
  { key: "compactDiscussion", label: "Compact discussion mode", helper: "Tighter reading layout" }
];

const roles: Array<{
  role: SimulationRole;
  icon: string;
  description: string;
  permissions: string[];
}> = [
  {
    role: "Citizen",
    icon: "◌",
    description: "Report issues and follow trusted updates.",
    permissions: ["Submit reports", "View alerts", "Join campaigns"]
  },
  {
    role: "Analyst",
    icon: "◍",
    description: "Review signals and prepare advisories.",
    permissions: ["Verify reports", "Compare feeds", "Draft advisories"]
  },
  {
    role: "Admin",
    icon: "◎",
    description: "Coordinate operational visibility.",
    permissions: ["Manage roles", "Sync status", "Publish updates"]
  }
];

const systemStatuses = [
  { label: "API connectivity", value: "Online", tone: "good" },
  { label: "AQI feed", value: "Synced", tone: "good" },
  { label: "Weather telemetry", value: "4 min", tone: "watch" },
  { label: "Map services", value: "Stable", tone: "good" },
  { label: "Backend sync", value: "Queued", tone: "watch" }
];

const ToggleCard = memo(function ToggleCard({
  item,
  checked,
  onToggle
}: {
  item: ToggleItem;
  checked: boolean;
  onToggle: (key: ToggleKey) => void;
}) {
  return (
    <button
      type="button"
      className={`settings-toggle-card ${checked ? "active" : ""}`}
      onClick={() => onToggle(item.key)}
      aria-pressed={checked}
      suppressHydrationWarning
    >
      <span>
        <strong>{item.label}</strong>
        <small>{item.helper}</small>
      </span>
      <i aria-hidden="true" />
    </button>
  );
});

export function SettingsWorkspace() {
  const activeRole = useOperationalStore((state) => state.activeRole);
  const setActiveRole = useOperationalStore((state) => state.setActiveRole);
  const safeRole = roles.some((item) => item.role === activeRole) ? activeRole : "Citizen";
  const [hasMounted, setHasMounted] = useState(false);

  const [profile, setProfile] = useState({
    name: "Ananya Prakash",
    bio: "Community river health contributor tracking ghat cleanliness, AQI shifts, and seasonal wetland signals.",
    district: "Patna",
    interest: "River health"
  });
  const [mapDistrict, setMapDistrict] = useState("Patna");
  const [mapLayer, setMapLayer] = useState("Operational risk");
  const [textScale, setTextScale] = useState("Standard");
  const [toggles, setToggles] = useState<Record<ToggleKey, boolean>>({
    floodAlerts: true,
    aqiAlerts: true,
    biodiversityUpdates: true,
    analystAdvisories: true,
    volunteerMobilization: false,
    restorationUpdates: true,
    misinformationWarnings: true,
    floodOverlay: true,
    biodiversityOverlay: true,
    liveTelemetry: true,
    reducedMotion: false,
    highContrast: false,
    compactLayout: true,
    verifiedFirst: true,
    scientificInsights: true,
    localKnowledge: true,
    hideLowConfidence: true,
    compactDiscussion: false
  });

  const activeNotificationCount = useMemo(
    () => notificationItems.filter((item) => toggles[item.key]).length,
    [toggles]
  );

  const toggleSetting = useCallback((key: ToggleKey) => {
    setToggles((current) => ({ ...current, [key]: !current[key] }));
  }, []);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const displayRole = hasMounted ? safeRole : "Citizen";

  return (
    <div className="settings-workspace">
      <section className="settings-hero">
        <div>
          <span className="settings-eyebrow">
            <i aria-hidden="true" />
            Settings
          </span>
          <h1>Operational preferences</h1>
          <p>Identity, alerts, role simulation, map layers, and community defaults for GangaRakshak AI.</p>
        </div>
        <div className="settings-hero-metrics" aria-label="Settings summary">
          <span>
            <strong>{displayRole}</strong>
            Simulation role
          </span>
          <span>
            <strong>{activeNotificationCount}/7</strong>
            Alerts enabled
          </span>
          <span>
            <strong>{mapDistrict}</strong>
            Preferred district
          </span>
        </div>
      </section>

      <section className="settings-grid">
        <article className="settings-card settings-profile-card">
          <div className="settings-card-head">
            <div>
              <span>Profile</span>
              <h2>Contributor identity</h2>
            </div>
            <em>Field verified</em>
          </div>
          <div className="settings-profile-summary">
            <div className="settings-profile-avatar" aria-hidden="true">
              AP
            </div>
            <div>
              <strong>{profile.name}</strong>
              <span>River Health Analyst</span>
              <p>{profile.district} district · Community contributor</p>
            </div>
          </div>
          <div className="settings-form-grid">
            <label>
              <span>Name</span>
              <input
                value={profile.name}
                onChange={(event) => setProfile((current) => ({ ...current, name: event.target.value }))}
                suppressHydrationWarning
              />
            </label>
            <label>
              <span>District</span>
              <select
                value={profile.district}
                onChange={(event) => setProfile((current) => ({ ...current, district: event.target.value }))}
                suppressHydrationWarning
              >
                {districts.map((district) => (
                  <option key={district}>{district}</option>
                ))}
              </select>
            </label>
            <label className="settings-wide-field">
              <span>Bio</span>
              <textarea
                value={profile.bio}
                onChange={(event) => setProfile((current) => ({ ...current, bio: event.target.value }))}
                rows={3}
                suppressHydrationWarning
              />
            </label>
            <label className="settings-wide-field">
              <span>Preferred environmental interest</span>
              <select
                value={profile.interest}
                onChange={(event) => setProfile((current) => ({ ...current, interest: event.target.value }))}
                suppressHydrationWarning
              >
                {interests.map((interest) => (
                  <option key={interest}>{interest}</option>
                ))}
              </select>
            </label>
          </div>
        </article>

        <article className="settings-card settings-status-card">
          <div className="settings-card-head">
            <div>
              <span>System</span>
              <h2>Live status</h2>
            </div>
            <em>Ops</em>
          </div>
          <div className="settings-status-list">
            {systemStatuses.map((status) => (
              <div key={status.label} className="settings-status-row">
                <span>
                  <i className={`settings-pulse ${status.tone}`} aria-hidden="true" />
                  {status.label}
                </span>
                <strong>{status.value}</strong>
              </div>
            ))}
          </div>
        </article>

        <article className="settings-card settings-wide-card">
          <div className="settings-card-head">
            <div>
              <span>Notifications</span>
              <h2>Alert preferences</h2>
            </div>
            <em>{activeNotificationCount} active</em>
          </div>
          <div className="settings-toggle-grid">
            {notificationItems.map((item) => (
              <ToggleCard key={item.key} item={item} checked={toggles[item.key]} onToggle={toggleSetting} />
            ))}
          </div>
        </article>

        <article className="settings-card settings-wide-card">
          <div className="settings-card-head">
            <div>
              <span>Simulation</span>
              <h2>Role mode</h2>
            </div>
            <em>{displayRole}</em>
          </div>
          <div className="settings-role-grid">
            {roles.map((item) => (
              <button
                key={item.role}
                type="button"
                className={`settings-role-card ${displayRole === item.role ? "active" : ""}`}
                onClick={() => setActiveRole(item.role)}
                aria-pressed={displayRole === item.role}
                suppressHydrationWarning
              >
                <span className="settings-role-icon" aria-hidden="true">
                  {item.icon}
                </span>
                <span>
                  <strong>{item.role}</strong>
                  <small>{item.description}</small>
                </span>
                <em>{item.permissions.join(" · ")}</em>
              </button>
            ))}
          </div>
        </article>

        <article className="settings-card">
          <div className="settings-card-head">
            <div>
              <span>Map</span>
              <h2>Location layers</h2>
            </div>
          </div>
          <div className="settings-compact-form">
            <label>
              <span>Preferred district</span>
              <select value={mapDistrict} onChange={(event) => setMapDistrict(event.target.value)} suppressHydrationWarning>
                {districts.map((district) => (
                  <option key={district}>{district}</option>
                ))}
              </select>
            </label>
            <label>
              <span>Default layer</span>
              <select value={mapLayer} onChange={(event) => setMapLayer(event.target.value)} suppressHydrationWarning>
                {mapLayers.map((layer) => (
                  <option key={layer}>{layer}</option>
                ))}
              </select>
            </label>
            {[
              { key: "floodOverlay" as const, label: "Flood overlay" },
              { key: "biodiversityOverlay" as const, label: "Biodiversity overlay" },
              { key: "liveTelemetry" as const, label: "Live telemetry" }
            ].map((item) => (
              <ToggleCard key={item.key} item={{ key: item.key, label: item.label, helper: "Map preference" }} checked={toggles[item.key]} onToggle={toggleSetting} />
            ))}
          </div>
        </article>

        <article className="settings-card">
          <div className="settings-card-head">
            <div>
              <span>Accessibility</span>
              <h2>Reading comfort</h2>
            </div>
          </div>
          <div className="settings-segmented" role="group" aria-label="Text scaling">
            {textScaleOptions.map((option) => (
              <button
                key={option}
                type="button"
                className={textScale === option ? "active" : ""}
                onClick={() => setTextScale(option)}
                suppressHydrationWarning
              >
                {option}
              </button>
            ))}
          </div>
          <div className="settings-compact-form">
            {[
              { key: "reducedMotion" as const, label: "Reduced motion" },
              { key: "highContrast" as const, label: "High contrast mode" },
              { key: "compactLayout" as const, label: "Compact layout mode" }
            ].map((item) => (
              <ToggleCard key={item.key} item={{ key: item.key, label: item.label, helper: "Interface preference" }} checked={toggles[item.key]} onToggle={toggleSetting} />
            ))}
          </div>
        </article>

        <article className="settings-card settings-wide-card">
          <div className="settings-card-head">
            <div>
              <span>Community</span>
              <h2>Discussion defaults</h2>
            </div>
          </div>
          <div className="settings-toggle-grid compact">
            {communityItems.map((item) => (
              <ToggleCard key={item.key} item={item} checked={toggles[item.key]} onToggle={toggleSetting} />
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
