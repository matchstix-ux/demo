// netlify/functions/recommend.js
const fs = require('fs');
const path = require('path');

// Helper to detect Cuban cigars (basic: checks if "Cuba" or "Cuban" in origin/country/brand/line)
function isCuban(cigar) {
  const check = (field) => {
    if (!field) return false;
    const str = field.toString().toLowerCase();
    return str.includes('cuba') || str.includes('cuban');
  };
  return (
    check(cigar.origin) ||
    check(cigar.country) ||
    check(cigar.brand) && cigar.brand.toLowerCase().includes('cuaba') // Exclude the brand Cuaba, a Cuban brand
  );
}

// Basic shuffle function
function shuffle(array) {
  let m = array.length, t, i;
  while (m) {
    i = Math.floor(Math.random() * m--);
    t = array[m];
    array[m] = array[i];
    array[i] = t;
  }
  return array;
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
    const { cigarName = "" } = JSON.parse(event.body || "{}");
    if (!cigarName.trim()) {
      return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: "Missing cigar name" }) };
    }

    // Read cigars.json from same directory as this function
    const cigarsPath = path.join(__dirname, "cigars.json");
    const cigarsRaw = fs.readFileSync(cigarsPath, "utf8");
    const allCigars = JSON.parse(cigarsRaw);

    // Exclude Cuban cigars
    const usCigars = allCigars.filter(c => !isCuban(c));

    // Normalize input
    const input = cigarName.trim().toLowerCase();

    // Try exact brand+line match
    let recs = usCigars.filter(c => 
      (c.name && c.name.toLowerCase().includes(input)) ||
      (c.brand && c.brand.toLowerCase().includes(input))
    );

    // If none, try by flavor notes
    if (!recs.length) {
      recs = usCigars.filter(c =>
        Array.isArray(c.flavorNotes) &&
        c.flavorNotes.some(note => input.includes(note.toLowerCase()))
      );
    }

    // Shuffle and take up to 3
    recs = shuffle(recs).slice(0, 3);

    // Fallback: 3 random US-market cigars
    if (!recs.length) recs = shuffle(usCigars).slice(0, 3);

    return {
      statusCode: 200,
      headers: CORS,
      body: JSON.stringify(recs)
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: CORS,
      body: JSON.stringify({ error: "Server error", details: err.message })
    };
  }
};
