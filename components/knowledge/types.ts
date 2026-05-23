export type KnowledgeCategory =
  | "Floods"
  | "River Ecology"
  | "Biodiversity"
  | "Fishing & Livelihood"
  | "Wetlands"
  | "Water Quality"
  | "Pollution"
  | "Conservation"
  | "Traditional Knowledge"
  | "Disaster Preparedness";

export type ContributorRole =
  | "Citizen"
  | "Volunteer"
  | "Analyst"
  | "Researcher"
  | "Local Expert"
  | "Fisherman"
  | "Conservationist";

export type ModerationState = "Verified" | "Under Review" | "Removed" | "Community Verified";

export type KnowledgeAnswer = {
  id: string;
  author: string;
  role: ContributorRole;
  designation: string;
  avatar: string;
  timestamp: string;
  trustSignal: string;
  body: string;
  upvotes: number;
  verified: boolean;
  adminHighlighted?: boolean;
  state: ModerationState;
  confidence?: string;
  badges?: string[];
};

export type KnowledgeQuestion = {
  id: string;
  title: string;
  preview: string;
  category: KnowledgeCategory;
  district: string;
  author: string;
  role: ContributorRole;
  timestamp: string;
  state: ModerationState;
  tags: string[];
  signal: string;
  thumbnail: string;
  confidence: string;
  insights: string[];
  answers: KnowledgeAnswer[];
};
