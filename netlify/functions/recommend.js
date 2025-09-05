// netlify/functions/recommend.js

// Enhanced cigar database with price field REMOVED
const fallbackCigars = [
  {
    name: "Padron 1964 Anniversary",
    brand: "Padron",
    wrapper: "Habano Maduro",
    origin: "Nicaragua",
    body: 4,
    strength: 4,
    priceTier: "premium",
    flavorNotes: ["chocolate", "coffee", "leather", "spice"]
  },
  {
    name: "Romeo y Julieta 1875",
    brand: "Romeo y Julieta",
    wrapper: "Connecticut",
    origin: "Dominican Republic",
    body: 2,
    strength: 1,
    priceTier: "mid-range",
    flavorNotes: ["cedar", "cream", "nuts", "mild spice"]
  },
  {
    name: "Montecristo White",
    brand: "Montecristo",
    wrapper: "Connecticut Shade",
    origin: "Dominican Republic",
    body: 2,
    strength: 1,
    priceTier: "mid-range",
    flavorNotes: ["cream", "cedar", "vanilla", "nuts"]
  },
  {
    name: "CAO Brazilia",
    brand: "CAO",
    wrapper: "Brazilian Maduro",
    origin: "Nicaragua",
    body: 4,
    strength: 4,
    priceTier: "mid-range",
    flavorNotes: ["chocolate", "coffee", "earth", "sweetness"]
  },
  {
    name: "Arturo Fuente Hemingway",
    brand: "Arturo Fuente",
    wrapper: "Cameroon",
    origin: "Dominican Republic",
    body: 3,
    strength: 3,
    priceTier: "premium",
    flavorNotes: ["cedar", "spice", "leather", "earth"]
  },
  {
    name: "Ashton Classic",
    brand: "Ashton",
    wrapper: "Connecticut Shade",
    origin: "Dominican Republic",
    body: 2,
    strength: 1,
    priceTier: "premium",
    flavorNotes: ["cream", "nuts", "cedar", "mild spice"]
  },
  {
    name: "Rocky Patel Decade",
    brand: "Rocky Patel",
    wrapper: "Ecuador Habano",
    origin: "Nicaragua",
    body: 3,
    strength: 4,
    priceTier: "mid-range",
    flavorNotes: ["coffee", "chocolate", "pepper", "cedar"]
  },
  {
    name: "Oliva Serie V Melanio",
    brand: "Oliva",
    wrapper: "Ecuador Habano",
    origin: "Nicaragua",
    body: 4,
    strength: 5,
    priceTier: "premium",
    flavorNotes: ["coffee", "chocolate", "pepper", "leather"]
  },
  {
    name: "Perdomo Champagne",
    brand: "Perdomo",
    wrapper: "Connecticut Shade",
    origin: "Nicaragua",
    body: 2,
    strength: 2,
    priceTier: "budget",
    flavorNotes: ["cream", "vanilla", "nuts", "mild spice"]
  },
  {
    name: "My Father Le Bijou 1922",
    brand: "My Father",
    wrapper: "Ecuador Habano Oscuro",
    origin: "Nicaragua",
    body: 4,
    strength: 5,
    priceTier: "premium",
    flavorNotes: ["pepper", "chocolate", "coffee", "earth"]
  },
  {
    name: "Drew Estate Liga Privada No. 9",
    brand: "Drew Estate",
    wrapper: "Connecticut Broadleaf",
    origin: "Nicaragua",
    body: 5,
    strength: 5,
    priceTier: "premium",
    flavorNotes: ["espresso", "cocoa", "pepper", "earth"]
  },
  {
    name: "Alec Bradley Prensado",
    brand: "Alec Bradley",
    wrapper: "Honduran Corojo",
    origin: "Honduras",
    body: 4,
    strength: 4,
    priceTier: "premium",
    flavorNotes: ["chocolate", "spice", "coffee", "oak"]
  },
  {
    name: "La Aroma de Cuba Mi Amor",
    brand: "La Aroma de Cuba",
    wrapper: "San Andres Maduro",
    origin: "Nicaragua",
    body: 4,
    strength: 4,
    priceTier: "mid-range",
    flavorNotes: ["cocoa", "pepper", "earth", "espresso"]
  },
  {
    name: "San Cristobal Revelation",
    brand: "San Cristobal",
    wrapper: "Ecuador Sumatra",
    origin: "Nicaragua",
    body: 3,
    strength: 3,
    priceTier: "mid-range",
    flavorNotes: ["cedar", "cocoa", "nuts", "spice"]
  },
  {
    name: "EP Carrillo Encore",
    brand: "EP Carrillo",
    wrapper: "Nicaraguan",
    origin: "Nicaragua",
    body: 3,
    strength: 3,
    priceTier: "mid-range",
    flavorNotes: ["cedar", "caramel", "cream", "spice"]
  },
  {
    name: "Camacho Corojo",
    brand: "Camacho",
    wrapper: "Honduran Corojo",
    origin: "Honduras",
    body: 4,
    strength: 5,
    priceTier: "mid-range",
    flavorNotes: ["cedar", "leather", "pepper", "earth"]
  },
  {
    name: "Joya de Nicaragua Antaño 1970",
    brand: "Joya de Nicaragua",
    wrapper: "Nicaraguan Habano",
    origin: "Nicaragua",
    body: 5,
    strength: 5,
    priceTier: "budget",
    flavorNotes: ["pepper", "leather", "earth", "cocoa"]
  },
  {
    name: "Aging Room Quattro Nicaragua",
    brand: "Aging Room",
    wrapper: "Nicaraguan",
    origin: "Nicaragua",
    body: 4,
    strength: 4,
    priceTier: "mid-range",
    flavorNotes: ["cedar", "cocoa", "earth", "spice"]
  },
  {
    name: "Davidoff Nicaragua",
    brand: "Davidoff",
    wrapper: "Nicaraguan Habano",
    origin: "Nicaragua",
    body: 3,
    strength: 3,
    priceTier: "luxury",
    flavorNotes: ["white pepper", "leather", "coffee", "earth"]
  },
  {
    name: "Tatuaje Miami Reserva",
    brand: "Tatuaje",
    wrapper: "Ecuador Habano",
    origin: "Nicaragua",
    body: 4,
    strength: 4,
    priceTier: "premium",
    flavorNotes: ["earth", "cedar", "pepper", "leather"]
  },
  {
    name: "Avo Classic",
    brand: "Avo",
    wrapper: "Ecuador Connecticut",
    origin: "Dominican Republic",
    body: 2,
    strength: 1,
    priceTier: "premium",
    flavorNotes: ["cream", "nuts", "toast", "mild spice"]
  },
  {
    name: "La Flor Dominicana Double Ligero",
    brand: "La Flor Dominicana",
    wrapper: "Ecuador Sumatra",
    origin: "Dominican Republic",
    body: 5,
    strength: 5,
    priceTier: "premium",
    flavorNotes: ["pepper", "earth", "leather", "spice"]
  },
  {
    name: "Arturo Fuente Don Carlos",
    brand: "Arturo Fuente",
    wrapper: "Cameroon",
    origin: "Dominican Republic",
    body: 3,
    strength: 3,
    priceTier: "premium",
    flavorNotes: ["cedar", "nutmeg", "leather", "sweetness"]
  },
  {
    name: "Perdomo Lot 23 Maduro",
    brand: "Perdomo",
    wrapper: "Nicaraguan Maduro",
    origin: "Nicaragua",
    body: 3,
    strength: 3,
    priceTier: "budget",
    flavorNotes: ["chocolate", "coffee", "earth", "spice"]
  },
  {
    name: "Flor de las Antillas",
    brand: "My Father",
    wrapper: "Nicaraguan Sun Grown",
    origin: "Nicaragua",
    body: 3,
    strength: 3,
    priceTier: "mid-range",
    flavorNotes: ["cocoa", "pepper", "cedar", "nutmeg"]
  },
  {
    name: "Macanudo Cafe",
    brand: "Macanudo",
    wrapper: "Connecticut Shade",
    origin: "Dominican Republic",
    body: 1,
    strength: 1,
    priceTier: "mid-range",
    flavorNotes: ["cream", "nuts", "hay", "mild spice"]
  },
  {
    name: "Cohiba Connecticut",
    brand: "Cohiba",
    wrapper: "Ecuador Connecticut",
    origin: "Dominican Republic",
    body: 2,
    strength: 2,
    priceTier: "luxury",
    flavorNotes: ["cream", "almond", "cedar", "honey"]
  },
  {
    name: "Alec Bradley Black Market Esteli",
    brand: "Alec Bradley",
    wrapper: "Nicaraguan",
    origin: "Nicaragua",
    body: 4,
    strength: 4,
    priceTier: "mid-range",
    flavorNotes: ["pepper", "earth", "cocoa", "sweet spice"]
  },
  {
    name: "Punch Rare Corojo",
    brand: "Punch",
    wrapper: "Sumatra",
    origin: "Honduras",
    body: 4,
    strength: 4,
    priceTier: "mid-range",
    flavorNotes: ["spice", "earth", "cedar", "sweetness"]
  },
  {
    name: "Oliva Connecticut Reserve",
    brand: "Oliva",
    wrapper: "Ecuador Connecticut",
    origin: "Nicaragua",
    body: 2,
    strength: 2,
    priceTier: "mid-range",
    flavorNotes: ["cream", "toast", "nuts", "mild spice"]
  },
  {
    name: "Joya de Nicaragua Cuatro Cinco",
    brand: "Joya de Nicaragua",
    wrapper: "Nicaraguan",
    origin: "Nicaragua",
    body: 3,
    strength: 3,
    priceTier: "premium",
    flavorNotes: ["oak", "coffee", "pepper", "dark chocolate"]
  },
  {
    name: "EP Carrillo Pledge",
    brand: "EP Carrillo",
    wrapper: "Connecticut Habano",
    origin: "Dominican Republic",
    body: 4,
    strength: 5,
    priceTier: "premium",
    flavorNotes: ["pepper", "cocoa", "oak", "spice"]
  },
  {
    name: "H. Upmann 1844 Reserve",
    brand: "H. Upmann",
    wrapper: "Ecuador Habano",
    origin: "Dominican Republic",
    body: 3,
    strength: 3,
    priceTier: "mid-range",
    flavorNotes: ["cedar", "earth", "spice", "nuts"]
  },
  {
    name: "Brick House",
    brand: "Brick House",
    wrapper: "Nicaraguan Habano",
    origin: "Nicaragua",
    body: 3,
    strength: 3,
    priceTier: "budget",
    flavorNotes: ["cedar", "pepper", "nuts", "earth"]
  },
  {
    name: "Crowned Heads Four Kicks",
    brand: "Crowned Heads",
    wrapper: "Ecuador Habano",
    origin: "Nicaragua",
    body: 3,
    strength: 3,
    priceTier: "mid-range",
    flavorNotes: ["cedar", "spice", "earth", "toast"]
  },
  {
    name: "AJ Fernandez New World Oscuro",
    brand: "AJ Fernandez",
    wrapper: "Nicaraguan Oscuro",
    origin: "Nicaragua",
    body: 4,
    strength: 4,
    priceTier: "budget",
    flavorNotes: ["coffee", "pepper", "earth", "dark chocolate"]
  },
  {
    name: "Kristoff Ligero Maduro",
    brand: "Kristoff",
    wrapper: "Brazilian Maduro",
    origin: "Dominican Republic",
    body: 5,
    strength: 5,
    priceTier: "mid-range",
    flavorNotes: ["chocolate", "espresso", "pepper", "earth"]
  },
  {
    name: "Villiger La Flor de Ynclan",
    brand: "Villiger",
    wrapper: "Ecuador",
    origin: "Dominican Republic",
    body: 3,
    strength: 2,
    priceTier: "mid-range",
    flavorNotes: ["cream", "cedar", "nutmeg", "sweetness"]
  },
  {
    name: "Room101 Farce",
    brand: "Room101",
    wrapper: "Ecuador Habano",
    origin: "Dominican Republic",
    body: 3,
    strength: 3,
    priceTier: "mid-range",
    flavorNotes: ["cedar", "spice", "earth", "nuts"]
  },
  {
    name: "Hoyo de Monterrey Excalibur",
    brand: "Hoyo de Monterrey",
    wrapper: "Connecticut Shade",
    origin: "Honduras",
    body: 2,
    strength: 2,
    priceTier: "mid-range",
    flavorNotes: ["cream", "cedar", "toast", "mild spice"]
  },
  {
    name: "La Gloria Cubana Serie R",
    brand: "La Gloria Cubana",
    wrapper: "Ecuador Sumatra",
    origin: "Dominican Republic",
    body: 4,
    strength: 4,
    priceTier: "mid-range",
    flavorNotes: ["spice", "cedar", "earth", "leather"]
  },
  {
    name: "Romeo y Julieta Reserva Real",
    brand: "Romeo y Julieta",
    wrapper: "Ecuador Connecticut",
    origin: "Dominican Republic",
    body: 2,
    strength: 2,
    priceTier: "mid-range",
    flavorNotes: ["cream", "nuts", "cedar", "honey"]
  },
  {
    name: "Foundation Charter Oak Shade",
    brand: "Foundation",
    wrapper: "Connecticut Shade",
    origin: "Nicaragua",
    body: 1,
    strength: 1,
    priceTier: "budget",
    flavorNotes: ["cream", "cedar", "toast", "nuts"]
  },
  {
    name: "Diesel Unholy Cocktail",
    brand: "Diesel",
    wrapper: "Pennsylvania Broadleaf",
    origin: "Nicaragua",
    body: 5,
    strength: 5,
    priceTier: "budget",
    flavorNotes: ["espresso", "pepper", "earth", "chocolate"]
  },
  {
    name: "Quesada Oktoberfest 2021",
    brand: "Quesada",
    wrapper: "Mexican San Andres",
    origin: "Dominican Republic",
    body: 4,
    strength: 4,
    priceTier: "mid-range",
    flavorNotes: ["chocolate", "spice", "earth", "malt"]
  },
  {
    name: "Illusione Rothchildes",
    brand: "Illusione",
    wrapper: "San Andres Maduro",
    origin: "Nicaragua",
    body: 3,
    strength: 3,
    priceTier: "mid-range",
    flavorNotes: ["cocoa", "coffee", "pepper", "earth"]
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

function sanitizeInput(input) {
  if (typeof input !== 'string') return '';
  if (input.length > 100) return input.slice(0, 100);
  return input.replace(/[<>]/g, '').replace(/\n|\r/g, ' ').trim();
}

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
      if (controller) controller.abort();
    }, OPENAI_CONFIG.timeout);

    const sanitizedInput = sanitizeInput(cigarName);

    const prompt = `You are a cigar expert. A user is looking for recommendations based on: "${sanitizedInput}". Recommend exactly 3 cigars that are currently available for sale in the United States. Do NOT include Cuban cigars. Respond with ONLY a valid JSON array of exactly 3 cigar objects, each including: name, brand, wrapper, origin, body (1-5), strength (1-5), priceTier, and flavorNotes (array of strings). Do not include any explanation or additional text - just the JSON array.`;

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
        temperature: 0.9
      }),
      signal: controller.signal
    });

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

