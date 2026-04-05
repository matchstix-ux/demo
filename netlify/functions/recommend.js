const path = require("path");
const fs = require("fs");

// Load cigar database from data folder (one level up from functions/)
const CIGARS_PATH = path.join(__dirname, "../../data/cigars.json");
const ALL_CIGARS = JSON.parse(fs.readFileSync(CIGARS_PATH, "utf8"));

// ---------------------------------------------------------------------------
// Flavor synonym map — query terms → flavor note keywords in the data
// ---------------------------------------------------------------------------
const FLAVOR_SYNONYMS = {
  // Chocolate / sweet / rich
  chocolate:  ["chocolate", "cocoa", "espresso", "coffee"],
  cocoa:      ["cocoa", "chocolate"],
  espresso:   ["espresso", "coffee", "cocoa"],
  coffee:     ["coffee", "espresso", "cocoa"],
  sweet:      ["sweetness", "caramel", "honey", "cream", "vanilla"],
  caramel:    ["caramel", "sweetness", "honey"],
  honey:      ["honey", "sweetness", "caramel"],
  cream:      ["cream", "caramel", "nuts"],
  creamy:     ["cream", "caramel", "nuts"],
  vanilla:    ["sweetness", "cream", "caramel"],

  // Earthy / woody
  earth:      ["earth", "leather", "cedar"],
  earthy:     ["earth", "leather", "cedar"],
  wood:       ["cedar", "oak", "earth"],
  woody:      ["cedar", "oak", "earth"],
  cedar:      ["cedar", "oak"],
  oak:        ["oak", "cedar"],
  leather:    ["leather", "earth"],

  // Spice / pepper
  spice:      ["spice", "pepper"],
  spicy:      ["spice", "pepper"],
  pepper:     ["pepper", "spice"],
  peppery:    ["pepper", "spice"],

  // Nuts / mild
  nuts:       ["nuts", "hazelnut", "cream"],
  nutty:      ["nuts", "hazelnut"],
  hazelnut:   ["hazelnut", "nuts"],
  mild:       ["cream", "cedar", "nuts", "floral"],
  smooth:     ["cream", "caramel", "honey", "nuts"],
  light:      ["cream", "floral", "cedar"],

  // Floral / unique
  floral:     ["floral", "honey", "sweetness"],
  orange:     ["orange", "sweetness"],
  bread:      ["bread", "cream", "nuts"],

  // Strength descriptors → map to strength bands
  full:       null,   // handled by strength scoring
  "full body": null,
  "full-bodied": null,
  medium:     null,
  "medium body": null,
  "medium-bodied": null,
  mellow:     null,
  "mild body": null,
};

// Strength keyword → target strength range [min, max] on 4–10 scale
const STRENGTH_KEYWORDS = {
  "full body":       [8, 10],
  "full-bodied":     [8, 10],
  fullbodied:        [8, 10],
  full:              [8, 10],
  strong:            [8, 10],
  "medium full":     [6, 8],
  "medium-full":     [6, 8],
  medium:            [5, 7],
  "medium body":     [5, 7],
  "medium-bodied":   [5, 7],
  mild:              [4, 5],
  mellow:            [4, 5],
  light:             [4, 5],
};

