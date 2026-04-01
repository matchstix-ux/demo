// app.js — MatchSticks, rewritten for cleaner state management and safer UX

const API_PATH = '/.netlify/functions/recommend';
const STATUS_AUTO_CLEAR_MS = 4000;
const REPLACE_COOLDOWN_MS = 1000;

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
  loading: false,
  abortController: null,
  statusTimer: null,
  replaceCooldownUntil: 0
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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

function isValidCigarKey(key) {
  return typeof key === 'string' && key !== '::' && key.length > 2;
}

function isValidCigar(cigar) {
  return !!(cigar && typeof cigar === 'object' && cigar.name && cigar.brand);
}

// ---------------------------------------------------------------------------
// Serialization — Sets aren't JSON-safe, so explicit helpers keep it clean
// ---------------------------------------------------------------------------

function serializeState() {
  return {
    currentQuery: state.currentQuery,
    currentResults: state.currentResults,
    liked: [...state.liked],
    disliked: [...state.disliked],
    seen: [...state.seen]
  };
}

function restoreState(saved) {
  if (!saved) return;
  state.currentQuery = saved.currentQuery || '';
  state.currentResults = Array.isArray(saved.currentResults) ? saved.currentResults : [];
  state.liked = new Set(saved.liked || []);
  state.disliked = new Set(saved.disliked || []);
  state.seen = new Set(saved.seen || []);
}

// ---------------------------------------------------------------------------
// Status messages — transient confirmations auto-clear; errors persist
// ---------------------------------------------------------------------------

function setStatus(message, { persistent = false } = {}) {
  if (state.statusTimer) {
    clearTimeout(state.statusTimer);
    state.statusTimer = null;
  }

  status.textContent = message;

  if (message && !persistent) {
    state.statusTimer = setTimeout(() => {
      // Only clear if the message hasn't been replaced in the meantime
      if (status.textContent === message) {
        status.textContent = '';
      }
      state.statusTimer = null;
    }, STATUS_AUTO_CLEAR_MS);
  }
}

// ---------------------------------------------------------------------------
// Rendering — targeted card updates preserve focus; full render on new search
// ---------------------------------------------------------------------------

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
  syncButtonStates();
}

function updateCardAt(index, { restoreFocus = null } = {}) {
  const card = results.querySelector(`.card[data-index="${index}"]`);
  if (!card) {
    renderResults();
    return;
  }

  const temp = document.createElement('div');
  temp.innerHTML = renderCigar(state.currentResults[index], index);
  const newCard = temp.firstElementChild;

  card.replaceWith(newCard);
  syncButtonStates();

  // Restore focus to the same button type the user just clicked
  if (restoreFocus) {
    const btn = newCard.querySelector(`.${restoreFocus}`);
    if (btn) btn.focus();
  }
}

function syncButtonStates() {
  const disabled = state.loading;
  results.querySelectorAll('.actions button').forEach((btn) => {
    btn.disabled = disabled;
  });
}

// ---------------------------------------------------------------------------
// Loading state
// ---------------------------------------------------------------------------

function setLoading(isLoading) {
  state.loading = isLoading;

  const submitBtn = form.querySelector('button[type="submit"]');
  if (submitBtn) {
    submitBtn.disabled = isLoading;
    submitBtn.textContent = isLoading ? 'Finding…' : 'Get 3 recs';
  }

  queryInput.disabled = isLoading;
  syncButtonStates();
}

// ---------------------------------------------------------------------------
// Abort control — cancel in-flight requests on new search
// ---------------------------------------------------------------------------

function abortInflight() {
  if (state.abortController) {
    state.abortController.abort();
    state.abortController = null;
  }
}

// ---------------------------------------------------------------------------
// Normalization — de-duplication is owned client-side; server may also filter
// via the `seen` payload, but we don't rely on it.
// ---------------------------------------------------------------------------

function normalizeRecommendations(items, { skipSeen = false } = {}) {
  if (!Array.isArray(items)) return [];

  const unique = [];
  const used = new Set();

  for (const cigar of items) {
    if (!isValidCigar(cigar)) continue;

    const key = getCigarKey(cigar);
    if (!isValidCigarKey(key) || used.has(key)) continue;
    if (state.disliked.has(key)) continue;
    // Skip seen filtering on the initial search so we always show fresh results
    if (!skipSeen && state.seen.has(key)) continue;

    used.add(key);
    unique.push(cigar);
  }

  return unique;
}

