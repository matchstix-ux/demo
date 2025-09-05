// netlify/functions/recommend.js

// Enhanced cigar database with price field added
const fallbackCigars = [
  {
    name: "Padron 1964 Anniversary Exclusivo",
    brand: "Padron",
    wrapper: "Habano Maduro",
    origin: "Nicaragua",
    body: 4,
    strength: 4,
    priceTier: "premium",
    price: "$25-35", // FIXED: Added missing price field
    flavorNotes: ["chocolate", "coffee", "leather", "spice"]
  },
  {
    name: "Romeo y Julieta 1875 Robusto",
    brand: "Romeo y Julieta",
    wrapper: "Connecticut",
    origin: "Dominican Republic",
    body: 2,
    strength: 1,
    priceTier: "mid-range",
    price: "$6-10",
    flavorNotes: ["cedar", "cream", "nuts", "mild spice"]
  },
  {
    name: "Montecristo White Robusto",
    brand: "Montecristo",
    wrapper: "Connecticut Shade",
    origin: "Dominican Republic",
    body: 2,
    strength: 1,
    priceTier: "mid-range",
    price: "$8-12",
    flavorNotes: ["cream", "cedar", "vanilla", "nuts"]
  },
  {
    name: "CAO Brazilia Gol",
    brand: "CAO",
    wrapper: "Brazilian Maduro",
    origin: "Nicaragua",
    body: 4,
    strength: 4,
    priceTier: "mid-range",
    price: "$7-11",
    flavorNotes: ["chocolate", "coffee", "earth", "sweetness"]
  },
  {
    name: "Arturo Fuente Hemingway Classic",
    brand: "Arturo Fuente",
    wrapper: "Cameroon",
    origin: "Dominican Republic",
    body: 3,
    strength: 2,
    priceTier: "premium",
    price: "$12-18",
    flavorNotes: ["cedar", "spice", "leather", "earth"]
  },
  {
    name: "Ashton Classic Corona",
    brand: "Ashton",
    wrapper: "Connecticut Shade",
    origin: "Dominican Republic",
    body: 2,
    strength: 1,
    priceTier: "premium",
    price: "$10-15",
    flavorNotes: ["cream", "nuts", "cedar", "mild spice"]
  },
  {
    name: "Rocky Patel Decade Robusto",
    brand: "Rocky Patel",
    wrapper: "Ecuador Habano",
    origin: "Nicaragua",
    body: 3,
    strength: 3,
    priceTier: "mid-range",
    price: "$8-12",
    flavorNotes: ["coffee", "chocolate", "pepper", "cedar"]
  },
  {
    name: "Oliva Serie V Melanio Robusto",
    brand: "Oliva",
    wrapper: "Ecuador Habano",
    origin: "Nicaragua",
    body: 4,
    strength: 5,
    priceTier: "premium",
    price: "$10-16",
    flavorNotes: ["coffee", "chocolate", "pepper", "leather"]
  },
  {
    name: "Perdomo Champagne Robusto",
    brand: "Perdomo",
    wrapper: "Connecticut Shade",
    origin: "Nicaragua",
    body: 2,
    strength: 2,
    priceTier: "budget",
    price: "$5-8",
    flavorNotes: ["cream", "vanilla", "nuts", "mild spice"]
  },
  {
    name: "My Father Le Bijou 1922 Robusto",
    brand: "My Father",
    wrapper: "Ecuador Habano Oscuro",
    origin: "Nicaragua",
    body: 4,
    strength: 5,
    priceTier: "premium",
    price: "$12-18",
    flavorNotes: ["pepper", "chocolate", "coffee", "earth"]
  }
];

// OpenAI Configuration
const OPENAI_CONFIG = {
  apiKey: process.env.OPENAI_API_KEY,
  endpoint: "https://api.openai.com/v1/chat/completions",
  model: "gpt-4o-mini",
  timeout: 8000,
  maxResponseSize: 50000
};

// FIXED: Input sanitization function
function sanitizeInput(input) {
  if (typeof input !== 'string') return '';
  if (input.length > 100) return input.slice(0, 100); // Prevent excessively long inputs
  // Remove potential prompt injection patterns
  return input.replace(/[<>]/g, '').replace(/\n|\r/g, ' ').trim();
}

// Safe string operations helper
function safeStringOperation(value, operation = 'toLowerCase') {
  if (value === null || value === undefined) return '';
  try {
    const str = typeof value === 'string' ? value : String(value);
    return operation === 'toLowerCase' ? str.toLowerCase() : str;
  } catch (error) {
    console.warn('Safe string operation failed:', error.message);
    return '';
  }
}

