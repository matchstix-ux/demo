// app.js — MatchSticks, rewritten for cleaner state management and safer UX

const API_PATH = '/.netlify/functions/recommend';

const form = document.getElementById('searchForm');
const queryInput = document.getElementById('query');
const status = document.getElementById('status');
const results = document.getElementById('results');

const state = {
  currentQuery: '',
  currentResults: [],
  liked: new Set(),
  disliked: new Set(),
  seen: new Set(),
  loading: false
};

function formatTier(tier) {
  if (!tier) return '';
  switch (tier) {
    case 'luxury':
      return 'Luxury';
    case 'premium':
      return 'Premium';
    case 'mid-range':
      return 'Mid-Range';
    case 'budget':
      return 'Budget';
    default:
      return tier.charAt(0).toUpperCase() + tier.slice(1);
  }
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getCigarKey(cigar) {
  const brand = cigar?.brand?.trim()?.toLowerCase() || '';
  const name = cigar?.name?.trim()?.toLowerCase() || '';
  return `${brand}::${name}`;
}

function isValidCigar(cigar) {
  return !!(cigar && typeof cigar === 'object' && cigar.name && cigar.brand);
}

function renderCigar(cigar, index) {
  const flavorNotes = Array.isArray(cigar.flavorNotes)
    ? cigar.flavorNotes.map(escapeHtml).join(', ')
    : '';

  const key = getCigarKey(cigar);
  const liked = state.liked.has(key);

  return `
    <article class="card" data-index="${index}" data-key="${escapeHtml(key)}">
      <div class="name">${escapeHtml(cigar.name)}</div>
      <div class="brand">${escapeHtml(cigar.brand)}</div>
      <div class="meta">
        Strength: ${escapeHtml(cigar.strength || 'Unknown')}
        &nbsp;|&nbsp;
        Tier: <b>${escapeHtml(formatTier(cigar.priceTier) || 'Unknown')}</b>
      </div>
      <div class="notes">
        Flavor Notes: ${flavorNotes || 'Not available'}
      </div>
      <div class="actions">
        <button
          type="button"
          class="like"
          title="${liked ? 'Liked' : 'Like this cigar'}"
          aria-pressed="${liked ? 'true' : 'false'}"
        >
          ${liked ? '❤️ Liked' : '👍 Like'}
        </button>
        <button
          type="button"
          class="dislike"
          title="Replace this cigar"
        >
          👎 Replace
        </button>
      </div>
    </article>
  `;
}

function renderResults() {
  results.innerHTML = state.currentResults
    .map((cigar, index) => renderCigar(cigar, index))
    .join('');
}

function setStatus(message) {
  status.textContent = message;
}

function setLoading(isLoading) {
  state.loading = isLoading;

  const submitBtn = form.querySelector('button[type="submit"]');
  if (submitBtn) {
    submitBtn.disabled = isLoading;
    submitBtn.textContent = isLoading ? 'Finding…' : 'Get 3 recs';
  }

  queryInput.disabled = isLoading;
}

function normalizeRecommendations(items) {
  if (!Array.isArray(items)) return [];

  const unique = [];
  const used = new Set();

  for (const cigar of items) {
    if (!isValidCigar(cigar)) continue;

    const key = getCigarKey(cigar);
    if (!key || used.has(key)) continue;
    if (state.disliked.has(key)) continue;

    used.add(key);
    unique.push(cigar);
  }

  return unique;
}

async function postRecommendations(payload) {
  const res = await fetch(API_PATH, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    throw new Error(`Request failed with status ${res.status}`);
  }

  const data = await res.json();

  if (!Array.isArray(data)) {
    throw new Error('API did not return an array');
  }

  return data;
}

async function fetchRecommendations({ replace = false } = {}) {
  const query = state.currentQuery.trim();

  if (!query) {
    setStatus('Please enter a cigar name, brand, or line.');
    results.innerHTML = '';
    return;
  }

  setLoading(true);
  setStatus(replace ? 'Finding a better replacement…' : 'Finding your recs…');

  try {
    const payload = {
      query,
      liked: [...state.liked],
      disliked: [...state.disliked],
      seen: [...state.seen]
    };

    const raw = await postRecommendations(payload);
    const normalized = normalizeRecommendations(raw);

    if (!normalized.length) {
      if (!state.currentResults.length) {
        results.innerHTML = '';
        setStatus('No recommendations found — try a different search.');
      } else {
        setStatus('No more fresh recommendations found for that search.');
      }
      return;
    }

    return normalized;
  } catch (error) {
    console.error('Recommendation fetch failed:', error);
    setStatus('Sorry — something went wrong. Please try again.');
    return null;
  } finally {
    setLoading(false);
  }
}

function rememberResults(items) {
  items.forEach((cigar) => {
    state.seen.add(getCigarKey(cigar));
  });
}

function resetSessionForNewQuery(query) {
  state.currentQuery = query;
  state.currentResults = [];
  state.liked.clear();
  state.disliked.clear();
  state.seen.clear();
}

async function handleSearchSubmit(event) {
  event.preventDefault();
  if (state.loading) return;

  const query = queryInput.value.trim();

  if (!query) {
    setStatus('Please enter a cigar name, brand, or line.');
    results.innerHTML = '';
    return;
  }

  resetSessionForNewQuery(query);
  results.innerHTML = '';

  const recs = await fetchRecommendations();
  if (!recs || !recs.length) return;

  const topThree = recs.slice(0, 3);
  state.currentResults = topThree;
  rememberResults(topThree);
  renderResults();
  setStatus('');
}

async function replaceRecommendationAt(index) {
  if (state.loading) return;
  if (index < 0 || index >= state.currentResults.length) return;

  const current = state.currentResults[index];
  if (!current) return;

  const currentKey = getCigarKey(current);
  state.disliked.add(currentKey);

  const recs = await fetchRecommendations({ replace: true });
  if (!recs || !recs.length) {
    setStatus('No better replacement found right now.');
    renderResults();
    return;
  }

  const existingKeys = new Set(state.currentResults.map(getCigarKey));
  existingKeys.add(currentKey);

  const replacement = recs.find((cigar) => {
    const key = getCigarKey(cigar);
    return !existingKeys.has(key) && !state.disliked.has(key);
  });

  if (!replacement) {
    setStatus('No new replacement available yet.');
    renderResults();
    return;
  }

  state.currentResults[index] = replacement;
  state.seen.add(getCigarKey(replacement));
  renderResults();
  setStatus('Updated one recommendation.');
}

function toggleLikeAt(index) {
  if (index < 0 || index >= state.currentResults.length) return;

  const cigar = state.currentResults[index];
  if (!cigar) return;

  const key = getCigarKey(cigar);

  if (state.liked.has(key)) {
    state.liked.delete(key);
    setStatus('Removed from liked cigars.');
  } else {
    state.liked.add(key);
    state.disliked.delete(key);
    setStatus('Saved as liked — future recs can lean this direction.');
  }

  renderResults();
}

function getCardIndexFromEventTarget(target) {
  const card = target.closest('.card');
  if (!card) return -1;

  const index = Number(card.getAttribute('data-index'));
  return Number.isInteger(index) ? index : -1;
}

form.addEventListener('submit', handleSearchSubmit);

results.addEventListener('click', async (event) => {
  const likeButton = event.target.closest('.like');
  const dislikeButton = event.target.closest('.dislike');

  if (!likeButton && !dislikeButton) return;

  const index = getCardIndexFromEventTarget(event.target);
  if (index === -1) return;

  if (likeButton) {
    toggleLikeAt(index);
    return;
  }

  if (dislikeButton) {
    await replaceRecommendationAt(index);
  }
});

