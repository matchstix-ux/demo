// netlify/functions/recommend.js

import { Configuration, OpenAIApi } from "openai";
import fallbackCigars from "./fallbackCigars.js"; // Your local list

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

function getFallbackRecommendations(query) {
  const lowerQuery = query.toLowerCase();
  return fallbackCigars
    .filter(cigar =>
      cigar.name.toLowerCase().includes(lowerQuery) ||
      cigar.brand.toLowerCase().includes(lowerQuery) ||
      (cigar.flavorNotes || []).some(note =>
        note.toLowerCase().includes(lowerQuery)
      )
    )
    .slice(0, 3);
}

async function getOpenAIRecommendations(cigarName) {
  const prompt = `
You are an AI cigar sommelier. Return exactly 3 recommended premium cigars based on the user's input: "${cigarName}". 
Response must be a JSON array with this structure:

[
  {
    "name": "Cigar Name",
    "brand": "Brand Name",
    "strength": 1-5,
    "priceTier": "$" | "$$" | "$$$" | "$$$$",
    "flavorNotes": ["note1", "note2", "note3"]
  }
]

Rules:
- NO Cuban cigars or brands
- Strength: 1 = mild, 5 = full-bodied
- Flavor notes should be real cigar tasting notes (coffee, cedar, earth, etc)
- Keep names and brands realistic, preferably ones sold in the US
`;

  const completion = await openai.createChatCompletion({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
    max_tokens: 500,
  });

  const rawText = completion.data.choices?.[0]?.message?.content?.trim() || "[]";

  try {
    const result = JSON.parse(rawText);
    if (Array.isArray(result)) return result;
    throw new Error("Result was not an array");
  } catch (err) {
    console.error("OpenAI result parse failed:", err.message);
    return [];
  }
}

export const handler = async function(event, context) {
  const CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST,OPTIONS",
    "Access-Control-Allow-Headers": "content-type,authorization",
    "Content-Type": "application/json"
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: CORS, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  let cigarName = "";

  try {
    const bodySize = event.body ? event.body.length : 0;
    if (bodySize > 10000) {
      return {
        statusCode: 413,
        headers: CORS,
        body: JSON.stringify({ error: "Request body too large" })
      };
    }

    const requestBody = JSON.parse(event.body || "{}");
    cigarName = requestBody.query || requestBody.cigarName || "";

    if (!cigarName.trim()) {
      return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: "Missing cigar name" }) };
    }

    let recommendations = await getOpenAIRecommendations(cigarName);

    if (!recommendations || recommendations.length === 0) {
      recommendations = getFallbackRecommendations(cigarName);
    }

    return {
      statusCode: 200,
      headers: CORS,
      body: JSON.stringify(recommendations)
    };

  } catch (err) {
    console.error("Top-level failure:", err.message);
    try {
      const fallback = getFallbackRecommendations(cigarName || "");
      return { statusCode: 200, headers: CORS, body: JSON.stringify(fallback) };
    } catch (fallbackErr) {
      console.error("Fallback also failed:", fallbackErr.message);
      return {
        statusCode: 500,
        headers: CORS,
        body: JSON.stringify({ 
          error: "All systems failed", 
          details: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message 
        })
      };
    }
  }
};
