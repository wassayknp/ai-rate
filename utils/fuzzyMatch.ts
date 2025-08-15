import Fuse, { IFuseOptions } from 'fuse.js';
import { Product as ImportedProduct } from '@/types/product';

interface ProductSearchResult {
  item: ImportedProduct;
  score: number;
  matches: number;
}

export function fuzzySearchProducts(
  products: ImportedProduct[],
  query: string
): ImportedProduct[] {
  if (!query || query.trim() === '') {
    return products;
  }

  // Normalize query to only alphanumeric characters
  const normalizedQuery = query.replace(/[^a-zA-Z0-9\s]/g, '').toLowerCase();
  const queryWords = normalizedQuery.split(/\s+/).filter(word => word.length > 0);

  // If no valid words after normalization, return all products
  if (queryWords.length === 0) {
    return products;
  }

  // Pre-process products to normalize names
  const processedProducts = products.map(product => ({
    ...product,
    normalizedName: product.name.replace(/[^a-zA-Z0-9\s]/g, '').toLowerCase()
  }));

  // Configure Fuse.js options
  const fuseOptions: IFuseOptions<ImportedProduct> = {
    keys: ['name'],
    threshold: 0.4, // Adjust for stricter/looser matching
    includeScore: true,
    minMatchCharLength: 2,
    shouldSort: true,
    ignoreLocation: true,
    findAllMatches: true
  };

  // Create Fuse instance
  const fuse = new Fuse(processedProducts, fuseOptions);

  // Search for each word and collect results
  const allResults: ProductSearchResult[] = [];
  const resultMap = new Map<ImportedProduct, ProductSearchResult>();
  
  queryWords.forEach(word => {
    const wordResults = fuse.search(word);
    wordResults.forEach(result => {
      const existingResult = resultMap.get(result.item);
      if (existingResult) {
        existingResult.matches++;
        existingResult.score += result.score || 0;
      } else {
        const newResult: ProductSearchResult = {
          item: result.item,
          score: result.score || 0,
          matches: 1
        };
        resultMap.set(result.item, newResult);
        allResults.push(newResult);
      }
    });
  });

  // Sort by number of matches (descending) and then by score (ascending)
  allResults.sort((a, b) => {
    if (a.matches !== b.matches) {
      return b.matches - a.matches;
    }
    return a.score - b.score;
  });

  // Return just the products in the sorted order
  return allResults.map(result => result.item);
}
