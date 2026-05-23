import { biodiversitySightings } from "@/data/mock";
import type { BiodiversityEntry } from "@/types/dashboard";
import type { BiodiversitySighting } from "@/types/environment";
import type { ServiceResult } from "@/types/service";

export async function getBiodiversityHighlights(): Promise<BiodiversityEntry[]> {
  return biodiversitySightings.map((item) => ({
      name: item.speciesName,
      meta: item.scientificName,
      status: item.conservationStatus,
      image: item.image,
      lastSighted: item.lastSighted,
      habitatZone: item.habitatZone,
      districtTag: item.district,
      seasonalActivity:
        item.speciesName === "Sarus Crane"
          ? "Peak wetland activity"
          : item.speciesName === "Ganges River Dolphin"
            ? "Channel movement active"
            : "Mid-channel basking observed",
      freshnessLabel:
        item.lastSighted.includes("20 May 2026") ? "Fresh sighting" : "Observed within 24 hrs",
      habitatCondition:
        item.speciesName === "Ganges River Dolphin"
          ? "Low vessel disturbance"
          : item.speciesName === "Indian Softshell Turtle"
            ? "Sandbar habitat stable"
            : "Wet grassland moisture high",
      conservationTrend:
        item.speciesName === "Ganges River Dolphin"
          ? "Acoustic detections rising"
          : item.speciesName === "Indian Softshell Turtle"
            ? "Nest zone under observation"
            : "Breeding pair activity steady"
    }));
}

export async function getBiodiversitySightings(): Promise<ServiceResult<BiodiversitySighting[]>> {
  return {
    data: biodiversitySightings,
    lastUpdated: biodiversitySightings[0].lastSighted,
    source: "mock"
  };
}
