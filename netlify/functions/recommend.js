// netlify/functions/recommend.js

// Fallback cigar database (your local data)
const fallbackCigars = [
  {"name":"Padron 1964 Anniversary Maduro","brand":"Padron","strength":8,"priceRange":"$15-$20","flavorNotes":["Cocoa","Espresso","Earth"]},
  {"name":"Oliva Serie V Melanio","brand":"Oliva","strength":7,"priceRange":"$12-$18","flavorNotes":["Cedar","Spice","Chocolate"]},
  {"name":"EP Carrillo Encore","brand":"EP Carrillo","strength":6,"priceRange":"$11-$16","flavorNotes":["Caramel","Cedar","Earth"]},
  {"name":"My Father Le Bijou 1922","brand":"My Father","strength":8,"priceRange":"$10-$15","flavorNotes":["Pepper","Espresso","Cocoa"]},
  {"name":"Drew Estate Liga Privada No. 9","brand":"Drew Estate","strength":8,"priceRange":"$14-$18","flavorNotes":["Coffee","Cocoa","Spice"]},
  {"name":"Arturo Fuente Hemingway","brand":"Arturo Fuente","strength":5,"priceRange":"$8-$14","flavorNotes":["Cedar","Sweetness","Spice"]},
  {"name":"Romeo y Julieta Reserva Real Nicaragua","brand":"Romeo y Julieta","strength":6,"priceRange":"$8-$11","flavorNotes":["Hazelnut","Spice","Earth"]},
  {"name":"Perdomo 20th Anniversary Sun Grown","brand":"Perdomo","strength":7,"priceRange":"$10-$14","flavorNotes":["Spice","Oak","Coffee"]},
  {"name":"Alec Bradley Prensado","brand":"Alec Bradley","strength":7,"priceRange":"$10-$13","flavorNotes":["Leather","Cocoa","Pepper"]},
  {"name":"La Aroma de Cuba Mi Amor","brand":"La Aroma de Cuba","strength":6,"priceRange":"$9-$12","flavorNotes":["Cocoa","Espresso","Earth"]},
  {"name":"Rocky Patel Decade","brand":"Rocky Patel","strength":7,"priceRange":"$10-$14","flavorNotes":["Cedar","Spice","Nuts"]},
  {"name":"Montecristo Epic","brand":"Montecristo","strength":6,"priceRange":"$12-$18","flavorNotes":["Cocoa","Nuts","Cedar"]},
  {"name":"San Cristobal Revelation","brand":"San Cristobal","strength":6,"priceRange":"$9-$13","flavorNotes":["Cocoa","Leather","Spice"]},
  {"name":"Aging Room Quattro Nicaragua","brand":"Aging Room","strength":7,"priceRange":"$10-$13","flavorNotes":["Chocolate","Coffee","Pepper"]},
  {"name":"Ashton Symmetry","brand":"Ashton","strength":6,"priceRange":"$11-$15","flavorNotes":["Cedar","Spice","Cream"]},
  {"name":"La Flor Dominicana Double Ligero","brand":"La Flor Dominicana","strength":9,"priceRange":"$9-$13","flavorNotes":["Spice","Earth","Pepper"]},
  {"name":"Camacho Corojo","brand":"Camacho","strength":7,"priceRange":"$8-$12","flavorNotes":["Spice","Leather","Earth"]},
  {"name":"H. Upmann by AJ Fernandez","brand":"H. Upmann","strength":6,"priceRange":"$7-$10","flavorNotes":["Spice","Nuts","Cocoa"]},
  {"name":"Joya de Nicaragua Antano 1970","brand":"Joya de Nicaragua","strength":9,"priceRange":"$7-$12","flavorNotes":["Pepper","Earth","Leather"]},
  {"name":"Crowned Heads Mil Dias","brand":"Crowned Heads","strength":6,"priceRange":"$10-$13","flavorNotes":["Cream","Spice","Cedar"]},
  {"name":"Diesel Unholy Cocktail","brand":"Diesel","strength":8,"priceRange":"$6-$9","flavorNotes":["Earth","Spice","Leather"]},
  {"name":"CAO Flathead V660","brand":"CAO","strength":7,"priceRange":"$8-$12","flavorNotes":["Chocolate","Espresso","Pepper"]},
  {"name":"Oliva Serie O","brand":"Oliva","strength":6,"priceRange":"$6-$10","flavorNotes":["Cedar","Spice","Sweetness"]},
  {"name":"Nub Connecticut","brand":"Nub","strength":4,"priceRange":"$6-$8","flavorNotes":["Cream","Cedar","Nuts"]},
  {"name":"Punch Gran Puro Nicaragua","brand":"Punch","strength":8,"priceRange":"$7-$11","flavorNotes":["Spice","Earth","Cedar"]},
  {"name":"Tatuaje Havana VI","brand":"Tatuaje","strength":6,"priceRange":"$8-$11","flavorNotes":["Pepper","Cedar","Earth"]},
  {"name":"Flor de las Antillas","brand":"My Father","strength":6,"priceRange":"$7-$10","flavorNotes":["Cedar","Nutmeg","Sweetness"]},
  {"name":"Warped La Colmena No. 44","brand":"Warped","strength":5,"priceRange":"$14-$17","flavorNotes":["Honey","Floral","Cream"]},
  {"name":"Illusione Epernay","brand":"Illusione","strength":5,"priceRange":"$11-$14","flavorNotes":["Coffee","Cedar","Sweetness"]},
  {"name":"Foundation The Tabernacle","brand":"Foundation","strength":8,"priceRange":"$12-$16","flavorNotes":["Earth","Cocoa","Spice"]},
  {"name":"RoMa Craft CroMagnon","brand":"RoMa Craft","strength":8,"priceRange":"$9-$12","flavorNotes":["Earth","Pepper","Leather"]},
  {"name":"Dunbarton Mi Querida","brand":"Dunbarton Tobacco & Trust","strength":8,"priceRange":"$10-$13","flavorNotes":["Cocoa","Earth","Pepper"]},
  {"name":"Black Label Trading Co. Lawless","brand":"Black Label Trading Co.","strength":7,"priceRange":"$10-$12","flavorNotes":["Chocolate","Spice","Earth"]},
  {"name":"Southern Draw Kudzu","brand":"Southern Draw","strength":7,"priceRange":"$9-$12","flavorNotes":["Cedar","Sweetness","Spice"]},
  {"name":"Espinosa Laranja Reserva","brand":"Espinosa","strength":7,"priceRange":"$10-$13","flavorNotes":["Orange","Spice","Earth"]},
  {"name":"JRE Aladino Corojo","brand":"JRE Tobacco","strength":7,"priceRange":"$8-$11","flavorNotes":["Cedar","Nuts","Spice"]},
  {"name":"Plasencia Alma Fuerte","brand":"Plasencia","strength":8,"priceRange":"$18-$22","flavorNotes":["Earth","Chocolate","Coffee"]},
  {"name":"Patina Habano","brand":"Patina","strength":6,"priceRange":"$9-$12","flavorNotes":["Cream","Cedar","Nuts"]},
  {"name":"Fratello Classico","brand":"Fratello","strength":6,"priceRange":"$7-$10","flavorNotes":["Cedar","Pepper","Sweetness"]},
  {"name":"Pichardo Reserva Familiar","brand":"Pichardo","strength":6,"priceRange":"$10-$13","flavorNotes":["Coffee","Earth","Spice"]},
  {"name":"Cavalier Geneve White Series","brand":"Cavalier Geneve","strength":5,"priceRange":"$11-$14","flavorNotes":["Cream","Honey","Cedar"]},
  {"name":"Sin Compromiso","brand":"Dunbarton Tobacco & Trust","strength":7,"priceRange":"$17-$20","flavorNotes":["Chocolate","Spice","Earth"]},
  {"name":"Joya de Nicaragua Antano CT","brand":"Joya de Nicaragua","strength":6,"priceRange":"$8-$11","flavorNotes":["Cream","Pepper","Earth"]},
  {"name":"Villiger La Flor de Ynclan","brand":"Villiger","strength":6,"priceRange":"$11-$14","flavorNotes":["Cedar","Sweetness","Spice"]},
  {"name":"El Gueguense (Wise Man)","brand":"Foundation","strength":7,"priceRange":"$11-$15","flavorNotes":["Cedar","Cocoa","Pepper"]},
  {"name":"Micallef Reserva","brand":"Micallef","strength":7,"priceRange":"$12-$15","flavorNotes":["Chocolate","Earth","Spice"]},
  {"name":"Cornelius & Anthony The Meridian","brand":"Cornelius & Anthony","strength":6,"priceRange":"$9-$12","flavorNotes":["Coffee","Cedar","Nuts"]},
  {"name":"Crowned Heads Four Kicks","brand":"Crowned Heads","strength":6,"priceRange":"$8-$11","flavorNotes":["Cedar","Spice","Sweetness"]},
  {"name":"Aganorsa Leaf Signature Selection","brand":"Aganorsa Leaf","strength":7,"priceRange":"$11-$14","flavorNotes":["Cream","Cedar","Spice"]},
  {"name":"Casa Fernandez Miami Reserva","brand":"Casa Fernandez","strength":7,"priceRange":"$10-$13","flavorNotes":["Nuts","Spice","Earth"]},
  {"name":"Illusione Rothchildes","brand":"Illusione","strength":6,"priceRange":"$6-$9","flavorNotes":["Pepper","Cedar","Sweetness"]},
  {"name":"Room101 Farce","brand":"Room101","strength":6,"priceRange":"$9-$13","flavorNotes":["Cream","Earth","Spice"]},
  {"name":"Warped Cloud Hopper","brand":"Warped","strength":5,"priceRange":"$7-$10","flavorNotes":["Bread","Cream","Spice"]},
  {"name":"RoMa Craft Neanderthal","brand":"RoMa Craft","strength":10,"priceRange":"$13-$16","flavorNotes":["Pepper","Earth","Chocolate"]},
  {"name":"Southern Draw Firethorn","brand":"Southern Draw","strength":6,"priceRange":"$8-$11","flavorNotes":["Sweetness","Cedar","Spice"]},
  {"name":"Dapper Desvalido","brand":"Dapper","strength":7,"priceRange":"$11-$14","flavorNotes":["Cedar","Earth","Pepper"]},
  {"name":"Espinosa Habano","brand":"Espinosa","strength":6,"priceRange":"$7-$10","flavorNotes":["Spice","Earth","Cedar"]},
  {"name":"JRE Aladino Cameroon","brand":"JRE Tobacco","strength":6,"priceRange":"$8-$11","flavorNotes":["Sweetness","Spice","Cedar"]},
  {"name":"Crowned Heads Las Calaveras","brand":"Crowned Heads","strength":7,"priceRange":"$11-$15","flavorNotes":["Cedar","Sweetness","Pepper"]},
  {"name":"Plasencia Alma del Fuego","brand":"Plasencia","strength":8,"priceRange":"$15-$19","flavorNotes":["Earth","Pepper","Chocolate"]},
  {"name":"Foundation Charter Oak Habano","brand":"Foundation","strength":5,"priceRange":"$5-$8","flavorNotes":["Nuts","Cedar","Cream"]},
  {"name":"Aganorsa Leaf Guardian of the Farm","brand":"Aganorsa Leaf","strength":6,"priceRange":"$8-$11","flavorNotes":["Cedar","Nuts","Pepper"]},
  {"name":"Black Works Studio Killer Bee","brand":"Black Works Studio","strength":7,"priceRange":"$8-$11","flavorNotes":["Spice","Earth","Chocolate"]},
  {"name":"Cavalier Geneve Black Series II","brand":"Cavalier Geneve","strength":7,"priceRange":"$12-$16","flavorNotes":["Cocoa","Spice","Earth"]},
  {"name":"Micallef Leyenda","brand":"Micallef","strength":6,"priceRange":"$10-$13","flavorNotes":["Cream","Spice","Nuts"]},
  {"name":"Pichardo Clasico","brand":"Pichardo","strength":5,"priceRange":"$8-$11","flavorNotes":["Cedar","Earth","Sweetness"]},
  {"name":"Casa Fernandez Aganorsa Leaf Maduro","brand":"Casa Fernandez","strength":8,"priceRange":"$11-$14","flavorNotes":["Chocolate","Pepper","Earth"]},
  {"name":"La Barba Red","brand":"La Barba","strength":6,"priceRange":"$8-$11","flavorNotes":["Pepper","Cedar","Sweetness"]},
  {"name":"Room101 Doomsayer","brand":"Room101","strength":7,"priceRange":"$8-$12","flavorNotes":["Earth","Pepper","Chocolate"]},
  {"name":"Warped Serie Gran Reserva 1988","brand":"Warped","strength":6,"priceRange":"$9-$13","flavorNotes":["Bread","Nuts","Cream"]},
  {"name":"Dunbarton Sobremesa Brulee","brand":"Dunbarton Tobacco & Trust","strength":4,"priceRange":"$11-$15","flavorNotes":["Cream","Sweetness","Cedar"]},
  {"name":"Black Label Trading Co. Bishop's Blend","brand":"Black Label Trading Co.","strength":8,"priceRange":"$12-$15","flavorNotes":["Pepper","Earth","Spice"]},
  {"name":"Alec Bradley Black Market Esteli","brand":"Alec Bradley","strength":7,"priceRange":"$8-$12","flavorNotes":["Pepper","Earth","Cedar"]},
  {"name":"Patina Maduro","brand":"Patina","strength":7,"priceRange":"$10-$14","flavorNotes":["Chocolate","Earth","Spice"]},
  {"name":"Joya de Nicaragua Joya Black","brand":"Joya de Nicaragua","strength":7,"priceRange":"$7-$11","flavorNotes":["Pepper","Cedar","Earth"]},
  {"name":"Cornelius & Anthony Venganza","brand":"Cornelius & Anthony","strength":8,"priceRange":"$10-$14","flavorNotes":["Pepper","Cedar","Chocolate"]},
  {"name":"La Flor Dominicana La Nox","brand":"La Flor Dominicana","strength":8,"priceRange":"$13-$16","flavorNotes":["Chocolate","Earth","Spice"]},
  {"name":"Illusione Ultra","brand":"Illusione","strength":8,"priceRange":"$11-$14","flavorNotes":["Pepper","Earth","Coffee"]},
  {"name":"Aganorsa Leaf Lunatic Torch","brand":"Aganorsa Leaf","strength":8,"priceRange":"$10-$14","flavorNotes":["Pepper","Earth","Sweetness"]}
];