// Function to get recommendations from OpenAI
async function getOpenAIRecommendations(cigarName) {
  if (!OPENAI_CONFIG.apiKey) {
    if (process.env.NODE_ENV !== 'production') {
      console.log('OpenAI API key not configured, using fallback');
    }
    return null;
  }

  let controller;
  let timeoutId;

  try {
    controller = new AbortController();
    timeoutId = setTimeout(() => {
      if (controller) controller.abort(); // FIXED: Check controller exists
    }, OPENAI_CONFIG.timeout);

    // FIXED: Sanitize input to prevent prompt injection
    const sanitizedInput = sanitizeInput(cigarName);
    
    const prompt = `You are a cigar expert. A user is looking for recommendations based on: "${sanitizedInput}"

Here is my cigar database to choose from:
${JSON.stringify(fallbackCigars, null, 2)}

Please analyze the user's input and recommend exactly 3 cigars from this database that would be good matches. Consider:
- If they mention a specific brand/cigar, find similar ones (similar strength, flavor notes)  
- If they mention flavors, find cigars with those or complementary notes
- If they mention strength preference, match accordingly
- Provide variety in your selections when possible
- DO NOT recommend the exact cigar they searched for

Respond with ONLY a valid JSON array of exactly 3 cigar objects from the database above. Do not include any explanation or additional text - just the JSON array.`;

    const response = await fetch(OPENAI_CONFIG.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_CONFIG.apiKey}`
      },
      body: JSON.stringify({
        model: OPENAI_CONFIG.model,
        messages: [
          {
            role: "system",
            content: "You are a cigar recommendation expert. Always respond with valid JSON arrays only, no additional text."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 1500,
        temperature: 0.7
      }),
      signal: controller.signal
    });

    // FIXED: Proper timeout cleanup
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }

    if (!response.ok) {
      throw new Error(`OpenAI API returned ${response.status}: ${response.statusText}`);
    }

    const contentLength = response.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > OPENAI_CONFIG.maxResponseSize) {
      throw new Error('Response too large');
    }

    const data = await response.json();
    
    if (!data || !data.choices || !Array.isArray(data.choices) || data.choices.length === 0) {
      throw new Error('Invalid response structure from OpenAI');
    }

    const content = data.choices[0]?.message?.content?.trim();
    
    if (!content) {
      throw new Error('Empty response from OpenAI');
    }

    if (content.length > OPENAI_CONFIG.maxResponseSize) {
      throw new Error('Response content too large');
    }

    try {
      // FIXED: Strip markdown formatting that OpenAI sometimes adds
      let cleanContent = content;
      if (content.startsWith('```json')) {
        cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      }
      
      const recommendations = JSON.parse(cleanContent);
      
      if (Array.isArray(recommendations) && recommendations.length > 0) {
        if (process.env.NODE_ENV !== 'production') {
          console.log(`OpenAI returned ${recommendations.length} recommendations`);
        }
        return recommendations.slice(0, 3);
      } else {
        throw new Error('Invalid recommendations format');
      }
    } catch (parseError) {
      console.warn('Failed to parse OpenAI response:', parseError.message);
      return null;
    }

  } catch (error) {
    // FIXED: Ensure timeout is always cleaned up
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    if (error.name === 'AbortError') {
      console.warn('OpenAI API call timed out');
    } else {
      console.warn('OpenAI API call failed:', error.message);
    }
    return null;
  }
}

// Detect Cuban cigars with safe string operations
function isCuban(cigar) {
  if (!cigar || typeof cigar !== 'object') return false;
  
  const check = (field) => {
    const str = safeStringOperation(field);
    return str.includes('cuba') || str.includes('cuban');
  };
  
  return (
    check(cigar.origin) ||
    check(cigar.country) ||
    (cigar.brand && safeStringOperation(cigar.brand).includes('cuaba'))
  );
}