function shuffle(array) {
  if (!Array.isArray(array)) return [];
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function calculateSimilarity(c1, c2) {
  if (!c1 || !c2 || typeof c1 !== 'object' || typeof c2 !== 'object') {
    return 0;
  }
  let score = 0;

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

  if (c1.priceTier && c2.priceTier) {
    if (c1.priceTier === c2.priceTier) score += 2;
    else if (
      (c1.priceTier === 'mid-range' && c2.priceTier === 'premium') ||
      (c1.priceTier === 'premium' && c2.priceTier === 'mid-range')
    ) {
      score += 1;
    }
  }

  if (typeof c1.body === 'number' && typeof c2.body === 'number') {
    const diff = Math.abs(c1.body - c2.body);
    if (diff === 0) score += 6;
    else if (diff === 1) score += 3;
    else if (diff === 2) score += 1;
    else score -= 2;
  }

  if (typeof c1.strength === 'number' && typeof c2.strength === 'number') {
    const diff = Math.abs(c1.strength - c2.strength);
    if (diff === 0) score += 10;
    else if (diff === 1) score += 6;
    else if (diff === 2) score += 2;
    else if (diff === 3) score -= 4;
    else if (diff >= 4) score -= 8;
  }

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
    const goodMatches = candidates.filter(c => c.similarity > 0);
    if (goodMatches.length >= 3) {
      recs = shuffle(goodMatches.slice(0, 12)).slice(0, 3).map(x => x.cigar);
    } else {
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
    recs.push(...shuffle(remaining).slice(0, 3 - recs.length));
  }
  return recs.slice(0, 3);
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
