import { IncidentReportsWorkspace } from "@/components/incidents/IncidentReportsWorkspace";
import { getIncidentReports } from "@/services/incidentService";
import type { IncidentReport } from "@/types/environment";

export default async function IncidentMonitoringPage() {
  let reports: IncidentReport[] = [];

  try {
    reports = await getIncidentReports();
  } catch {
    reports = [];
  }

  return <IncidentReportsWorkspace initialReports={reports} />;
}
