export interface ScoringParameter {
  id: string;
  name: string;
  weight: number;
  rating?: number; // 1-5
  weightedScore?: number;
  rationale?: string;
}

export interface BrandData {
  name: string;
  tracxnData?: any;
  socialSummary?: string;
}

export interface CollaborationConcept {
  title: string;
  description: string;
}

export interface Risk {
  risk: string;
  mitigation: string;
}

export interface AnalysisResult {
  executiveSummary: string;
  parameters: ScoringParameter[];
  rawSum: number;
  finalPercentage: number;
  recommendation: "Go" | "Pilot" | "No-Go";
  suggestedModel: string;
  concepts: CollaborationConcept[];
  risks: Risk[];
  sources: string[];
}

export interface AnalysisRequest {
  brandA: string;
  brandB: string;
  scope: string;
  geography: string;
  weights: Record<string, number>;
  apiKey: string; // Gemini Key
  tracxnKey?: string;
}