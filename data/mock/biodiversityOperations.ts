import type { BiodiversityOperationsData } from "@/types/biodiversity";

export const biodiversityOperationsData: BiodiversityOperationsData = {
  hero: {
    eyebrow: "Ganga ecosystem watch",
    title: "Live species, habitat, and migration signals across the middle Ganga.",
    summary:
      "A visual monitoring surface for dolphins, turtles, cranes, gharial, migratory fish, and wetland birds.",
    badges: ["6 focal species", "4 habitat zones", "3 migration paths", "Live field signals"],
    status: "Ecosystem feed live",
    pulse: "Fresh acoustic and wetland signals in the last 3 hours"
  },
  metrics: [
    {
      label: "Active species records",
      value: "148",
      delta: "+12 this week",
      tone: "improving",
      detail: "Fresh sightings and acoustic detections"
    },
    {
      label: "Hotspot pressure",
      value: "Moderate",
      delta: "2 critical pockets",
      tone: "watch",
      detail: "Sandbars and wetland edges under watch"
    },
    {
      label: "Protected habitat continuity",
      value: "81%",
      delta: "-4% from pre-monsoon",
      tone: "watch",
      detail: "Shallow side channels thinning"
    },
    {
      label: "Conservation queue",
      value: "07",
      delta: "3 field teams active",
      tone: "critical",
      detail: "Fishing and mining signals pending"
    }
  ],
  species: [
    {
      id: "ganges-river-dolphin",
      speciesName: "Ganges river dolphin",
      scientificName: "Platanista gangetica",
      conservationStatus: "Endangered",
      lastObservation: "22 May 2026, 06:40 IST",
      district: "Bhagalpur",
      habitatNotes: "Quiet deep-pool refuge.",
      activityState: "Surfacing cluster active",
      habitatZone: "Vikramshila Dolphin Sanctuary",
      markerColor: "#2d7dd2",
      image: "/GRD.png"
    },
    {
      id: "indian-softshell-turtle",
      speciesName: "Indian softshell turtle",
      scientificName: "Nilssonia gangetica",
      conservationStatus: "Vulnerable",
      lastObservation: "21 May 2026, 17:15 IST",
      district: "Patna",
      habitatNotes: "Basking shelf with nesting pressure.",
      activityState: "Nest scouting observed",
      habitatZone: "Gandhi Setu sandbar complex",
      markerColor: "#cf8d2e",
      image: "/IST.png"
    },
    {
      id: "sarus-crane",
      speciesName: "Sarus crane",
      scientificName: "Antigone antigone",
      conservationStatus: "Vulnerable",
      lastObservation: "22 May 2026, 05:58 IST",
      district: "Munger",
      habitatNotes: "Shallow wet-grassland edge.",
      activityState: "Breeding pair holding",
      habitatZone: "Kharagpur wet grassland pocket",
      markerColor: "#2a8f62",
      image: "/SC.png"
    },
    {
      id: "gharial",
      speciesName: "Gharial",
      scientificName: "Gavialis gangeticus",
      conservationStatus: "Critically Endangered",
      lastObservation: "20 May 2026, 13:20 IST",
      district: "Buxar reach",
      habitatNotes: "Low-disturbance bank shelf.",
      activityState: "Intermittent basking",
      habitatZone: "Upper channel recovery reach",
      markerColor: "#7a5bd6",
      image: "/GHARIAL.png"
    },
    {
      id: "migratory-fish",
      speciesName: "Migratory fish",
      scientificName: "Tenualosa ilisha / major carp assemblage",
      conservationStatus: "Migration-sensitive",
      lastObservation: "22 May 2026, 04:25 IST",
      district: "Patna to Munger",
      habitatNotes: "Cooler mid-channel passage.",
      activityState: "Migration pulse rising",
      habitatZone: "Mid-channel migration corridor",
      markerColor: "#0f6d8c",
      image: "/FISH.png"
    },
    {
      id: "wetland-birds",
      speciesName: "Wetland birds",
      scientificName: "Mixed Anatidae and wader assemblage",
      conservationStatus: "Seasonally sensitive",
      lastObservation: "21 May 2026, 07:10 IST",
      district: "Hajipur",
      habitatNotes: "Shallow marsh feeding pockets.",
      activityState: "Flocks dispersed",
      habitatZone: "Diara wetland mosaic",
      markerColor: "#1f8a70",
      image: "/WETLAND-BIRDS.png"
    }
  ],
  observationFeed: [
    {
      id: "obs-dolphin-bhagalpur-01",
      title: "Multi-pass dolphin surfacing logged",
      speciesId: "ganges-river-dolphin",
      district: "Bhagalpur",
      timestamp: "22 May 2026, 06:40 IST",
      source: "Acoustic buoy + patrol visual",
      confidence: "High confidence",
      summary: "Three surfacing intervals in a quiet sanctuary bend.",
      tag: "Channel behavior"
    },
    {
      id: "obs-turtle-patna-02",
      title: "Softshell nesting fringe disturbed",
      speciesId: "indian-softshell-turtle",
      district: "Patna",
      timestamp: "21 May 2026, 17:15 IST",
      source: "Bank patrol transect",
      confidence: "Field verified",
      summary: "Footprints and nylon-line fragments near the basking shelf.",
      tag: "Habitat pressure"
    },
    {
      id: "obs-birds-hajipur-03",
      title: "Wetland bird density dips",
      speciesId: "wetland-birds",
      district: "Hajipur",
      timestamp: "21 May 2026, 07:10 IST",
      source: "Wetland transect survey",
      confidence: "Moderate confidence",
      summary: "Morning flock count dipped as the marsh edge dried.",
      tag: "Wetland condition"
    },
    {
      id: "obs-fish-munger-04",
      title: "Migratory fish pulse strengthens",
      speciesId: "migratory-fish",
      district: "Munger",
      timestamp: "22 May 2026, 04:25 IST",
      source: "Sonar transect",
      confidence: "High confidence",
      summary: "Dense upstream movement detected along the deeper channel.",
      tag: "Migration"
    }
  ],
  conservationPanels: [
    {
      id: "risk-habitat-pressure",
      title: "Habitat pressure",
      severity: "watch",
      indicator: "Moderate",
      note: "Sandbar trampling and boat noise compress safe habitat."
    },
    {
      id: "risk-illegal-fishing",
      title: "Illegal fishing / mining indicators",
      severity: "critical",
      indicator: "7 signals",
      note: "Night nets and extraction reports overlap movement paths."
    },
    {
      id: "risk-wetland-degradation",
      title: "Wetland degradation",
      severity: "watch",
      indicator: "3 edges receding",
      note: "Reed thinning is breaking bird feeding continuity."
    },
    {
      id: "risk-seasonal-shift",
      title: "Seasonal migration change",
      severity: "stable",
      indicator: "On pattern",
      note: "Fish movement remains coherent for pre-monsoon."
    }
  ],
  habitats: [
    {
      id: "habitat-vikramshila",
      habitatName: "Vikramshila acoustic corridor",
      district: "Bhagalpur",
      habitatType: "Deep channel sanctuary",
      condition: "Stable",
      pressure: "Low vessel disturbance",
      note: "Strong acoustic returns along the inside bend.",
      telemetry: "Hydrophone 98% | stable depth"
    },
    {
      id: "habitat-patna-sandbar",
      habitatName: "Patna nesting sandbar",
      district: "Patna",
      habitatType: "Mid-channel sandbar",
      condition: "Watch",
      pressure: "Human access and line debris",
      note: "Basking continues; nest buffer is narrowing.",
      telemetry: "Warm shelf | disturbance +18%"
    },
    {
      id: "habitat-hajipur-wetland",
      habitatName: "Hajipur wetland mosaic",
      district: "Hajipur",
      habitatType: "Marsh and reed bed",
      condition: "Degrading edge",
      pressure: "Water retreat and grazing pressure",
      note: "Peripheral pools are fragmenting.",
      telemetry: "Water -9% | reed cover thinning"
    },
    {
      id: "habitat-munger-corridor",
      habitatName: "Munger migration seam",
      district: "Munger",
      habitatType: "Main-stem flow corridor",
      condition: "Active",
      pressure: "Net interception risk",
      note: "Dawn flow remains favorable for upstream movement.",
      telemetry: "DO favorable | density above baseline"
    }
  ],
  migrationTimeline: [
    {
      id: "mig-01",
      title: "Pre-dawn fish ascent intensifies",
      district: "Patna-Munger",
      window: "04:00-05:00 IST",
      detail: "Upstream passage strengthened before sunrise.",
      intensity: "high"
    },
    {
      id: "mig-02",
      title: "Dolphin channel shift toward inner bend",
      district: "Bhagalpur",
      window: "06:00-07:00 IST",
      detail: "Acoustic pings moved toward the quieter inner bend.",
      intensity: "moderate"
    },
    {
      id: "mig-03",
      title: "Wetland bird feeding redistributed",
      district: "Hajipur",
      window: "Sunrise window",
      detail: "Flocks spread across shallow pockets as reed edges dried.",
      intensity: "low"
    },
    {
      id: "mig-04",
      title: "Sarus pair territory remains fixed",
      district: "Munger",
      window: "05:30-06:15 IST",
      detail: "Pair activity stayed centered on one flooded grass strip.",
      intensity: "moderate"
    }
  ],
  map: {
    center: {
      latitude: 25.47,
      longitude: 86.0,
      zoom: 8
    },
    legendTimestamp: "22 May 2026, 07:15 IST",
    riverPath: [
      [84.99, 25.68],
      [85.17, 25.62],
      [85.55, 25.58],
      [85.9, 25.5],
      [86.28, 25.47],
      [86.72, 25.31],
      [87.02, 25.26]
    ],
    markers: [
      {
        id: "marker-dolphin-1",
        speciesId: "ganges-river-dolphin",
        label: "Dolphin acoustic node",
        district: "Bhagalpur",
        latitude: 25.2462,
        longitude: 86.9824,
        lastObservation: "22 May 2026, 06:40 IST",
        activityState: "Acoustic cluster active",
        scientificName: "Platanista gangetica",
        conservationStatus: "Endangered",
        habitatZone: "Vikramshila Dolphin Sanctuary",
        thumbnail: "/GRD.png",
        accent: "#64d8f2",
        signalStrength: "high"
      },
      {
        id: "marker-turtle-1",
        speciesId: "indian-softshell-turtle",
        label: "Softshell basking shelf",
        district: "Patna",
        latitude: 25.6174,
        longitude: 85.164,
        lastObservation: "21 May 2026, 17:15 IST",
        activityState: "Nest fringe under watch",
        scientificName: "Nilssonia gangetica",
        conservationStatus: "Vulnerable",
        habitatZone: "Gandhi Setu sandbar complex",
        thumbnail: "/IST.png",
        accent: "#e4b15a",
        signalStrength: "moderate"
      },
      {
        id: "marker-sarus-1",
        speciesId: "sarus-crane",
        label: "Sarus breeding pair",
        district: "Munger",
        latitude: 25.486,
        longitude: 86.221,
        lastObservation: "22 May 2026, 05:58 IST",
        activityState: "Territory holding",
        scientificName: "Antigone antigone",
        conservationStatus: "Vulnerable",
        habitatZone: "Kharagpur wet grassland pocket",
        thumbnail: "/SC.png",
        accent: "#86e49f",
        signalStrength: "moderate"
      },
      {
        id: "marker-gharial-1",
        speciesId: "gharial",
        label: "Gharial bank shelf",
        district: "Buxar reach",
        latitude: 25.565,
        longitude: 84.01,
        lastObservation: "20 May 2026, 13:20 IST",
        activityState: "Intermittent basking",
        scientificName: "Gavialis gangeticus",
        conservationStatus: "Critically Endangered",
        habitatZone: "Upper channel recovery reach",
        thumbnail: "/GHARIAL.png",
        accent: "#b79cff",
        signalStrength: "low"
      },
      {
        id: "marker-fish-1",
        speciesId: "migratory-fish",
        label: "Fish migration pulse",
        district: "Patna-Munger",
        latitude: 25.49,
        longitude: 85.92,
        lastObservation: "22 May 2026, 04:25 IST",
        activityState: "Migration pulse rising",
        scientificName: "Tenualosa ilisha / major carp assemblage",
        conservationStatus: "Migration-sensitive",
        habitatZone: "Mid-channel migration corridor",
        thumbnail: "/FISH.png",
        accent: "#8ee6ff",
        signalStrength: "high"
      },
      {
        id: "marker-birds-1",
        speciesId: "wetland-birds",
        label: "Wetland bird feeding pocket",
        district: "Hajipur",
        latitude: 25.689,
        longitude: 85.19,
        lastObservation: "21 May 2026, 07:10 IST",
        activityState: "Foraging dispersed",
        scientificName: "Mixed Anatidae and wader assemblage",
        conservationStatus: "Seasonally sensitive",
        habitatZone: "Diara wetland mosaic",
        thumbnail: "/WETLAND-BIRDS.png",
        accent: "#6fd0af",
        signalStrength: "low"
      }
    ],
    hotspots: [
      {
        id: "hotspot-vikramshila",
        name: "Vikramshila sanctuary core",
        district: "Bhagalpur",
        severity: "stable",
        summary: "High dolphin activity with comparatively low anthropogenic interference.",
        speciesCount: 4,
        coordinates: [
          [86.89, 25.29],
          [86.97, 25.32],
          [87.03, 25.28],
          [86.98, 25.22],
          [86.9, 25.24]
        ]
      },
      {
        id: "hotspot-patna-sandbar",
        name: "Patna sandbar pressure zone",
        district: "Patna",
        severity: "critical",
        summary: "Turtle nesting fringe overlaps with fishing-line debris and irregular foot traffic.",
        speciesCount: 3,
        coordinates: [
          [85.12, 25.63],
          [85.2, 25.64],
          [85.23, 25.59],
          [85.16, 25.56],
          [85.09, 25.58]
        ]
      },
      {
        id: "hotspot-hajipur-marsh",
        name: "Hajipur marsh edge",
        district: "Hajipur",
        severity: "watch",
        summary: "Wetland bird use remains high, but edge desiccation is advancing.",
        speciesCount: 5,
        coordinates: [
          [85.14, 25.72],
          [85.22, 25.73],
          [85.25, 25.68],
          [85.17, 25.65],
          [85.11, 25.68]
        ]
      }
    ],
    habitatOverlays: [
      {
        id: "overlay-deep-channel",
        name: "Deep-channel refuge",
        habitatType: "Dolphin habitat",
        district: "Bhagalpur",
        fill: "#2d7dd2",
        icon: "channel",
        condition: "Stable refuge",
        coordinates: [
          [86.91, 25.28],
          [86.99, 25.3],
          [87.01, 25.25],
          [86.93, 25.23]
        ]
      },
      {
        id: "overlay-sandbar",
        name: "Sandbar nesting zone",
        habitatType: "Turtle habitat",
        district: "Patna",
        fill: "#cf8d2e",
        icon: "sandbar",
        condition: "Nesting pressure",
        coordinates: [
          [85.13, 25.61],
          [85.19, 25.62],
          [85.2, 25.58],
          [85.14, 25.57]
        ]
      },
      {
        id: "overlay-wetland",
        name: "Wetland feeding mosaic",
        habitatType: "Bird habitat",
        district: "Hajipur",
        fill: "#1f8a70",
        icon: "wetland",
        condition: "Edge thinning",
        coordinates: [
          [85.13, 25.71],
          [85.21, 25.72],
          [85.22, 25.67],
          [85.14, 25.66]
        ]
      }
    ],
    migrationPaths: [
      {
        id: "path-fish-01",
        label: "Pre-monsoon fish ascent corridor",
        season: "Pre-monsoon",
        flow: "Upstream movement strengthening",
        intensity: "high",
        coordinates: [
          [85.19, 25.61],
          [85.58, 25.55],
          [86.02, 25.49],
          [86.38, 25.4]
        ]
      },
      {
        id: "path-dolphin-01",
        label: "Dolphin low-noise shift",
        season: "Morning vessel onset",
        flow: "Lateral channel relocation",
        intensity: "moderate",
        coordinates: [
          [86.9, 25.25],
          [86.95, 25.28],
          [86.99, 25.27]
        ]
      }
    ],
    clusters: [
      {
        id: "cluster-patna",
        label: "Patna observation cluster",
        district: "Patna",
        latitude: 25.61,
        longitude: 85.17,
        observationCount: 18,
        signal: "Sandbar + turtle observations",
        accent: "#e4b15a"
      },
      {
        id: "cluster-bhagalpur",
        label: "Bhagalpur observation cluster",
        district: "Bhagalpur",
        latitude: 25.27,
        longitude: 86.95,
        observationCount: 24,
        signal: "Dolphin acoustic density",
        accent: "#64d8f2"
      },
      {
        id: "cluster-hajipur",
        label: "Hajipur observation cluster",
        district: "Hajipur",
        latitude: 25.69,
        longitude: 85.19,
        observationCount: 11,
        signal: "Wetland bird activity",
        accent: "#6fd0af"
      }
    ]
  }
};
