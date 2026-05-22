import { FloodWorkspace } from "@/components/flood/FloodWorkspace";
import { floodOperationsData } from "@/data/mock";

export default function FloodOperationsPage() {
  return <FloodWorkspace initialData={floodOperationsData} />;
}
