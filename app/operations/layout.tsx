import { DashboardDataProvider } from "@/components/dashboard/DashboardDataProvider";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { getDashboardData } from "@/services/dashboardService";

export default async function OperationsLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  try {
    const data = await getDashboardData();

    return (
      <DashboardDataProvider data={data}>
        <main className="page-shell page-shell-interactive">
          <section className="desktop-frame">
            <Sidebar items={data.sidebarItems} />
            <div className="desktop-content">
              <Topbar
                location={data.location}
                greeting={data.greeting}
                subcopy={data.subcopy}
                weather={data.weather}
              />
              {children}
            </div>
          </section>
        </main>
      </DashboardDataProvider>
    );
  } catch {
    return (
      <main className="page-shell">
        <section className="desktop-frame">
          <Sidebar
            items={[
              { label: "Dashboard", icon: "▥", href: "/" },
              { label: "Reports", icon: "📄", href: "/operations/incidents" }
            ]}
          />
          <div className="desktop-content">{children}</div>
        </section>
      </main>
    );
  }
}
