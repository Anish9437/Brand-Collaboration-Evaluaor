import { GoogleGenAI } from "@google/genai";
import { AnalysisRequest, AnalysisResult } from "../types";

export const generateAnalysis = async (
  request: AnalysisRequest, 
  brandAData: any, 
  brandBData: any
): Promise<AnalysisResult> => {
  
  if (!process.env.API_KEY) {
    throw new Error("Gemini API Key is missing.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Construct the prompt based on the user's template
  const weightsSummary = Object.entries(request.weights)
    .map(([key, val]) => `${key}: ${val}`)
    .join(", ");

  const systemPrompt = `
    You are a senior strategy consultant specializing in brand partnerships, go-to-market and commercial strategy.
    Evaluate the collaboration between Brand A: ${request.brandA} and Brand B: ${request.brandB}.
    
    **CRITICAL: SEARCH GROUNDING**
    Use the Google Search tool to fetch up-to-date news articles, blogs, and social media discussions to understand **brand perception**, **brand trust**, and **current market positioning**. You must rely on recent data (last 12 months) to ensure the assessment reflects the current reality.
    
    Context:
    - Scope: ${request.scope}
    - Geography: ${request.geography}
    - Custom Weights: ${JSON.stringify(request.weights)}
    
    Data Source A (Tracxn/Live Data): ${brandAData ? JSON.stringify(brandAData).slice(0, 1500) : "Data not available, rely on Search."}
    Data Source B (Tracxn/Live Data): ${brandBData ? JSON.stringify(brandBData).slice(0, 1500) : "Data not available, rely on Search."}

    Specific Scoring Definitions:
    - "Brand Positioning & Fit": **Mandatory Search:** Analyze recent marketing campaigns, press releases, and consumer discourse to determine current market positioning. Assess alignment in target demographics and brand ethos based on this live data. Look for overlapping values or conflicting brand messages.
    - "Brand Love & Perception": **Mandatory Search:** Find recent sentiment, controversies, viral moments, and user reviews (e.g., Reddit, Twitter/X, News). Prioritize recent social listening data to gauge brand trust and affinity.
    - "Historical Collaboration": Do the brands have a history of collaborating with likewise brands of similar scale and industry? Note: This evaluates their general willingness and experience with partnerships, NOT whether they have collaborated with each other specifically in the past.
    - "Commercial Viability (Scale Parity)": **Mandatory Search if financials missing:** Evaluate whether the brands have similar scale in terms of revenue and valuation (Parity Check). If they don't, the likelihood of collaboration is lower due to lack of mutual benefit. Use Google Search to find latest annual revenue and valuation figures if Tracxn data is unavailable.

    Instructions:
    1. Score each parameter 1-5 based on the provided weights and definitions.
    2. Use the provided Tracxn data AND Google Search results to verify revenue/valuation for the "Commercial Viability (Scale Parity)" check.
    3. Be concise, evidence-first.
    4. RETURN ONLY RAW JSON. Do not include markdown formatting like \`\`\`json.
    
    The JSON structure must be exactly this:
    {
      "executiveSummary": "string",
      "parameters": [
        { "id": "string", "name": "string", "weight": number, "rating": number, "weightedScore": number, "rationale": "string" }
      ],
      "rawSum": number,
      "finalPercentage": number,
      "recommendation": "Go" | "Pilot" | "No-Go",
      "suggestedModel": "string",
      "concepts": [ { "title": "string", "description": "string" } ],
      "risks": [ { "risk": "string", "mitigation": "string" } ],
      "sources": [ "string" ]
    }
  `;

  // Note: responseSchema and responseMimeType are NOT compatible with tools (googleSearch).
  // We must parse the text manually and ask for JSON in the prompt.
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: systemPrompt,
    config: {
      tools: [{ googleSearch: {} }],
      temperature: 0.2,
    }
  });

  const text = response.text;
  if (!text) throw new Error("No response from AI");

  // Clean up markdown if present (Gemini sometimes adds it despite instructions)
  const cleanedText = text.replace(/```json\n?|\n?```/g, "").trim();

  let result: AnalysisResult;
  try {
    result = JSON.parse(cleanedText) as AnalysisResult;
  } catch (e) {
    console.error("Failed to parse JSON", cleanedText);
    throw new Error("AI response was not valid JSON. Please try again.");
  }

  // Extract grounding metadata sources
  // The structure is response.candidates[0].groundingMetadata.groundingChunks
  const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
  
  if (groundingChunks && Array.isArray(groundingChunks)) {
    const webSources = groundingChunks
      .map((chunk: any) => chunk.web?.uri)
      .filter((uri: any) => typeof uri === 'string');
      
    // Merge provided sources with search sources, removing duplicates
    const existingSources = result.sources || [];
    result.sources = [...new Set([...existingSources, ...webSources])];
  }

  return result;
};