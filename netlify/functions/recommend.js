// netlify/functions/recommend.js

// (Everything else above this line is unchanged…)

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

      // ✅ FIXED LINE: accepts both 'query' and 'cigarName'
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

    if (process.env.NODE_ENV !== 'production') {
      console.log("Trying OpenAI recommendation for:", cigarName);
    }

    let recommendations = await getOpenAIRecommendations(cigarName);

    if (!recommendations || recommendations.length === 0) {
      if (process.env.NODE_ENV !== 'production') {
        console.log("Using fallback logic");
      }
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
