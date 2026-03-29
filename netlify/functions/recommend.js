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

  var cigars = [
    { name: "Arturo Fuente Hemingway Short Story", brand: "Arturo Fuente", strength: 3, priceTier: "premium", flavorNotes: ["cedar", "cream", "spice"] },
    { name: "Padron 2000 Natural", brand: "Padron", strength: 4, priceTier: "premium", flavorNotes: ["cocoa", "earth", "pepper"] },
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
    { name: "Cohiba Blue Robusto", brand: "Cohiba", strength: 3, priceTier: "premium", flavorNotes: ["cedar", "cream", "subtle spice"] },
    { name: "Padrón 1964 Anniversary Series Robusto", brand: "Padrón", strength: 4, priceTier: "premium", flavorNotes: ["dark chocolate", "coffee", "caramel"] },
    { name: "Fuente Fuente OpusX Robusto", brand: "Arturo Fuente", strength: 5, priceTier: "luxury", flavorNotes: ["pepper", "leather", "dark fruit"] },
    { name: "H. Upmann 1844 Reserve Robusto", brand: "H. Upmann", strength: 2, priceTier: "mid-range", flavorNotes: ["cream", "cedar", "almonds"] },
    { name: "Illusione ~eccj~ 20th Robusto", brand: "Illusione", strength: 4, priceTier: "premium", flavorNotes: ["pepper", "wood", "earth"] }
  ];

  try {
    var body = JSON.parse(event.body || "{}");
    var query = String(body.query || body.cigarName || "").trim().toLowerCase();
    var disliked = Array.isArray(body.disliked) ? body.disliked : [];
    var seen = Array.isArray(body.seen) ? body.seen : [];
    var excluded = disliked.concat(seen).map(function(x) { return String(x).toLowerCase(); });

    var filtered = cigars.filter(function(c) {
      var key = c.brand.toLowerCase() + "::" + c.name.toLowerCase();
      if (excluded.indexOf(key) !== -1) return false;
      if (!query) return true;
      return (
        c.name.toLowerCase().indexOf(query) !== -1 ||
        c.brand.toLowerCase().indexOf(query) !== -1 ||
        c.flavorNotes.some(function(n) { return n.toLowerCase().indexOf(query) !== -1; })
      );
    });

    if (filtered.length === 0) filtered = cigars.slice();

    var results = [];
    var used = [];
    while (results.length < 3 && filtered.length > 0) {
      var idx = Math.floor(Math.random() * filtered.length);
      results.push(filtered[idx]);
      filtered.splice(idx, 1);
    }

    return { statusCode: 200, headers: CORS, body: JSON.stringify(results) };

  } catch (err) {
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: "Server error" }) };
  }
};
