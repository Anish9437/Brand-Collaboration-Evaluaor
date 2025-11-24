import { BrandData } from "../types";

export const fetchBrandData = async (brandName: string, apiKey: string): Promise<any> => {
  if (!apiKey) {
    console.warn("No Tracxn API key provided. Skipping fetch.");
    return null;
  }

  // Using the endpoint structure provided in the prompt requirements
  const url = `https://api.tracxn.com/company?query=${encodeURIComponent(brandName)}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
    });

    if (!response.ok) {
        console.warn(`Tracxn API error: ${response.status} ${response.statusText}`);
        return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.warn("Tracxn fetch failed:", error);
    return null;
  }
};