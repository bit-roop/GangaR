export type CommunityRegion = {
  id: string;
  name: string;
  district: string;
  coordinates: [number, number];
  tone: "cleanup" | "biodiversity" | "watch" | "flood";
  participants: number;
  summary: string;
};

export type CommunityActivity = {
  id: string;
  type: string;
  role: string;
  district: string;
  location: string;
  time: string;
  summary: string;
  status: string;
  image?: string;
};
