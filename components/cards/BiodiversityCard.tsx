import type { BiodiversityEntry } from "@/types/dashboard";

type BiodiversityCardProps = {
  item: BiodiversityEntry;
};

export function BiodiversityCard({ item }: BiodiversityCardProps) {
  return (
    <div className="species-card">
      <div className="species-image" style={{ backgroundImage: `url(${item.image})` }} />
      <h5>{item.name}</h5>
      <p>{item.meta}</p>
      <div className="species-tags">
        <span className="species-pill">{item.districtTag}</span>
        <span className="species-pill subtle">{item.freshnessLabel}</span>
      </div>
      <span className="species-meta">{item.habitatZone}</span>
      {item.habitatCondition ? <span className="species-meta">{item.habitatCondition}</span> : null}
      <span className="species-meta">{item.seasonalActivity}</span>
      <span className="species-meta">Last sighted: {item.lastSighted}</span>
      {item.conservationTrend ? <span className="species-meta">{item.conservationTrend}</span> : null}
      <strong className={`status-${item.status.toLowerCase().replace(/\s+/g, "-")}`}>{item.status}</strong>
    </div>
  );
}