// Price tier keywords → rough priceRange lower-bound matching
const PRICE_KEYWORDS = {
  budget:    [0, 7],
  cheap:     [0, 7],
  affordable:[0, 9],
  "mid range":[7, 13],
  "mid-range":[7, 13],
  midrange:  [7, 13],
  premium:   [12, 20],
  luxury:    [16, 999],
  expensive: [16, 999],
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parsePriceRangeLow(priceRange) {
  // "$15-$20" → 15
  const m = String(priceRange || "").match(/\$(\d+)/);
  return m ? parseInt(m[1], 10) : 0;
}

function normalize(str) {
  return String(str || "").toLowerCase().trim();
}

function tokenize(query) {
  // Return both individual words and bigrams so "full body" can match
  const words = query.toLowerCase().replace(/[^a-z0-9 ]/g, " ").trim().split(/\s+/).filter(Boolean);
  const bigrams = words.slice(0, -1).map((w, i) => `${w} ${words[i + 1]}`);
  return [...bigrams, ...words]; // bigrams first so they take priority
}

// ---------------------------------------------------------------------------
// Scoring — higher is better
// ---------------------------------------------------------------------------

function scorecigar(cigar, tokens, likedKeys) {
  let score = 0;
  const notes = cigar.flavorNotes.map(n => n.toLowerCase());
  const brandLower = normalize(cigar.brand);
  const nameLower = normalize(cigar.name);
  const strengthNum = cigar.strength;
  const priceLow = parsePriceRangeLow(cigar.priceRange);

  for (const token of tokens) {
    // --- Brand / name exact match (high weight) ---
    if (brandLower.includes(token) || nameLower.includes(token)) {
      score += 10;
      continue;
    }

    // --- Strength range match ---
    const strengthRange = STRENGTH_KEYWORDS[token];
    if (strengthRange) {
      const [lo, hi] = strengthRange;
      if (strengthNum >= lo && strengthNum <= hi) score += 6;
      else score -= 2; // penalize wrong strength
      continue;
    }

    // --- Price tier match ---
    const priceRange = PRICE_KEYWORDS[token];
    if (priceRange) {
      const [lo, hi] = priceRange;
      if (priceLow >= lo && priceLow <= hi) score += 5;
      continue;
    }

    // --- Flavor synonym match ---
    if (token in FLAVOR_SYNONYMS && FLAVOR_SYNONYMS[token]) {
      const targets = FLAVOR_SYNONYMS[token];
      const matches = targets.filter(t => notes.includes(t)).length;
      score += matches * 4;
      continue;
    }

    // --- Direct flavor note match ---
    if (notes.includes(token)) {
      score += 4;
      continue;
    }

    // --- Partial flavor note match ---
    if (notes.some(n => n.includes(token) || token.includes(n))) {
      score += 2;
    }
  }

  // Bonus for liked cigars' flavor overlap
  // (liked keys not used here directly, but liked flavor profile
  //  could be used in a future version — leaving hook open)

  return score;
}

function getCigarKey(cigar) {
  return `${normalize(cigar.brand)}::${normalize(cigar.name)}`;
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
    "Content-Type": "application/json"
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: CORS, body: "" };
  }
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  try {
    const body = JSON.parse(event.body || "{}");
    const rawQuery = String(body.query || body.cigarName || "").trim();
    const disliked  = Array.isArray(body.disliked)  ? body.disliked.map(normalize)  : [];
    const seen      = Array.isArray(body.seen)       ? body.seen.map(normalize)      : [];
    const liked     = Array.isArray(body.liked)      ? body.liked.map(normalize)     : [];

    const excluded = new Set([...disliked, ...seen]);
    const queryLower = normalize(rawQuery);
    const tokens = tokenize(rawQuery);

    // --- Build candidate pool ---
    // Exclude: seen, disliked, and any cigar whose brand/name IS the query
    //          (don't recommend what they searched for)
    let pool = ALL_CIGARS.filter(c => {
      const key = getCigarKey(c);
      if (excluded.has(key)) return false;

      // Hard-exclude if the cigar IS what they searched (brand or name substring)
      if (queryLower && (
        normalize(c.brand).includes(queryLower) ||
        normalize(c.name).includes(queryLower)
      )) return false;

      return true;
    });

    // --- Score and sort ---
    // Shuffle first so ties are broken randomly, not by original array order
    shuffle(pool);

    const hasQuery = tokens.length > 0;

    if (hasQuery) {
      pool = pool
        .map(c => ({ cigar: c, score: scorecigar(c, tokens, liked) }))
        .sort((a, b) => b.score - a.score)
        .map(({ cigar }) => cigar);
    }

    // Return top 6 so the client has extras for Replace without another round-trip
    const results = pool.slice(0, 6);

    // If we somehow got fewer than 3, pad from the full list (excluding hard query matches)
    if (results.length < 3) {
      const used = new Set(results.map(getCigarKey));
      const backup = ALL_CIGARS.filter(c => {
        if (used.has(getCigarKey(c))) return false;
        if (queryLower && (
          normalize(c.brand).includes(queryLower) ||
          normalize(c.name).includes(queryLower)
        )) return false;
        return true;
      });
      shuffle(backup);
      results.push(...backup.slice(0, 3 - results.length));
    }

    return {
      statusCode: 200,
      headers: CORS,
      body: JSON.stringify(results)
    };

  } catch (err) {
    console.error("recommend error:", err);
    return {
      statusCode: 500,
      headers: CORS,
      body: JSON.stringify({ error: "Server error" })
    };
  }
};
