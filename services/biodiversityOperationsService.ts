import { biodiversityOperationsData } from "@/data/mock";
import type { BiodiversityOperationsData } from "@/types/biodiversity";

export async function getBiodiversityOperationsData(): Promise<BiodiversityOperationsData> {
  return biodiversityOperationsData;
}