// ---------------------------------------------------------------------------
// API layer
// ---------------------------------------------------------------------------

async function postRecommendations(payload, signal) {
  const res = await fetch(API_PATH, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal
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
    setStatus('Please enter a cigar name, brand, or line.', { persistent: true });
    results.innerHTML = '';
    return [];
  }

  // Cancel any in-flight request before starting a new one
  abortInflight();
  state.abortController = new AbortController();

  setLoading(true);
  setStatus(replace ? 'Finding a better replacement…' : 'Finding your recs…', { persistent: true });

  try {
    const payload = {
      query,
      liked: [...state.liked],
      disliked: [...state.disliked],
      seen: [...state.seen]
    };

    const raw = await postRecommendations(payload, state.abortController.signal);
    const normalized = normalizeRecommendations(raw, { skipSeen: !replace });

    if (!normalized.length) {
      if (!state.currentResults.length) {
        results.innerHTML = '';
        setStatus('No recommendations found — try a different search.', { persistent: true });
      } else {
        setStatus('No more fresh recommendations found for that search.', { persistent: true });
      }
      return [];
    }

    return normalized;
  } catch (error) {
    // Don't treat user-initiated aborts as errors
    if (error.name === 'AbortError') {
      return [];
    }
    console.error('Recommendation fetch failed:', error);
    setStatus('Sorry — something went wrong. Please try again.', { persistent: true });
    return null;
  } finally {
    state.abortController = null;
    setLoading(false);
  }
}

// ---------------------------------------------------------------------------
// State management
// ---------------------------------------------------------------------------

function rememberResults(items) {
  items.forEach((cigar) => {
    state.seen.add(getCigarKey(cigar));
  });
}

function resetSessionForNewQuery(query) {
  abortInflight();
  state.currentQuery = query;
  state.currentResults = [];
  state.liked.clear();
  state.disliked.clear();
  state.seen.clear();
}

// ---------------------------------------------------------------------------
// Event handlers
// ---------------------------------------------------------------------------

async function handleSearchSubmit(event) {
  event.preventDefault();
  if (state.loading) return;

  const query = queryInput.value.trim();

  if (!query) {
    setStatus('Please enter a cigar name, brand, or line.', { persistent: true });
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

  // Rate-limit rapid Replace clicks
  if (Date.now() < state.replaceCooldownUntil) {
    setStatus('Hold on — give it a second before replacing again.');
    return;
  }

  const current = state.currentResults[index];
  if (!current) return;

  const currentKey = getCigarKey(current);
  state.disliked.add(currentKey);

  // Re-render immediately for visual feedback (buttons disabled via setLoading)
  renderResults();

  const recs = await fetchRecommendations({ replace: true });

  // Start cooldown after the request completes
  state.replaceCooldownUntil = Date.now() + REPLACE_COOLDOWN_MS;

  if (!recs || !recs.length) {
    setStatus('No better replacement found right now.', { persistent: true });
    renderResults();
    return;
  }

  const existingKeys = new Set(state.currentResults.map(getCigarKey));
  existingKeys.add(currentKey);

  const replacement = recs.find((cigar) => {
    const key = getCigarKey(cigar);
    return !existingKeys.has(key);
  });

  if (!replacement) {
    setStatus('No new replacement available yet.', { persistent: true });
    renderResults();
    return;
  }

  state.currentResults[index] = replacement;
  state.seen.add(getCigarKey(replacement));
  updateCardAt(index);
  setStatus('Updated one recommendation.');
}

function toggleLikeAt(index, { restoreFocus = null } = {}) {
  if (state.loading) return;
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

  updateCardAt(index, { restoreFocus });
}

function getCardIndexFromEventTarget(target) {
  const card = target.closest('.card');
  if (!card) return -1;

  const index = Number(card.getAttribute('data-index'));
  return Number.isInteger(index) ? index : -1;
}

// ---------------------------------------------------------------------------
// Event binding
// ---------------------------------------------------------------------------

form.addEventListener('submit', handleSearchSubmit);

results.addEventListener('click', async (event) => {
  const likeButton = event.target.closest('.like');
  const dislikeButton = event.target.closest('.dislike');

  if (!likeButton && !dislikeButton) return;

  const index = getCardIndexFromEventTarget(event.target);
  if (index === -1) return;

  if (likeButton) {
    toggleLikeAt(index, { restoreFocus: 'like' });
    return;
  }

  if (dislikeButton) {
    await replaceRecommendationAt(index);
  }
});


