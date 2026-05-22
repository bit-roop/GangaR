import { BiodiversityWorkspace } from "@/components/biodiversity/BiodiversityWorkspace";
import { biodiversityOperationsData } from "@/data/mock";

export default async function BiodiversityOperationsPage() {
  return <BiodiversityWorkspace initialData={biodiversityOperationsData} />;
}