// FIXED: Fisher-Yates shuffle with correct minus operator
function shuffle(array) {
  if (!Array.isArray(array)) return [];
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) { // FIXED: Was i–
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Similarity scoring with FIXED strength matching
function calculateSimilarity(c1, c2) {
  if (!c1 || !c2 || typeof c1 !== 'object' || typeof c2 !== 'object') {
    return 0;
  }

  let score = 0;

  // Wrapper similarity
  if (c1.wrapper && c2.wrapper) {
    const w1 = safeStringOperation(c1.wrapper);
    const w2 = safeStringOperation(c2.wrapper);
    if (w1 === w2) score += 4;
    else if (
      (w1.includes('maduro') && w2.includes('maduro')) ||
      (w1.includes('connecticut') && w2.includes('connecticut')) ||
      (w1.includes('habano') && w2.includes('habano')) ||
      (w1.includes('corojo') && w2.includes('corojo')) ||
      (w1.includes('broadleaf') && w2.includes('broadleaf'))
    ) {
      score += 2;
    } else if (
      (w1.includes('ecuador') && w2.includes('ecuador')) ||
      (w1.includes('sun grown') && w2.includes('sun grown'))
    ) {
      score += 1;
    }
  }

  // Origin similarity
  if (c1.origin && c2.origin) {
    const o1 = safeStringOperation(c1.origin);
    const o2 = safeStringOperation(c2.origin);
    if (o1 === o2) score += 3;
    else if (
      (o1 === 'nicaragua' && o2 === 'honduras') ||
      (o1 === 'honduras' && o2 === 'nicaragua')
    ) {
      score += 1;
    }
  }

  // Price tier similarity
  if (c1.priceTier && c2.priceTier) {
    if (c1.priceTier === c2.priceTier) score += 2;
    else if (
      (c1.priceTier === 'mid-range' && c2.priceTier === 'premium') ||
      (c1.priceTier === 'premium' && c2.priceTier === 'mid-range')
    ) {
      score += 1;
    }
  }

  // Body similarity (also important)
  if (typeof c1.body === 'number' && typeof c2.body === 'number') {
    const diff = Math.abs(c1.body - c2.body);
    if (diff === 0) score += 6; // Exact body match
    else if (diff === 1) score += 3; // Close body
    else if (diff === 2) score += 1; // Moderate difference
    else score -= 2; // Big body difference - small penalty
  }

  // CRITICAL FIX: Strength similarity - now properly weighted and penalized
  if (typeof c1.strength === 'number' && typeof c2.strength === 'number') {
    const diff = Math.abs(c1.strength - c2.strength);
    if (diff === 0) score += 10;      // Perfect match: highest weight
    else if (diff === 1) score += 6;  // Close match: still very good
    else if (diff === 2) score += 2;  // Moderate: acceptable
    else if (diff === 3) score -= 4;  // Big difference: significant penalty
    else if (diff >= 4) score -= 8;   // Huge difference: major penalty
  }

  // Flavor notes similarity
  if (Array.isArray(c1.flavorNotes) && Array.isArray(c2.flavorNotes)) {
    const notes1 = c1.flavorNotes.map(n => safeStringOperation(n));
    const notes2 = c2.flavorNotes.map(n => safeStringOperation(n));

    const exactMatches = notes1.filter(note => notes2.includes(note));
    score += Math.min(exactMatches.length * 1.5, 5);

    const families = {
      earthy: ['earth', 'leather', 'tobacco', 'cedar', 'oak'],
      sweet: ['chocolate', 'cocoa', 'caramel', 'honey', 'cream', 'sweetness'],
      spicy: ['pepper', 'spice', 'cinnamon'],
      coffee: ['coffee', 'espresso']
    };

    Object.values(families).forEach(family => {
      const has1 = notes1.some(n => family.includes(n));
      const has2 = notes2.some(n => family.includes(n));
      if (has1 && has2) score += 0.5;
    });
  }

  return score;
}

// Fallback recommendations if OpenAI fails
function getFallbackRecommendations(cigarName) {
  const usCigars = fallbackCigars.filter(c => !isCuban(c));
  const input = safeStringOperation(cigarName.trim());
  
  const exactMatches = usCigars.filter(c =>
    (c.name && safeStringOperation(c.name).includes(input)) ||
    (c.brand && safeStringOperation(c.brand).includes(input))
  );
  
  const excluded = exactMatches.map(c => safeStringOperation(c.name || ''));

  let recs = [];

  if (exactMatches.length > 0) {
    const base = shuffle(exactMatches)[0];
    const candidates = usCigars
      .filter(c => c.name !== base.name && !excluded.includes(safeStringOperation(c.name || '')))
      .map(c => ({ cigar: c, similarity: calculateSimilarity(base, c) }))
      .sort((a, b) => b.similarity - a.similarity);
    
    // FIXED: Take best matches even if some are negative, but prefer positive ones
    const goodMatches = candidates.filter(c => c.similarity > 0);
    if (goodMatches.length >= 3) {
      recs = shuffle(goodMatches.slice(0, 12)).slice(0, 3).map(x => x.cigar);
    } else {
      // If not enough good matches, take the best available (even if negative)
      recs = candidates.slice(0, 3).map(x => x.cigar);
    }
  } else {
    const flavorMatches = usCigars.filter(c =>
      Array.isArray(c.flavorNotes) &&
      c.flavorNotes.some(note => input.includes(safeStringOperation(note)))
    );
    recs = flavorMatches.length > 0
      ? shuffle(flavorMatches).slice(0, 3)
      : shuffle(usCigars).slice(0, 3);
  }

  if (recs.length < 3) {
    const remaining = usCigars.filter(c =>
      !recs.some(r => r.name === c.name) &&
      !excluded.includes(safeStringOperation(c.name || ''))
    );
    recs.push(...shuffle(remaining).slice(0, 3 - recs.length)); // FIXED: Was …
  }

  return recs.slice(0, 3);
}

// Main handler
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
      // FIXED: Add size limit to prevent DoS attacks
      const bodySize = event.body ? event.body.length : 0;
      if (bodySize > 10000) { // 10KB limit
        return {
          statusCode: 413,
          headers: CORS,
          body: JSON.stringify({ error: "Request body too large" })
        };
      }
      
      requestBody = JSON.parse(event.body || "{}");
      cigarName = requestBody.cigarName || "";
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
