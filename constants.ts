import { ScoringParameter } from "./types";

export const TRACXN_API_KEY = "d57e3d50-d953-4a74-97b6-ef4c748270ec";

export const DEFAULT_PARAMETERS: ScoringParameter[] = [
  { id: "positioning", name: "Brand Positioning & Fit", weight: 20 },
  { id: "audience", name: "Audience Overlap & Targeting", weight: 15 },
  { id: "commercial", name: "Commercial Viability (Scale Parity)", weight: 15 },
  { id: "cultural", name: "Cultural / Value Alignment", weight: 12 },
  { id: "history", name: "Historical Collaboration", weight: 8 },
  { id: "legal", name: "Legal & Compliance Risk", weight: 8 },
  { id: "geo", name: "Geographic Compatibility", weight: 7 },
  { id: "operational", name: "Operational Feasibility", weight: 6 },
  { id: "brand_love", name: "Brand Love & Perception", weight: 6 },
  { id: "upside", name: "Upside / Strategic Optionality", weight: 3 },
];

export const MOCK_TRACXN_DATA = {
  note: "Real Tracxn API calls require a backend proxy due to CORS. Using simulated data extraction for this demo environment if fetch fails.",
};