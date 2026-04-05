exports.handler = async function (event) {
  var CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST,OPTIONS",
    "Access-Control-Allow-Headers": "content-type,authorization",
    "Content-Type": "application/json"
  };

  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers: CORS, body: "" };
  if (event.httpMethod !== "POST") return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: "Method not allowed" }) };

  var cigars = [
    { name: "Arturo Fuente Hemingway Short Story", brand: "Arturo Fuente", strength: 3, priceTier: "premium", flavorNotes: ["cedar", "cream", "spice"] },
    { name: "Oliva Serie V Melanio Robusto", brand: "Oliva", strength: 4, priceTier: "premium", flavorNotes: ["coffee", "wood", "black pepper"] },
    { name: "My Father Le Bijou 1922 Torpedo", brand: "My Father Cigars", strength: 5, priceTier: "premium", flavorNotes: ["leather", "espresso", "dark chocolate"] },
    { name: "Rocky Patel Vintage 1990 Robusto", brand: "Rocky Patel", strength: 3, priceTier: "premium", flavorNotes: ["cream", "nuts", "cedar"] },
    { name: "Davidoff Winston Churchill The Late Hour", brand: "Davidoff", strength: 3, priceTier: "luxury", flavorNotes: ["leather", "oak", "dried fruit"] },
    { name: "Liga Privada No. 9 Robusto", brand: "Drew Estate", strength: 5, priceTier: "premium", flavorNotes: ["dark chocolate", "espresso", "earth"] },
    { name: "CAO Flathead Steel Horse Roadkill", brand: "CAO", strength: 4, priceTier: "mid-range", flavorNotes: ["wood", "pepper", "leather"] },
    { name: "Alec Bradley Prensado Robusto", brand: "Alec Bradley", strength: 4, priceTier: "premium", flavorNotes: ["cocoa", "cedar", "spice"] },
    { name: "Montecristo White Series Robusto", brand: "Montecristo", strength: 2, priceTier: "mid-range", flavorNotes: ["cream", "cedar", "floral"] },
    { name: "Romeo y Julieta 1875 Robusto", brand: "Romeo y Julieta", strength: 2, priceTier: "mid-range", flavorNotes: ["cedar", "cream", "mild spice"] },
    { name: "Perdomo Reserve 10th Anniversary Robusto", brand: "Perdomo", strength: 3, priceTier: "mid-range", flavorNotes: ["coffee", "vanilla", "cedar"] },
    { name: "Ashton VSG Wizard", brand: "Ashton", strength: 5, priceTier: "luxury", flavorNotes: ["pepper", "earth", "wood"] },
    { name: "Punch Rare Corojo Robusto", brand: "Punch", strength: 4, priceTier: "mid-range", flavorNotes: ["earth", "leather", "spice"] },
    { name: "Macanudo Inspirado White Robusto", brand: "Macanudo", strength: 1, priceTier: "mid-range", flavorNotes: ["cream", "floral", "light cedar"] },
    { name: "Fuente Fuente OpusX Robusto", brand: "Arturo Fuente", strength: 5, priceTier: "luxury", flavorNotes: ["pepper", "leather", "dark fruit"] },
    { name: "H. Upmann 1844 Reserve Robusto", brand: "H. Upmann", strength: 2, priceTier: "mid-range", flavorNotes: ["cream", "cedar", "almonds"] },
    { name: "Illusione ~eccj~ 20th Robusto", brand: "Illusione", strength: 4, priceTier: "premium", flavorNotes: ["pepper", "wood", "earth"] },
    { name: "Cohiba Blue Robusto", brand: "Cohiba", strength: 3, priceTier: "premium", flavorNotes: ["cedar", "cream", "subtle spice"] },
    { name: "Nat Sherman Timeless Prestige Robusto", brand: "Nat Sherman", strength: 2, priceTier: "premium", flavorNotes: ["cream", "wood", "light pepper"] },
    { name: "AVO Classic Robusto", brand: "AVO", strength: 2, priceTier: "premium", flavorNotes: ["cream", "floral", "cedar"] }
  ];

  try {
    var body = JSON.parse(event.body || "{}");
    var query = String(body.query || body.cigarName || "").trim().toLowerCase();
    var disliked = Array.isArray(body.disliked) ? body.disliked : [];
    var seen = Array.isArray(body.seen) ? body.seen : [];

    // Build exclusion list — includes the QUERY ITSELF so searched brand/name NEVER appears
    var excluded = disliked.concat(seen).map(function(x) { return String(x).toLowerCase(); });

    function shuffle(arr) {
      for (var i = arr.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
      }
      return arr;
    }

    // Filter out: anything excluded + anything matching the search query brand or name
    var pool = cigars.filter(function(c) {
      var key = c.brand.toLowerCase() + "::" + c.name.toLowerCase();
      if (excluded.indexOf(key) !== -1) return false;

      // HARD EXCLUDE: if query matches this cigar's brand or name, it NEVER appears in results
      if (query && (
        c.brand.toLowerCase().indexOf(query) !== -1 ||
        c.name.toLowerCase().indexOf(query) !== -1
      )) return false;

      return true;
    });

    shuffle(pool);

    // Return 3 from the pool
    var results = pool.slice(0, 3);

    // Safety: if somehow fewer than 3, pad from full list excluding query matches
    if (results.length < 3) {
      var backup = cigars.filter(function(c) {
        if (query && (
          c.brand.toLowerCase().indexOf(query) !== -1 ||
          c.name.toLowerCase().indexOf(query) !== -1
        )) return false;
        return results.indexOf(c) === -1;
      });
      shuffle(backup);
      results = results.concat(backup).slice(0, 3);
    }

    return { statusCode: 200, headers: CORS, body: JSON.stringify(results) };

  } catch (err) {
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: "Server error" }) };
  }
};
