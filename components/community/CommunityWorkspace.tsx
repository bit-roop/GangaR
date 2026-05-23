"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

import type { CommunityActivity, CommunityRegion } from "@/components/community/types";
import { KnowledgeExchange } from "@/components/knowledge/KnowledgeExchange";

const CommunityMap = dynamic(
  () => import("@/components/community/CommunityMap").then((module) => module.CommunityMap),
  {
    ssr: false,
    loading: () => <div className="community-map-loading">Loading community participation map...</div>
  }
);

const regions: CommunityRegion[] = [
  {
    id: "patna",
    name: "Gandhi Ghat cleanup circle",
    district: "Patna",
    coordinates: [25.6174, 85.164],
    tone: "cleanup",
    participants: 126,
    summary: "Plastic removal and flood awareness volunteers active along the ghat edge."
  },
  {
    id: "bhagalpur",
    name: "Vikramshila observer network",
    district: "Bhagalpur",
    coordinates: [25.2462, 86.9824],
    tone: "biodiversity",
    participants: 88,
    summary: "Verified dolphin and riverbank observations from boat community members."
  },
  {
    id: "hajipur",
    name: "Konhara restoration watch",
    district: "Hajipur",
    coordinates: [25.69, 85.21],
    tone: "watch",
    participants: 54,
    summary: "Ward observers tracking outfall pressure and wetland edge recovery."
  },
  {
    id: "munger",
    name: "Munger preparedness group",
    district: "Munger",
    coordinates: [25.37, 86.47],
    tone: "flood",
    participants: 72,
    summary: "Local flood readiness circles sharing safe-route and rainfall updates."
  }
];

const activities: CommunityActivity[] = [
  {
    id: "cleanup-patna",
    type: "Cleanup drive",
    role: "Volunteer team",
    district: "Patna",
    location: "Gandhi Ghat",
    time: "Today, 8:20 AM",
    summary: "Removed plastic waste from two river steps before morning footfall.",
    status: "Verified",
    image: "/land-1.png"
  },
  {
    id: "dolphin-bhagalpur",
    type: "Biodiversity sighting",
    role: "Boat observer",
    district: "Bhagalpur",
    location: "Vikramshila stretch",
    time: "Today, 7:45 AM",
    summary: "Two dolphin surfacing events logged in a low-disturbance channel.",
    status: "Verified",
    image: "/GRD.png"
  },
  {
    id: "flood-munger",
    type: "Flood awareness",
    role: "District champion",
    district: "Munger",
    location: "Lowland ward cluster",
    time: "Yesterday, 5:10 PM",
    summary: "Shared preparedness checklist with households near seasonal water paths.",
    status: "In progress"
  },
  {
    id: "wetland-hajipur",
    type: "Restoration activity",
    role: "Ward observer",
    district: "Hajipur",
    location: "Konhara wetland edge",
    time: "Yesterday, 10:30 AM",
    summary: "Reed cover recovery photographed after local cleanup coordination.",
    status: "Community verified",
    image: "/WETLAND-BIRDS.png"
  }
];

const campaigns = [
  {
    title: "River Cleanup Sunday",
    district: "Patna",
    status: "Open",
    participants: 184,
    image: "/land-1.png",
    action: "Join drive"
  },
  {
    title: "Wetland Restoration Circle",
    district: "Hajipur",
    status: "Field prep",
    participants: 76,
    image: "/WETLAND-BIRDS.png",
    action: "Volunteer"
  },
  {
    title: "Dolphin Awareness Walk",
    district: "Bhagalpur",
    status: "This week",
    participants: 92,
    image: "/GRD.png",
    action: "Learn more"
  }
];

export function CommunityWorkspace() {
  const [selectedRegionId, setSelectedRegionId] = useState(regions[0].id);
  const selectedRegion = regions.find((region) => region.id === selectedRegionId) ?? regions[0];

  return (
    <section className="community-workspace">
      <section className="community-hero">
        <div className="community-hero-copy">
          <span className="community-eyebrow">Community action network</span>
          <h1>Together for a safer and healthier Ganga</h1>
          <p>
            Citizens, volunteers, ward observers, and conservation groups working together across riverfronts,
            wetlands, and flood-prone neighborhoods.
          </p>
          <div className="community-hero-tags">
            <span>Flood awareness</span>
            <span>Verified observations</span>
            <span>Restoration drives</span>
          </div>
        </div>
        <div className="community-hero-stats">
          <div><span>Active volunteers</span><strong>426</strong></div>
          <div><span>Verified reports</span><strong>89</strong></div>
          <div><span>Drives completed</span><strong>17</strong></div>
        </div>
      </section>

      <section className="community-main-grid">
        <article className="community-panel community-feed-panel">
          <div className="community-panel-head">
            <div>
              <span>Community Activity</span>
              <h2>Recent public participation</h2>
            </div>
            <p>Verified civic actions and local ecosystem observations.</p>
          </div>
          <div className="community-feed-list">
            {activities.map((activity) => (
              <article className={`community-activity-card ${activity.image ? "" : "no-media"}`} key={activity.id}>
                {activity.image ? <div className="community-activity-image" style={{ backgroundImage: `url(${activity.image})` }} /> : null}
                <div className="community-activity-copy">
                  <div className="community-activity-top">
                    <span>{activity.role}</span>
                    <em>{activity.status}</em>
                  </div>
                  <strong>{activity.type}</strong>
                  <p>{activity.summary}</p>
                  <div className="community-activity-meta">
                    <span>{activity.district}</span>
                    <span>{activity.location}</span>
                    <span>{activity.time}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </article>

        <article className="community-panel community-knowledge-panel">
          <div className="community-panel-head">
            <div>
              <span>Community knowledge exchange</span>
              <h2>Questions from river communities</h2>
            </div>
            <p>Moderated local wisdom, field observations, and conservation answers.</p>
          </div>
          <KnowledgeExchange mode="compact" />
        </article>

        <article className="community-panel community-map-panel">
          <div className="community-panel-head">
            <div>
              <span>Participation map</span>
              <h2>{selectedRegion.name}</h2>
            </div>
            <p>{selectedRegion.summary}</p>
          </div>
          <CommunityMap regions={regions} selectedRegionId={selectedRegion.id} onRegionSelect={setSelectedRegionId} />
        </article>
      </section>

      <section className="community-campaign-grid">
        {campaigns.map((campaign) => (
          <article className="community-campaign-card" key={campaign.title}>
            <div className="community-campaign-image" style={{ backgroundImage: `url(${campaign.image})` }}>
              <span>{campaign.status}</span>
            </div>
            <div className="community-campaign-copy">
              <strong>{campaign.title}</strong>
              <p>{campaign.district} • {campaign.participants} participants</p>
              <button type="button">{campaign.action}</button>
            </div>
          </article>
        ))}
      </section>
    </section>
  );
}
