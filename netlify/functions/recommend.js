// netlify/functions/recommend.js

import OpenAI from "openai";
import fallbackCigars from "./fallbackCigars.js";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST,OPTIONS",
  "Access-Control-Allow-Headers": "content-type,authorization",
  "Content-Type": "application/json",
};

function normalizeStrength(value) {
  if (typeof value === "number") return Math.max(1, Math.min(5, value));
  const num = Number(value);
  if (!Number.isNaN(num)) return Math.max(1, Math.min(5, num));
  return 3;
}

function normalizePriceTier(value) {
  const v = String(value || "").trim().toLowerCase();

  if (["$", "budget", "value"].includes(v)) return "budget";
  if (["$$", "mid", "mid-range", "midrange"].includes(v)) return "mid-range";
  if (["$$$", "premium"].includes(v)) return "premium";
  if (["$$$$", "luxury"].includes(v)) return "luxury";

  return "premium";
}

function normalizeFlavorNotes(notes) {
  if (!Array.isArray(notes)) return [];
  return notes
    .map((note) => String(note || "").trim())
    .filter(Boolean)
    .slice(0, 5);
}

function normalizeCigar(cigar) {
  if (!cigar || typeof cigar !== "object") return null;
  if (!cigar.name || !cigar.brand) return null;

  return {
    name: String(cigar.name).trim(),
    brand: String(cigar.brand).trim(),
    strength: normalizeStrength(cigar.strength),
    priceTier: normalizePriceTier(cigar.priceTier),
    flavorNotes: normalizeFlavorNotes(cigar.flavorNotes),
  };
}

function getCigarKey(cigar) {
  return `${String(cigar.brand || "").trim().toLowerCase()}::${String(cigar.name || "").trim().toLowerCase()}`;
}

function dedupeCigars(cigars) {
  const seen = new Set();
  const clean = [];

  for (const cigar of cigars) {
    const normalized = normalizeCigar(cigar);
    if (!normalized) continue;

    const key = getCigarKey(normalized);
    if (seen.has(key)) continue;

    seen.add(key);
    clean.push(normalized);
  }

  return clean;
}

function getFallbackRecommendations(query, exclusions = []) {
  const lowerQuery = String(query || "").toLowerCase().trim();
  const excludedKeys = new Set(exclusions.map((x) => String(x).toLowerCase()));

  const matches = fallbackCigars.filter((cigar) => {
    const key = getCigarKey(cigar);
    if (excludedKeys.has(key)) return false;

    if (!lowerQuery) return true;

    return (
      cigar.name?.toLowerCase().includes(lowerQuery) ||
      cigar.brand?.toLowerCase().includes(lowerQuery) ||
      (cigar.flavorNotes || []).some((note) =>
        String(note).toLowerCase().includes(lowerQuery)
      )
    );
  });

  return dedupeCigars(matches).slice(0, 3);
}

function extractJSONArray(text) {
  const start = text.indexOf("[");
  const end = text.lastIndexOf("]");
  if (start === -1 || end === -1 || end < start) return "[]";
  return text.slice(start, end + 1);
}

async function getOpenAIRecommendations(query, exclusions = [], liked = []) {
  const prompt = `
You are an AI cigar sommelier.

User query: "${query}"

Already seen or rejected cigars to exclude:
${JSON.stringify(exclusions)}

Liked cigars to use as positive taste signal:
${JSON.stringify(liked)}

Return exactly 3 recommended non-Cuban cigars sold in the US.

Return ONLY a JSON array with this structure:
[
  {
    "name": "Cigar Name",
    "brand": "Brand Name",
    "strength": 1,
    "priceTier": "budget" | "mid-range" | "premium" | "luxury",
    "flavorNotes": ["note1", "note2", "note3"]
  }
]

Rules:
- No markdown
- No explanation text
- No Cuban cigars
- Strength must be 1 to 5
- Flavor notes should be realistic
- Avoid any cigar present in the exclusion list
`;

  const completion = await client.chat.completions.create({
    model: "gpt-4o",
    temperature: 0.7,
    max_tokens: 500,
    messages: [{ role: "user", content: prompt }],
  });

  const rawText = completion.choices?.[0]?.message?.content?.trim() || "[]";
  const jsonText = extractJSONArray(rawText);

  try {
    const parsed = JSON.parse(jsonText);
    return dedupeCigars(Array.isArray(parsed) ? parsed : []).slice(0, 3);
  } catch (err) {
    console.error("OpenAI parse failed:", err.message);
    return [];
  }
}

export const handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: CORS, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: CORS,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const bodySize = event.body ? event.body.length : 0;
    if (bodySize > 10000) {
      return {
        statusCode: 413,
        headers: CORS,
        body: JSON.stringify({ error: "Request body too large" }),
      };
    }

    const requestBody = JSON.parse(event.body || "{}");
    const query = String(requestBody.query || requestBody.cigarName || "").trim();

    if (!query) {
      return {
        statusCode: 400,
        headers: CORS,
        body: JSON.stringify({ error: "Missing cigar name" }),
      };
    }

    const liked = Array.isArray(requestBody.liked) ? requestBody.liked : [];
    const disliked = Array.isArray(requestBody.disliked) ? requestBody
