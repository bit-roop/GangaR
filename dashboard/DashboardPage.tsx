import { DashboardInteractiveShell } from "@/components/dashboard/DashboardInteractiveShell";
import { Sidebar } from "@/components/layout/Sidebar";
import { getDashboardData } from "@/services/dashboardService";

export async function DashboardPage() {
  let dashboardData;

  try {
    dashboardData = await getDashboardData();
  } catch {
    return (
      <main className="page-shell">
        <section className="desktop-frame">
          <Sidebar
            items={[
              { label: "Dashboard", icon: "▥", active: true },
              { label: "River Health", icon: "◔" },
              { label: "Biodiversity", icon: "🪶" }
            ]}
          />
          <div className="desktop-content">
            <div className="error-state">
              <h2>Live dashboard data is temporarily unavailable.</h2>
              <p>We could not load the latest environmental monitoring snapshot for the Patna basin.</p>
              <span>Please refresh in a moment to retry the mock service layer.</span>
              <a href="/" className="retry-link">Retry dashboard feed</a>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <DashboardInteractiveShell data={dashboardData} />
  );
}
