// FIXED: Enhanced strength similarity scoring
function calculateSimilarity(c1, c2) {
  if (!c1 || !c2 || typeof c1 !== 'object' || typeof c2 !== 'object') {
    return 0;
  }

  let score = 0;

  // Wrapper similarity
  if (c1.wrapper && c2.wrapper) {
    const w1 = safeStringOperation(c1.wrapper);
    const w2 = safeStringOperation(c2.wrapper);
    if (w1 === w2) score += 4;
    else if (
      (w1.includes('maduro') && w2.includes('maduro')) ||
      (w1.includes('connecticut') && w2.includes('connecticut')) ||
      (w1.includes('habano') && w2.includes('habano')) ||
      (w1.includes('corojo') && w2.includes('corojo')) ||
      (w1.includes('broadleaf') && w2.includes('broadleaf'))
    ) {
      score += 2;
    } else if (
      (w1.includes('ecuador') && w2.includes('ecuador')) ||
      (w1.includes('sun grown') && w2.includes('sun grown'))
    ) {
      score += 1;
    }
  }

  // Origin similarity
  if (c1.origin && c2.origin) {
    const o1 = safeStringOperation(c1.origin);
    const o2 = safeStringOperation(c2.origin);
    if (o1 === o2) score += 3;
    else if (
      (o1 === 'nicaragua' && o2 === 'honduras') ||
      (o1 === 'honduras' && o2 === 'nicaragua')
    ) {
      score += 1;
    }
  }

  // Price tier similarity
  if (c1.priceTier && c2.priceTier) {
    if (c1.priceTier === c2.priceTier) score += 2;
    else if (
      (c1.priceTier === 'mid-range' && c2.priceTier === 'premium') ||
      (c1.priceTier === 'premium' && c2.priceTier === 'mid-range')
    ) {
      score += 1;
    }
  }

  // Body similarity (also important)
  if (typeof c1.body === 'number' && typeof c2.body === 'number') {
    const diff = Math.abs(c1.body - c2.body);
    if (diff === 0) score += 6; // Exact body match
    else if (diff === 1) score += 3; // Close body
    else if (diff === 2) score += 1; // Moderate difference
    else score -= 2; // Big body difference - small penalty
  }

  // FIXED: Strength similarity with better scoring and penalties
  if (typeof c1.strength === 'number' && typeof c2.strength === 'number') {
    const diff = Math.abs(c1.strength - c2.strength);
    if (diff === 0) score += 8; // Exact strength match - increased from 2 to 8
    else if (diff === 1) score += 4; // Close strength - increased from 1 to 4
    else if (diff === 2) score += 1; // Moderate difference - was not scored before
    else if (diff >= 3) score -= 3; // Big strength difference - penalty for bad matches
  }

  // Flavor notes similarity
  if (Array.isArray(c1.flavorNotes) && Array.isArray(c2.flavorNotes)) {
    const notes1 = c1.flavorNotes.map(n => safeStringOperation(n));
    const notes2 = c2.flavorNotes.map(n => safeStringOperation(n));

    const exactMatches = notes1.filter(note => notes2.includes(note));
    score += Math.min(exactMatches.length * 1.5, 5);

    const families = {
      earthy: ['earth', 'leather', 'tobacco', 'cedar', 'oak'],
      sweet: ['chocolate', 'cocoa', 'caramel', 'honey', 'cream', 'sweetness'],
      spicy: ['pepper', 'spice', 'cinnamon'],
      coffee: ['coffee', 'espresso']
    };

    Object.values(families).forEach(family => {
      const has1 = notes1.some(n => family.includes(n));
      const has2 = notes2.some(n => family.includes(n));
      if (has1 && has2) score += 0.5;
    });
  }

  return score;
}
