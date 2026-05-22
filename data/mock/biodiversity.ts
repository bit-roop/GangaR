import type { BiodiversitySighting } from "@/types/environment";

export const biodiversitySightings: BiodiversitySighting[] = [
  {
    id: "grd-bhagalpur",
    speciesName: "Ganges River Dolphin",
    scientificName: "Platanista gangetica",
    conservationStatus: "Endangered",
    district: "Bhagalpur",
    latitude: 25.2462,
    longitude: 86.9824,
    habitatZone: "Vikramshila Dolphin Sanctuary",
    lastSighted: "20 May 2026, 8:30 AM IST",
    ecologicalNote: "Observed near a slower meander with relatively low vessel disturbance.",
    image: "/GRD.png"
  },
  {
    id: "ist-patna",
    speciesName: "Indian Softshell Turtle",
    scientificName: "Nilssonia gangetica",
    conservationStatus: "Vulnerable",
    district: "Patna",
    latitude: 25.6174,
    longitude: 85.164,
    habitatZone: "Mid-channel sandbar",
    lastSighted: "19 May 2026, 5:10 PM IST",
    ecologicalNote: "Basking activity reported along exposed sandbar edges after midday heat.",
    image: "/IST.png"
  },
  {
    id: "sc-munger",
    speciesName: "Sarus Crane",
    scientificName: "Grus antigone",
    conservationStatus: "Near Threatened",
    district: "Munger",
    latitude: 25.486,
    longitude: 86.221,
    habitatZone: "Seasonal wet grassland",
    lastSighted: "20 May 2026, 6:45 AM IST",
    ecologicalNote: "Pair activity recorded close to a shallow wetland margin and paddy mosaic.",
    image: "/SC.png"
  }
];
