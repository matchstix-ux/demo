// netlify/functions/recommend.js

const fallbackCigars = [
  {
    name: "Padron 1964 Anniversary Exclusivo",
    brand: "Padron",
    wrapper: "Habano Maduro",
    origin: "Nicaragua",
    strength: 4,
    priceTier: "luxury",
    flavorNotes: ["chocolate", "coffee", "leather", "spice"]
  },
  {
    name: "Montecristo White Robusto",
    brand: "Montecristo",
    wrapper: "Connecticut Shade",
    origin: "Dominican Republic",
    strength: 2,
    priceTier: "mid-range",
    flavorNotes: ["cedar", "cream", "almond"]
  },
  {
    name: "Oliva Serie V Melanio",
    brand: "Oliva",
    wrapper: "Sumatra",
    origin: "Nicaragua",
    strength: 3,
    priceTier: "premium",
    flavorNotes: ["chocolate", "pepper", "earth"]
  }
];

// ⛑ Dummy OpenAI function — replace later
async function getOpenAIRecommendations(cigarName) {
  // If you don't have real OpenAI calls yet, just simulate:
  return [
    {
      name: `AI Pick for ${cigarName}`,
      brand: "Simulated Brand",
      wrapper: "Ecuador Sumatra",
      origin: "Honduras",
      strength: 3,
      priceTier: "mid-range",
      flavorNotes: ["coffee", "leather", "cedar"]
    }
  ];
}

// ✅ Safe fallback logic
function getFallbackRecommendations(cigarName) {
  return fallbackCigars;
}

exports.handler = async function(event, context) {
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
    let requestBody = {};
    try {
      const bodySize = event.body ? event.body.length : 0;
      if (bodySize > 10000) {
        return {
          statusCode: 413,
          headers: CORS,
          body: JSON.stringify({ error: "Request body too large" })
        };
      }

      requestBody = JSON.parse(event.body || "{}");
      cigarName = requestBody.query || requestBody.cigarName || "";

    } catch (parseError) {
      return { 
        statusCode: 400, 
        headers: CORS, 
        body: JSON.stringify({ 
          error: "Bad request", 
          details: "Could not parse request body as JSON" 
        }) 
      };
    }

    if (!cigarName.trim()) {
      return { 
        statusCode: 400, 
        headers: CORS, 
        body: JSON.stringify({ error: "Missing cigar name" }) 
      };
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
