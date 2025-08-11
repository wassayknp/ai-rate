/**
 * Simple fuzzy string matching algorithm
 * Returns a score between 0 and 1, where 1 is a perfect match
 */
export function fuzzyMatch(text: string, pattern: string): number {
  const lowerText = text.replace(/[^a-zA-Z0-9 ]/g, '').toLowerCase();
  const lowerPattern = pattern.replace(/[^a-zA-Z0-9 ]/g, '').toLowerCase();
 
  
  // Exact match
  if (lowerText === lowerPattern) return 1;
  
  // Contains match
  if (lowerText.includes(lowerPattern)) return 0.9;
  
  // Check for partial matches
  let score = 0;
  const words = lowerPattern.split(/\s+/);
  
  for (const word of words) {
    if (word.length < 2) continue; // Skip very short words
    
    if (lowerText.includes(word)) {
      score += 0.3;
    } else {
      // Check for partial word matches
      for (let i = 0; i < word.length - 1; i++) {
        const part = word.substring(i, i + 2);
        if (lowerText.includes(part)) {
          score += 0.1;
          break;
        }
      }
    }
  }
  
  return Math.min(score, 0.8); // Cap at 0.8 for partial matches
}

/**
 * Search for products using fuzzy matching
 */
export function fuzzySearchProducts<T extends { name: string }>(
  products: T[],
  query: string,
  threshold = 0.3
): T[] {
  if (!query || query.trim() === '') return products;
  
  return products
    .map(product => ({
      product,
      score: fuzzyMatch(product.name, query)
    }))
    .filter(item => item.score >= threshold)
    .sort((a, b) => b.score - a.score)
    .map(item => item.product);
}