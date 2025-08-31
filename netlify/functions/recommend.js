// netlify/functions/recommend.js
const fs = require('fs');
const path = require('path');

// Detect Cuban cigars
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

// Basic array shuffle
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

  // Preflight
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: CORS, body: "" };
  }
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  try {
    // Parse user input
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

    // DEBUG: Log out file existence and path
    const cigarsPath = path.join(__dirname, "cigars.json");
    let cigarsRaw;
    let allCigars;
    try {
      cigarsRaw = fs.readFileSync(cigarsPath, "utf8");
    } catch (fileErr) {
      return {
        statusCode: 500,
        headers: CORS,
        body: JSON.stringify({ error: "Could not read cigars.json", details: fileErr.message, path: cigarsPath })
      };
    }

    try {
      allCigars = JSON.parse(cigarsRaw);
    } catch (jsonErr) {
      return {
        statusCode: 500,
        headers: CORS,
        body: JSON.stringify({ error: "cigars.json is not valid JSON", details: jsonErr.message })
      };
    }

    // Exclude Cuban cigars
    const usCigars = allCigars.filter(c => !isCuban(c));

    // Normalize input
    const input = cigarName.trim().toLowerCase();

    // Try exact brand/line match
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
    // Show the actual error!
    return {
      statusCode: 500,
      headers: CORS,
      body: JSON.stringify({
        error: "Server error",
        details: err.message,
        stack: err.stack
      })
    };
  }
};
