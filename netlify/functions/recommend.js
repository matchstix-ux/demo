// ---------------------------------------------------------------------------
// Cigar database — 79 cigars, sourced from data/cigars.json
// Inlined here so no filesystem path resolution is needed in the Lambda env.
// To update the database, edit data/cigars.json and paste the result here.
// ---------------------------------------------------------------------------
const ALL_CIGARS = [
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

// ---------------------------------------------------------------------------
// Flavor synonym map — query terms → flavor note keywords in the data
// ---------------------------------------------------------------------------
const FLAVOR_SYNONYMS = {
  chocolate:    ["chocolate", "cocoa", "espresso", "coffee"],
  cocoa:        ["cocoa", "chocolate"],
  espresso:     ["espresso", "coffee", "cocoa"],
  coffee:       ["coffee", "espresso", "cocoa"],
  sweet:        ["sweetness", "caramel", "honey", "cream"],
  caramel:      ["caramel", "sweetness", "honey"],
  honey:        ["honey", "sweetness", "caramel"],
  cream:        ["cream", "caramel", "nuts"],
  creamy:       ["cream", "caramel", "nuts"],
  vanilla:      ["sweetness", "cream", "caramel"],
  earth:        ["earth", "leather", "cedar"],
  earthy:       ["earth", "leather", "cedar"],
  wood:         ["cedar", "oak", "earth"],
  woody:        ["cedar", "oak", "earth"],
  cedar:        ["cedar", "oak"],
  oak:          ["oak", "cedar"],
  leather:      ["leather", "earth"],
  spice:        ["spice", "pepper"],
  spicy:        ["spice", "pepper"],
  pepper:       ["pepper", "spice"],
  peppery:      ["pepper", "spice"],
  nuts:         ["nuts", "hazelnut", "cream"],
  nutty:        ["nuts", "hazelnut"],
  hazelnut:     ["hazelnut", "nuts"],
  mild:         ["cream", "cedar", "nuts", "floral"],
  smooth:       ["cream", "caramel", "honey", "nuts"],
  light:        ["cream", "floral", "cedar"],
  floral:       ["floral", "honey", "sweetness"],
  orange:       ["orange", "sweetness"],
  bread:        ["bread", "cream", "nuts"],
};

// Strength keywords → [min, max] on the 4–10 scale
const STRENGTH_KEYWORDS = {
  "full body": [8, 10], "full-bodied": [8, 10], fullbodied: [8, 10],
  full: [8, 10], strong: [8, 10],
  "medium full": [6, 8], "medium-full": [6, 8],
  medium: [5, 7], "medium body": [5, 7], "medium-bodied": [5, 7],
  mild: [4, 5], mellow: [4, 5], light: [4, 5],
};

// Price keywords → price-range lower-bound band
const PRICE_KEYWORDS = {
  budget: [0, 7], cheap: [0, 7], affordable: [0, 9],
  "mid range": [7, 13], "mid-range": [7, 13], midrange: [7, 13],
  premium: [12, 20], luxury: [16, 999], expensive: [16, 999],
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parsePriceLow(priceRange) {
  const m = String(priceRange || "").match(/\$(\d+)/);
  return m ? parseInt(m[1], 10) : 0;
}

function norm(str) {
  return String(str || "").toLowerCase().trim();
}

function tokenize(query) {
  const words = query.toLowerCase().replace(/[^a-z0-9 ]/g, " ").trim().split(/\s+/).filter(Boolean);
  const bigrams = words.slice(0, -1).map((w, i) => `${w} ${words[i + 1]}`);
  return [...bigrams, ...words];
}

function getCigarKey(cigar) {
  return `${norm(cigar.brand)}::${norm(cigar.name)}`;
}

function scoreCigar(cigar, tokens) {
  let score = 0;
  const notes    = cigar.flavorNotes.map(n => n.toLowerCase());
  const brandLow = norm(cigar.brand);
  const nameLow  = norm(cigar.name);
  const strength = cigar.strength;
  const priceLow = parsePriceLow(cigar.priceRange);

  for (const token of tokens) {
    if (brandLow.includes(token) || nameLow.includes(token)) { score += 10; continue; }

    const sRange = STRENGTH_KEYWORDS[token];
    if (sRange) {
      score += (strength >= sRange[0] && strength <= sRange[1]) ? 6 : -2;
      continue;
    }

    const pRange = PRICE_KEYWORDS[token];
    if (pRange) {
      if (priceLow >= pRange[0] && priceLow <= pRange[1]) score += 5;
      continue;
    }

    const synonymTargets = FLAVOR_SYNONYMS[token];
    if (synonymTargets) {
      score += synonymTargets.filter(t => notes.includes(t)).length * 4;
      continue;
    }

    if (notes.includes(token)) { score += 4; continue; }
    if (notes.some(n => n.includes(token) || token.includes(n))) score += 2;
  }

  return score;
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

exports.handler = async function (event) {
  const CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST,OPTIONS",
    "Access-Control-Allow-Headers": "content-type,authorization",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers: CORS, body: "" };
  if (event.httpMethod !== "POST")    return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: "Method not allowed" }) };

  try {
    const body     = JSON.parse(event.body || "{}");
    const rawQuery = String(body.query || body.cigarName || "").trim();
    const disliked = Array.isArray(body.disliked) ? body.disliked.map(norm) : [];
    const seen     = Array.isArray(body.seen)     ? body.seen.map(norm)     : [];

    const excluded   = new Set([...disliked, ...seen]);
    const queryLower = norm(rawQuery);
    const tokens     = tokenize(rawQuery);

    // Build candidate pool — exclude seen/disliked and the searched cigar itself
    let pool = ALL_CIGARS.filter(c => {
      const key = getCigarKey(c);
      if (excluded.has(key)) return false;
      if (queryLower && (norm(c.brand).includes(queryLower) || norm(c.name).includes(queryLower))) return false;
      return true;
    });

    // Shuffle to randomise ties, then sort by score (descending)
    shuffle(pool);

    if (tokens.length > 0) {
      pool = pool
        .map(c => ({ c, score: scoreCigar(c, tokens) }))
        .sort((a, b) => b.score - a.score)
        .map(({ c }) => c);
    }

    // Return 6 — client shows 3, buffers 3 for instant Replace without a re-fetch
    let results = pool.slice(0, 6);

    if (results.length < 3) {
      const used = new Set(results.map(getCigarKey));
      const backup = shuffle(
        ALL_CIGARS.filter(c => {
          if (used.has(getCigarKey(c))) return false;
          if (queryLower && (norm(c.brand).includes(queryLower) || norm(c.name).includes(queryLower))) return false;
          return true;
        })
      );
      results = results.concat(backup).slice(0, 6);
    }

    return { statusCode: 200, headers: CORS, body: JSON.stringify(results) };

  } catch (err) {
    console.error("recommend error:", err);
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: "Server error" }) };
  }
};
