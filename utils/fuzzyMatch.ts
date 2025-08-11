import Fuse from 'fuse.js';
import { Product } from '@/types/product';

/**
 * Search for products using Fuse.js for fuzzy matching
 */
export function fuzzySearchProducts(
  products: Product[],
  query: string
): Product[] {
  if (!query || query.trim() === '') {
    return products;
  }

  const fuseOptions = {
    keys: [
      'name',
      'category',
      'hsnCode',
    ],
    includeScore: true,
    threshold: 0.4,
    minMatchCharLength: 2,
    findAllMatches: true,
  };

  const fuse = new Fuse(products, fuseOptions);
  const results = fuse.search(query);
  
  return results.map(result => result.item);
}