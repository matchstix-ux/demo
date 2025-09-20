// app.js — MatchSticks with thumbs-down replacement via OpenAI

const API_PATH = '/.netlify/functions/recommend';

const form = document.getElementById('searchForm');
const queryInput = document.getElementById('query');
const status = document.getElementById('status');
const results = document.getElementById('results');

let lastQuery = ''; // Store the last search input

// Store user feedback in localStorage
function saveFeedback(cigarName, liked) {
  const feedback = JSON.parse(localStorage.getItem('cigarFeedback') || '{}');
  if (!feedback[cigarName]) feedback[cigarName] = { likes: 0, dislikes: 0 };
  liked ? feedback[cigarName].likes++ : feedback[cigarName].dislikes++;
  localStorage.setItem('cigarFeedback', JSON.stringify(feedback));
}

// Render one cigar card
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

// Format the price tier
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

// Handle form submission
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
      body: JSON.stringify({ query: q }) // use "query"
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

// Handle thumbs-up and thumbs-down feedback
async function handleFeedback(cigarName, liked, button = null) {
  saveFeedback(cigarName, liked);

  // Only act on 👎
  if (liked || !lastQuery || !button) return;

  try {
    const shownNames = Array.from(document.querySelectorAll('.card')).map(card =>
      card.getAttribute('data-name')
    );

    const res = await fetch(API_PATH, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: lastQuery })
    });

    const data = await res.json();
    const freshCigar = (data.results || []).find(
      c => !shownNames.includes(c.name)
    );

    if (!freshCigar) {
      console.warn("No fresh cigar found from OpenAI.");
      return;
    }

    const newCardHTML = renderCigar(freshCigar);
    const oldCard = button.closest('.card');
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = newCardHTML;
    const newCard = tempDiv.firstElementChild;

    oldCard.replaceWith(newCard);

  } catch (err) {
    console.error('Error fetching replacement cigar:', err);
  }
}
