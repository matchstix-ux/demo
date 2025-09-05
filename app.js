// app.js — Vanilla JS for MatchSticks

const API_PATH = '/.netlify/functions/recommend';

const form = document.getElementById('searchForm');
const queryInput = document.getElementById('query');
const status = document.getElementById('status');
const results = document.getElementById('results');

function renderCigar(cigar) {
  return `
    <div class="card">
      <div class="name">${cigar.name}</div>
      <div class="brand">${cigar.brand}</div>
      <div class="meta">Strength: ${cigar.strength} &nbsp;|&nbsp; Tier: <b>${formatTier(cigar.priceTier)}</b></div>
      <div class="notes">Flavor Notes: ${Array.isArray(cigar.flavorNotes) ? cigar.flavorNotes.join(', ') : ''}</div>
    </div>
  `;
}

// Helper to display tier with nice formatting
function formatTier(tier) {
  if (!tier) return "";
  switch (tier) {
    case "luxury": return "Luxury";
    case "premium": return "Premium";
    case "mid-range": return "Mid-Range";
    case "budget": return "Budget";
    default: return tier.charAt(0).toUpperCase() + tier.slice(1);
  }
}

form.onsubmit = async (e) => {
  e.preventDefault();
  const q = queryInput.value.trim();
  if (!q) {
    status.textContent = "Please enter a cigar name, brand, or line.";
    results.innerHTML = '';
    return;
  }
  status.textContent = "Finding your recs…";
  results.innerHTML = "";
  try {
    const res = await fetch(API_PATH, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cigarName: q })
    });
    if (!res.ok) {
      status.textContent = "Sorry — server error.";
      return;
    }
    const recs = await res.json();
    if (Array.isArray(recs) && recs.length) {
      status.textContent = "";
      results.innerHTML = recs.map(renderCigar).join('');
    } else {
      status.textContent = "No recommendations found — try a different search.";
      results.innerHTML = '';
    }
  } catch (err) {
    status.textContent = "Network error. Try again in a moment.";
    results.innerHTML = '';
  }
};
