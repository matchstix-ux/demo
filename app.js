// app.js — MatchSticks with Like/Dislike Functionality

const API_PATH = '/.netlify/functions/recommend';

const form = document.getElementById('searchForm');
const queryInput = document.getElementById('query');
const status = document.getElementById('status');
const results = document.getElementById('results');

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

function renderCigar(cigar, index) {
  return `
    <div class="card" data-index="${index}">
      <div class="name">${cigar.name}</div>
      <div class="brand">${cigar.brand}</div>
      <div class="meta">Strength: ${cigar.strength} &nbsp;|&nbsp; Tier: <b>${formatTier(cigar.priceTier)}</b></div>
      <div class="notes">Flavor Notes: ${Array.isArray(cigar.flavorNotes) ? cigar.flavorNotes.join(', ') : ''}</div>
      <div class="actions">
        <button class="like" title="Like this cigar">👍</button>
        <button class="dislike" title="Dislike this cigar" data-name="${cigar.name}">👎</button>
      </div>
    </div>
  `;
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
      body: JSON.stringify({ query: q })
    });
    if (!res.ok) {
      status.textContent = "Sorry — server error.";
      return;
    }
    const recs = await res.json();
    if (Array.isArray(recs) && recs.length) {
      status.textContent = "";
      results.innerHTML = recs.map((cigar, i) => renderCigar(cigar, i)).join('');
    } else {
      status.textContent = "No recommendations found — try a different search.";
      results.innerHTML = '';
    }
  } catch (err) {
    status.textContent = "Network error. Try again in a moment.";
    results.innerHTML = '';
  }
};

results.addEventListener('click', async (e) => {
  if (e.target.classList.contains('dislike')) {
    const card = e.target.closest('.card');
    const index = card?.getAttribute('data-index');
    const cigarName = queryInput.value.trim();
    if (!cigarName || index === null) return;

    // Fetch a new recommendation from the backend
    try {
      const res = await fetch(API_PATH, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: cigarName })
      });
      const newRecs = await res.json();
      if (Array.isArray(newRecs) && newRecs.length) {
        const newCigar = newRecs[Math.floor(Math.random() * newRecs.length)];
        const newCardHTML = renderCigar(newCigar, index);
        card.outerHTML = newCardHTML;
      }
    } catch (err) {
      console.error("Dislike fetch failed", err);
    }
  }
});
