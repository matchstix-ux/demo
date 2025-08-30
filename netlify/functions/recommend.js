const cigars = JSON.parse(await (await fetch(new URL('./cigars.json', import.meta.url))).text());

const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "POST,OPTIONS",
  "access-control-allow-headers": "content-type,authorization",
  "content-type": "application/json"
};

function isCuban(brand) {
  const cubanBrands = [
    'cohiba', 'montecristo', 'partagas', 'trinidad', 'ramon allones', 'cuaba',
    'quai d\'orsay', 'sancho panza', 'veguero', 'punch', 'por larranaga', 'juan lopez',
    'el rey del mundo', 'hoyo de monterrey', 'bolivar', 'h.upmann', 'jose piedra',
    'quintero', 'la gloria cubana', 'diplomaticos'
  ];
  if (!brand) return false;
  const b = brand.toLowerCase();
  return cubanBrands.some(cb => b.includes(cb));
}

function shuffle(arr) {
  let a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default async (req) => {
  try {
    if (req.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS });
    }
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: CORS });
    }

    const { cigarName } = await req.json();
    if (!cigarName) {
      return new Response(JSON.stringify({ error: "Missing cigar name" }), { status: 400, headers: CORS });
    }

    const usCigars = cigars.filter(c => !isCuban(c.brand));
    let recs = usCigars.filter(
      c =>
        c.name.toLowerCase().includes(cigarName.toLowerCase()) ||
        c.brand.toLowerCase().includes(cigarName.toLowerCase())
    );
    recs = shuffle(recs).slice(0, 3);
    if (!recs.length) recs = shuffle(usCigars).slice(0, 3);

    return new Response(JSON.stringify(recs), { status: 200, headers: CORS });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Server error", details: err.message }), { status: 500, headers: CORS });
  }
};
