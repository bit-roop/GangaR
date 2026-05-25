import type { ThoughtOfDay } from "@/types/dashboard";

type HeroBannerProps = {
  title: string[];
  image: string;
  thought: ThoughtOfDay;
};

export function HeroBanner({ title, image, thought }: HeroBannerProps) {
  return (
    <section className="hero-grid">
      <article className="hero-banner" style={{ backgroundImage: `linear-gradient(180deg, rgba(20, 47, 40, 0.12), rgba(20, 47, 40, 0.38)), linear-gradient(90deg, rgba(10, 43, 38, 0.08), rgba(10, 43, 38, 0.02)), url(${image})` }}>
        <div className="hero-overlay">
          <h3>
            {title.map((line) => (
              <span key={line} className="hero-title-line">
                {line}
              </span>
            ))}
          </h3>
        </div>

        <aside className="thought-card">
          <p className="thought-title">{thought.title}</p>
          <blockquote>
            {thought.quote.map((line) => (
              <span key={line} className="quote-line">
                {line}
              </span>
            ))}
          </blockquote>
          <p className="thought-author">- {thought.author}</p>
          <span className="thought-leaf" aria-hidden="true">
            🍃
          </span>
        </aside>
      </article>
    </section>
  );
}
