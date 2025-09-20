// app.js — Vanilla JS for MatchSticks

const API_PATH = '/.netlify/functions/recommend';

const form = document.getElementById('searchForm');
const queryInput = document.getElementById('query');
const status = document.getElementById('status');
const results = document.getElementById('results');

let lastQuery = ''; // stores the last search input

// Store feedback in localStorage
function saveFeedback(cigarName, liked) {
  const feedback = JSON.parse(localStorage.getItem('cigarFeedback') || '{}');
  if (!feedback[cigarName]) feedback[cigarName] = { likes: 0, dislikes: 0 };
  liked ? feedback[cigarName].likes++ : feedback[cigarName].dislikes++;
  localStorage.setItem('cigarFeedback', JSON.stringify(feedback));
}

function renderCigar(cigar) {
  return `
    <div class="card" data-name="${cigar.name}">
      <div class="name">${cigar.name}</div>
      <div class="brand">${cigar.brand}</div>
      <div class="meta">Strength: ${cigar.strength} &nbsp;|&nbsp; Tier: <b>${formatTier(cigar.priceTier)}</b></div>
      <div class="notes">Flavor Notes: ${Array.isArray(cigar.flavorNotes) ? cigar.flavorNotes.join(', ') : ''}</div>
      <div class="feedback-buttons">
        <button onclick="handleFeedback('${cigar.name}', true)">👍</button>
        <button onclick="handleFeedback('${cigar.name}', false, this)">👎</button>
      </div>
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

  lastQuery = q;
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

// Handles thumbs up / thumbs down
async function handleFeedback(cigarName, liked, button = null) {
  saveFeedback(cigarName, liked);

  if (liked) {
    alert(`You liked ${cigarName}`);
    return;
  }

  alert(`You disliked ${cigarName}. Finding a new one…`);

  if (!lastQuery) {
    alert("No previous search to retry.");
    return;
  }

  try {
    const res = await fetch(API_PATH, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cigarName: lastQuery })
    });

    const data = await res.json();
    const newCigar = data.results?.[0];
    if (!newCigar) {
      alert("No replacement cigar found.");
      return;
    }

    const newCardHTML = renderCigar(newCigar);
    const oldCard = button.closest('.card');
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = newCardHTML;
    const newCard = tempDiv.firstElementChild;

    oldCard.replaceWith(newCard);
  } catch (err) {
    console.error('Error fetching replacement:', err);
    alert("Couldn’t get a new cigar from OpenAI.");
  }
}
