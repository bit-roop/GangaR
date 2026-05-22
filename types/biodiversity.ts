export type BiodiversityLayerKey =
  | "species"
  | "hotspots"
  | "habitats"
  | "migration"
  | "clusters";

export type BiodiversityMetric = {
  label: string;
  value: string;
  delta: string;
  tone: "stable" | "improving" | "watch" | "critical";
  detail: string;
};

export type BiodiversitySpeciesCard = {
  id: string;
  speciesName: string;
  scientificName: string;
  conservationStatus: string;
  lastObservation: string;
  district: string;
  habitatNotes: string;
  activityState: string;
  habitatZone: string;
  markerColor: string;
  image?: string;
};

export type BiodiversityHotspot = {
  id: string;
  name: string;
  district: string;
  severity: "stable" | "watch" | "critical";
  summary: string;
  speciesCount: number;
  coordinates: [number, number][];
};

export type BiodiversityHabitatCard = {
  id: string;
  habitatName: string;
  district: string;
  habitatType: string;
  condition: string;
  pressure: string;
  note: string;
  telemetry: string;
};

export type BiodiversityObservationFeedItem = {
  id: string;
  title: string;
  speciesId?: string;
  district: string;
  timestamp: string;
  source: string;
  confidence: string;
  summary: string;
  tag: string;
};

export type BiodiversityRiskPanel = {
  id: string;
  title: string;
  severity: "stable" | "watch" | "critical";
  indicator: string;
  note: string;
};

export type BiodiversityMigrationEvent = {
  id: string;
  title: string;
  district: string;
  window: string;
  detail: string;
  intensity: "low" | "moderate" | "high";
};

export type BiodiversityMapMarker = {
  id: string;
  speciesId: string;
  label: string;
  district: string;
  latitude: number;
  longitude: number;
  lastObservation: string;
  activityState: string;
  scientificName: string;
  conservationStatus: string;
  habitatZone: string;
  thumbnail?: string;
  accent: string;
  signalStrength: "low" | "moderate" | "high";
};

export type BiodiversityMapCluster = {
  id: string;
  label: string;
  district: string;
  latitude: number;
  longitude: number;
  observationCount: number;
  signal: string;
  accent: string;
};

export type BiodiversityHabitatOverlay = {
  id: string;
  name: string;
  habitatType: string;
  district: string;
  fill: string;
  coordinates: [number, number][];
  icon: "channel" | "sandbar" | "wetland";
  condition: string;
};

export type BiodiversityMigrationPath = {
  id: string;
  label: string;
  season: string;
  flow: string;
  coordinates: [number, number][];
  intensity: "low" | "moderate" | "high";
};

export type BiodiversityMapData = {
  center: {
    latitude: number;
    longitude: number;
    zoom: number;
  };
  legendTimestamp: string;
  riverPath: [number, number][];
  markers: BiodiversityMapMarker[];
  hotspots: BiodiversityHotspot[];
  habitatOverlays: BiodiversityHabitatOverlay[];
  migrationPaths: BiodiversityMigrationPath[];
  clusters: BiodiversityMapCluster[];
};

export type BiodiversityOperationsData = {
  hero: {
    eyebrow: string;
    title: string;
    summary: string;
    badges: string[];
    status: string;
    pulse: string;
  };
  metrics: BiodiversityMetric[];
  species: BiodiversitySpeciesCard[];
  observationFeed: BiodiversityObservationFeedItem[];
  conservationPanels: BiodiversityRiskPanel[];
  habitats: BiodiversityHabitatCard[];
  migrationTimeline: BiodiversityMigrationEvent[];
  map: BiodiversityMapData;
};
