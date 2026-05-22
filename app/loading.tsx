export default function Loading() {
  return (
    <main className="page-shell">
      <section className="desktop-frame dashboard-loading">
        <div className="sidebar skeleton-panel" />
        <div className="desktop-content">
          <div className="skeleton-row skeleton-topbar" />
          <div className="skeleton-row skeleton-hero" />
          <div className="stats-grid">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="stat-card skeleton-card" />
            ))}
          </div>
          <div className="lower-grid">
            <div className="panel skeleton-card skeleton-panel-tall" />
            <div className="panel skeleton-card skeleton-panel-tall" />
          </div>
        </div>
      </section>
    </main>
  );
}
