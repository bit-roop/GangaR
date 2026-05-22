import { MobileBottomNav } from "@/components/mobile/MobileBottomNav";
import type { DashboardData } from "@/types/dashboard";

type MobileDashboardProps = {
  data: DashboardData;
};

export function MobileDashboard({ data }: MobileDashboardProps) {
  const primaryStat = data.stats[0];

  return (
    <section className="mobile-frame">
      <div className="mobile-shell">
        <header className="mobile-top">
          <span>☰</span>
          <strong>Dashboard</strong>
          <span>🔔</span>
        </header>

        <div className="mobile-intro">
          <h3>{data.greeting}</h3>
          <p>You are making a difference!</p>
        </div>

        <article className="mobile-quality">
          <p>{primaryStat.title}</p>
          <div className="mobile-quality-row">
            <div>
              <strong>{primaryStat.value}</strong>
              <span>{primaryStat.suffix}</span>
              <p>{primaryStat.detail}</p>
            </div>
            <div className="sparkline" />
          </div>
        </article>

        <div className="mobile-tiles">
          {data.mobileTiles.map((tile) => (
            <div key={tile.label} className="mini-tile">
              <span>{tile.label}</span>
              <strong>{tile.value}</strong>
            </div>
          ))}
        </div>

        <section className="mobile-actions">
          <h4>Quick Actions</h4>
          <div className="action-grid">
            {data.quickActions.map((action) => (
              <div key={action.label} className="action-tile">
                <div className="action-icon" />
                <span>{action.label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="activity-card">
          <div className="panel-head">
            <h4>{data.activity.title}</h4>
            <span>{data.activity.timestamp}</span>
          </div>
          <p>{data.activity.detail}</p>
        </section>

        <MobileBottomNav items={data.bottomNav} />
      </div>
    </section>
  );
}