// OpenAI Configuration
const OPENAI_CONFIG = {
  apiKey: process.env.OPENAI_API_KEY,
  endpoint: "https://api.openai.com/v1/chat/completions",
  model: "gpt-4o-mini", // Cost-effective model, great for structured data
  timeout: 8000 // 8 second timeout
};

// Function to get recommendations from OpenAI
async function getOpenAIRecommendations(cigarName) {
  if (!OPENAI_CONFIG.apiKey) {
    console.log('OpenAI API key not configured, using fallback');
    return null;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), OPENAI_CONFIG.timeout);

    // Create a prompt that asks OpenAI to select from our database
    const prompt = `You are a cigar expert. A user is looking for recommendations based on: "${cigarName}"

Here is my cigar database to choose from:
${JSON.stringify(fallbackCigars, null, 2)}

Please analyze the user's input and recommend exactly 3 cigars from this database that would be good matches. Consider:
- If they mention a specific brand/cigar, find similar ones (similar strength, flavor notes)
- If they mention flavors, find cigars with those or complementary notes
- If they mention strength preference, match accordingly
- Provide variety in your selections when possible

Respond with ONLY a valid JSON array of exactly 3 cigar objects from the database above. Do not include any explanation or additional text - just the JSON array.

Example format:
[
  {"name":"Cigar Name","brand":"Brand","strength":7,"priceRange":"$10-$15","flavorNotes":["Note1","Note2","Note3"]},
  {"name":"Cigar Name","brand":"Brand","strength":6,"priceRange":"$8-$12","flavorNotes":["Note1","Note2","Note3"]},
  {"name":"Cigar Name","brand":"Brand","strength":8,"priceRange":"$12-$18","flavorNotes":["Note1","Note2","Note3"]}
]`;

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

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`OpenAI API returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content?.trim();
    
    if (!content) {
      throw new Error('Empty response from OpenAI');
    }

    // Parse the JSON response
    try {
      const recommendations = JSON.parse(content);
      
      if (Array.isArray(recommendations) && recommendations.length > 0) {
        console.log(`OpenAI returned ${recommendations.length} recommendations`);
        return recommendations.slice(0, 3); // Ensure exactly 3
      } else {
        throw new Error('Invalid recommendations format');
      }
    } catch (parseError) {
      console.log('Failed to parse OpenAI response:', parseError.message);
      console.log('Raw response:', content);
      return null;
    }

  } catch (error) {
    console.log('OpenAI API call failed:', error.message);
    return null;
  }
}

// Detect Cuban cigars (for fallback filtering)
function isCuban(cigar) {
  const check = (field) => {
    if (!field) return false;
    const str = field.toString().toLowerCase();
    return str.includes('cuba') || str.includes('cuban');
  };
  return (
    check(cigar.origin) ||
    check(cigar.country) ||
    (cigar.brand && cigar.brand.toLowerCase().includes('cuaba'))
  );
}

// FIXED shuffle function - now properly returns the array
function shuffle(array) {
  const shuffled = [...array]; // Create copy to avoid mutating original
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Basic similarity calculation (deterministic for OpenAI consistency)
function calculateSimilarity(cigar1, cigar2) {
  let score = 0;
  
  if (cigar1.strength && cigar2.strength) {
    const strengthDiff = Math.abs(cigar1.strength - cigar2.strength);
    if (strengthDiff === 0) score += 3;
    else if (strengthDiff === 1) score += 2;
    else if (strengthDiff === 2) score += 1;
  }
  
  if (Array.isArray(cigar1.flavorNotes) && Array.isArray(cigar2.flavorNotes)) {
    const notes1 = cigar1.flavorNotes.map(n => n.toLowerCase());
    const notes2 = cigar2.flavorNotes.map(n => n.toLowerCase());
    const commonNotes = notes1.filter(note => notes2.includes(note));
    score += commonNotes.length;
  }
  
  return score;
}

// UPDATED: Find similar cigars with randomness applied at the selection level
function findSimilarCigars(referenceCigar, availableCigars, count = 2) {
  const similarities = availableCigars
    .filter(c => c.name !== referenceCigar.name)
    .map(cigar => ({
      cigar,
      similarity: calculateSimilarity(referenceCigar, cigar)
    }))
    .sort((a, b) => b.similarity - a.similarity);
  
  // Get top candidates (more than needed for randomness)
  const topCandidates = similarities.slice(0, Math.min(count * 3, similarities.length));
  
  // Shuffle the top candidates and pick the requested count
  const shuffledCandidates = shuffle(topCandidates);
  
  return shuffledCandidates.slice(0, count).map(item => item.cigar);
}

// UPDATED: Fallback recommendation logic with proper randomness
function getFallbackRecommendations(cigarName) {
  const usCigars = fallbackCigars.filter(c => !isCuban(c));
  const input = cigarName.trim().toLowerCase();
  let recs = [];

  const exactMatches = usCigars.filter(c =>
    (c.name && c.name.toLowerCase().includes(input)) ||
    (c.brand && c.brand.toLowerCase().includes(input))
  );

  if (exactMatches.length > 0) {
    // Shuffle exact matches first for variety
    const shuffledMatches = shuffle(exactMatches);
    const baseMatch = shuffledMatches[0];
    recs.push(baseMatch);
    
    // Find similar cigars with randomness
    const similar = findSimilarCigars(baseMatch, usCigars, 2);
    recs = recs.concat(similar);
  } else {
    // Handle flavor matches
    const flavorMatches = usCigars.filter(c =>
      Array.isArray(c.flavorNotes) &&
      c.flavorNotes.some(note => input.includes(note.toLowerCase()))
    );
    
    if (flavorMatches.length > 0) {
      recs = shuffle(flavorMatches).slice(0, 3);
    } else {
      recs = shuffle(usCigars).slice(0, 3);
    }
  }

  // Fill remaining slots if needed
  if (recs.length < 3) {
    const needed = 3 - recs.length;
    const remaining = shuffle(usCigars.filter(c => !recs.some(r => r.name === c.name)));
    recs = recs.concat(remaining.slice(0, needed));
  }

  return recs.slice(0, 3);
}

exports.handler = async function(event, context) {
  const CORS = {
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "POST,OPTIONS",
    "access-control-allow-headers": "content-type,authorization",
    "content-type": "application/json"
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: CORS, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  try {
    let cigarName = "";
    try {
      cigarName = JSON.parse(event.body || "{}").cigarName || "";
    } catch(parseErr) {
      return {
        statusCode: 400,
        headers: CORS,
        body: JSON.stringify({ error: "Bad request", details: "Could not parse request body" })
      };
    }

    if (!cigarName.trim()) {
      return {
        statusCode: 400,
        headers: CORS,
        body: JSON.stringify({ error: "Missing cigar name" })
      };
    }

    let recommendations = null;

    // Try OpenAI first
    console.log('Attempting OpenAI recommendation for:', cigarName);
    recommendations = await getOpenAIRecommendations(cigarName);

    // Use fallback if OpenAI failed
    if (!recommendations || recommendations.length === 0) {
      console.log('OpenAI failed or returned no results, using fallback logic');
      recommendations = getFallbackRecommendations(cigarName);
    } else {
      console.log('OpenAI recommendations successful');
    }

    return {
      statusCode: 200,
      headers: CORS,
      body: JSON.stringify(recommendations)
    };
  } catch (err) {
    // Final fallback - if everything fails
    console.error('All systems failed, using emergency fallback:', err.message);
    try {
      const fallbackRecs = getFallbackRecommendations(cigarName || "");
      return {
        statusCode: 200,
        headers: CORS,
        body: JSON.stringify(fallbackRecs)
      };
    } catch (fallbackErr) {
      return {
        statusCode: 500,
        headers: CORS,
        body: JSON.stringify({
          error: "All systems failed",
          details: err.message
        })
      };
    }
  }
};
