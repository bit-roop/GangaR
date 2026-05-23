import { floodOperationsData } from "@/data/mock/floodOperations";
import type { FloodOperationsData } from "@/types/flood";

export async function getFloodOperationsData(): Promise<FloodOperationsData> {
  return floodOperationsData;
}
