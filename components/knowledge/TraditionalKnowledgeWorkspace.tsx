import { KnowledgeExchange } from "@/components/knowledge/KnowledgeExchange";

const memoryCards = [
  {
    icon: "≈",
    label: "Local warning signs",
    title: "Flood memory",
    copy: "Seepage paths, animal movement, high-water marks."
  },
  {
    icon: "∿",
    label: "Ecological practice",
    title: "River livelihoods",
    copy: "Fishing, boating, wetland stewardship."
  },
  {
    icon: "◒",
    label: "Conservation context",
    title: "Species memory",
    copy: "Movement signals linked to season and disturbance."
  }
];

export function TraditionalKnowledgeWorkspace() {
  return (
    <section className="traditional-workspace">
      <section className="traditional-hero">
        <div>
          <span className="community-eyebrow">Traditional ecological knowledge</span>
          <h1>Local wisdom, verified with environmental intelligence</h1>
          <p>
            A living exchange for river memory, practical flood awareness, field observations, and conservation answers.
          </p>
        </div>
        <div className="traditional-trust-grid">
          <div><span>Verified answers</span><strong>128</strong></div>
          <div><span>Local experts</span><strong>34</strong></div>
          <div><span>Linked insights</span><strong>76</strong></div>
        </div>
      </section>

      <section className="traditional-memory-grid">
        {memoryCards.map((card) => (
          <article className="traditional-memory-card" key={card.title}>
            <i aria-hidden="true">{card.icon}</i>
            <span>{card.label}</span>
            <strong>{card.title}</strong>
            <p>{card.copy}</p>
          </article>
        ))}
      </section>

      <KnowledgeExchange />
    </section>
  );
}
