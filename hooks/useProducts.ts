import mockProducts from '@/mocks/products';
import { APIProduct, Product } from '@/types/product';
import { fuzzySearchProducts } from '@/utils/fuzzyMatch';
import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Toast from 'react-native-toast-message';

type SearchMode = 'item' | 'rate' | 'hsn';

// Updated types for new sorting system
type SortField = 'category' | 'name' | 'rating' | 'stock' | 'finalprice' | 'hsn';
type SortDirection = 'asc' | 'desc';
type DateType = 'purchase' | 'sale';
type DatePreset = 'last-month' | 'last-quarter' | 'last-year' | 'all-time';

// Legacy type for backward compatibility
type SortOption = 'category' | 'name-asc' | 'name-desc' | 'rating' | 'hsn' | 'stock';

type ProductsState = {
  products: Product[];
  filteredProducts: Product[];
  selectedCategory: string | null;
  searchQuery: string;
  showOnlyInStock: boolean;
  isLoading: boolean;
  hasNegativeStock: boolean;
  searchMode: SearchMode;
  toastMessage: string;
  toastVisible: boolean;
  toastPosition: 'top' | 'center' | 'bottom';
  currentSort: SortOption;
  currentSortField: SortField | null;
  currentSortDirection: SortDirection;
  selectedDateType: DateType;
  selectedDatePreset: DatePreset;
  ratingFilter: [number, number];
  selectedFlags: string[];
  setSelectedCategory: (category: string | null) => void;
  setSearchQuery: (query: string) => void;
  setShowOnlyInStock: (show: boolean) => void;
  setSearchMode: (mode: SearchMode) => void;
  setCurrentSort: (sort: SortOption) => void;
  setSortField: (field: SortField | null, direction: SortDirection) => void;
  setDateFilter: (type: DateType, preset: DatePreset) => void;
  setRatingFilter: (min: number, max: number) => void;
  setSelectedFlags: (flags: string[]) => void;
  resetAllFilters: () => void;
  refreshData: () => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info', position?: 'top' | 'center' | 'bottom') => void;
  hideToast: () => void;
  adminConfig: any;
  updateAdminConfig: (config: any) => void;
};

export const [ProductsProvider, useProducts] = createContextHook(() => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showOnlyInStock, setShowOnlyInStock] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [searchMode, setSearchMode] = useState<SearchMode>('item');
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [toastPosition, setToastPosition] = useState<'top' | 'center' | 'bottom'>('bottom');
  
  // Legacy sort state (for backward compatibility)
  const [currentSort, setCurrentSort] = useState<SortOption>('category');
  
  // New sort states
  const [currentSortField, setCurrentSortField] = useState<SortField | null>(null);
  const [currentSortDirection, setCurrentSortDirection] = useState<SortDirection>('asc');
  
  // Date filter states
  const [selectedDateType, setSelectedDateType] = useState<DateType>('purchase');
  const [selectedDatePreset, setSelectedDatePreset] = useState<DatePreset>('all-time');
  
  const [ratingFilter, setRatingFilterState] = useState<[number, number]>([0, 5]);
  const [selectedFlags, setSelectedFlags] = useState<string[]>([]);
  const [adminConfig, setAdminConfig] = useState<any>(null);

  const showToast = useCallback((
    message: string,
    type: 'success' | 'error' | 'info' = 'info',
    position: 'top' | 'center' | 'bottom' = 'bottom'
  ) => {
    let toastPosition: 'top' | 'bottom' = 'bottom';

    if (position === 'top') toastPosition = 'top';
    if (position === 'center') toastPosition = 'top';

    Toast.show({
      type,
      text1: message,
      position: toastPosition,
      visibilityTime: 2000,
      topOffset: position === 'center' ? 250 : 40,
    });
  }, []);

  const hideToast = () => {
    setToastVisible(false);
  };

  // Utility function for time ago string
  const getTimeAgoString = (dateString: string): string => {
    const now = new Date();
    const updatedAt = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - updatedAt.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return `${diffInSeconds} seconds ago`;
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      const remainingMinutes = diffInMinutes % 60;
      if (remainingMinutes > 0) {
        return `${diffInHours}.${Math.floor(remainingMinutes / 6)} hour${diffInHours === 1 ? '' : 's'} ago`;
      }
      return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
  };

  // Transform API data to internal Product structure
  const transformAPIData = (apiProducts: APIProduct[]): Product[] => {
    return apiProducts.map(apiProduct => {
      return {
        id: apiProduct.i,
        name: apiProduct.n,
        category: apiProduct.c,
        quantityInStock: apiProduct.q,
        stock: apiProduct.q, // alias for compatibility
        hsnCode: apiProduct.h,
        hsn: apiProduct.h, // alias for compatibility
        gstPercentage: apiProduct.p,
        baseRate: apiProduct.b,
        finalRate: apiProduct.g,
        finalprice: apiProduct.g, // alias for new sort system
        rating: apiProduct.r,
        unitOfMeasurement: apiProduct.u,
        inwardQuantity: apiProduct.iq,
        outwardQuantity: apiProduct.oq,
        purchaseDate: apiProduct.pd,
        saleDate: apiProduct.sd,
        // Convert flags from 0/1 to boolean
        isHighestConsumption: apiProduct.f?.hc === 1,
        isHighestRated: apiProduct.f?.hr === 1,
        isHighestStock: apiProduct.f?.hs === 1,
        isFrequentlySold: apiProduct.f?.fs === 1,
        isNewArrival: apiProduct.f?.na === 1,
        isLowDemand: apiProduct.f?.ld === 1,
        isOutOfStock: apiProduct.f?.os === 1,
        isOldStock: apiProduct.f?.osk === 1,
      };
    });
  };

  // Load admin configuration
  const loadAdminConfig = useCallback(async () => {
    try {
      const savedConfig = await AsyncStorage.getItem('adminConfig');
      if (savedConfig) {
        const config = JSON.parse(savedConfig);
        setAdminConfig(config);
        return config;
      }
    } catch (error) {
      console.error('Failed to load admin config:', error);
    }
    return null;
  }, []);

  // Optimized fetch function
  const fetchProducts = useCallback(async (showRefreshToast = false) => {
    setIsLoading(true);
    let apiUrl = 'http://192.168.5.25:12345';

    try {
      const config = adminConfig || await loadAdminConfig();
      if (config && config.serverUrl) {
        apiUrl = config.serverUrl.startsWith('http') ? config.serverUrl : `http://${config.serverUrl}`;
      }
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // Reduced timeout
      
      const response = await fetch(`${apiUrl}/list`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Fetched products from API:', data);
      
      // Handle different API response formats
      let productsData = data;
      if (data.data && Array.isArray(data.data)) {
        productsData = data.data; // Handle {metadata, data, last_updated} format
      }
      
      // Validate and transform data structure
      if (Array.isArray(productsData) && productsData.length > 0) {
        const transformedProducts = transformAPIData(productsData as APIProduct[]);
        setProducts(transformedProducts);
        
        // Cache the data
        await AsyncStorage.setItem('cachedProducts', JSON.stringify(transformedProducts));
        await AsyncStorage.setItem('lastDataUpdate', data.last_updated?.time);
        
        if (showRefreshToast) {
          if (data.last_updated?.time) {
            const timeAgo = getTimeAgoString(data.last_updated.time);
            showToast(`✅ Data refreshed (updated ${timeAgo})`, 'success', 'top');
          } else {
            showToast(`✅ Data refreshed`, 'success', 'top');
          }
        } else {
          const count = transformedProducts.length;
          let message = `📦 ${count} stock items available`;
          if (data.last_updated?.time) {
            const timeAgo = getTimeAgoString(data.last_updated.time);
            message += ` (updated ${timeAgo})`;
          }
          showToast(message, 'info', 'center');
        }
      } else {
        throw new Error('Invalid data format from API - missing pricelist');
      }
    } catch (error) {
      console.log('API fetch failed, trying cached data:', error);
      
      try {
        const cachedData = await AsyncStorage.getItem('cachedProducts');
        const lastUpdate = await AsyncStorage.getItem('lastDataUpdate');
        
        if (cachedData) {
          const cachedProducts = JSON.parse(cachedData);
          setProducts(cachedProducts);
          
          if (showRefreshToast) {
            if (lastUpdate) {
              const timeAgo = getTimeAgoString(lastUpdate);
              showToast(`📱 Using cached data (updated ${timeAgo})`, 'info', 'top');
            } else {
              showToast(`📱 Using cached data`, 'info', 'top');
            }
          } else {
            let message = `📦 ${cachedProducts.length} stock items available (cached data)`;
            if (lastUpdate) {
              const timeAgo = getTimeAgoString(lastUpdate);
              message += ` (updated ${timeAgo})`;
            }
            showToast(message, 'info', 'center');
          }
          return;
        }
      } catch (cacheError) {
        console.log('Failed to load cached data:', cacheError);
      }
      
      // Final fallback to mock data
      setProducts(mockProducts);
      if (showRefreshToast) {
        showToast('📱 Using offline data - API unavailable', 'error', 'top');
      } else {
        const count = mockProducts.length;
        showToast(`📦 ${count} stock items available (offline mode)`, 'info', 'center');
      }
    } finally {
      setIsLoading(false);
    }
  }, [adminConfig, loadAdminConfig, transformAPIData, showToast]);

  // New sort handler
  const setSortField = useCallback((field: SortField | null, direction: SortDirection) => {
    setCurrentSortField(field);
    setCurrentSortDirection(direction);
  }, []);

  // Date filter handler
  const setDateFilter = useCallback((type: DateType, preset: DatePreset) => {
    setSelectedDateType(type);
    setSelectedDatePreset(preset);
  }, []);

  // Rating filter handler
  const setRatingFilter = useCallback((min: number, max: number) => {
    setRatingFilterState([min, max]);
  }, []);

  // Reset all filters
  const resetAllFilters = useCallback(() => {
    setSelectedCategory(null);
    setCurrentSortField(null);
    setCurrentSortDirection('asc');
    setSelectedDateType('purchase');
    setSelectedDatePreset('all-time');
    setSelectedFlags([]);
    setRatingFilterState([0, 5]);
    setSearchQuery('');
    setShowOnlyInStock(false);
  }, []);

  // Date filtering helper
// Date filtering helper
const filterByDate = useCallback((
  products: Product[],
  dateType: DateType,
  preset: DatePreset
) => {
  if (preset === 'all-time') return products;

  const now = new Date();
  let cutoffDate = new Date();

  switch (preset) {
    case 'last-month':
      cutoffDate.setMonth(now.getMonth() - 1);
      break;
    case 'last-quarter':
      cutoffDate.setMonth(now.getMonth() - 3);
      break;
    case 'last-year':
      cutoffDate.setFullYear(now.getFullYear() - 1);
      break;
  }


  const dateField: keyof Product = dateType === 'purchase' ? 'purchaseDate' : 'saleDate';

  return products.filter(product => {
    // This assumes date strings in ISO format e.g. '2024-03-10'
    const productDate = product[dateField];
    if (!productDate) return false;

    // Safely parse date string (or number), skip if invalid
    const date = new Date(productDate as string);
    if (isNaN(date.getTime())) return false;

    return date >= cutoffDate;
  });
}, []);


  // Sorting helper
  const sortProducts = useCallback((products: Product[], field: SortField | null, direction: SortDirection) => {
    if (!field) return products;

    return [...products].sort((a, b) => {
      let aValue = a[field as keyof Product];
      let bValue = b[field as keyof Product];

      // Handle different data types
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      // Handle numbers
      if (field === 'finalprice' || field === 'stock' || field === 'rating') {
        aValue = Number(aValue) || 0;
        bValue = Number(bValue) || 0;
      }

      // Handle null/undefined
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return 1;
      if (bValue == null) return -1;

      let comparison = 0;
      if (aValue < bValue) comparison = -1;
      if (aValue > bValue) comparison = 1;

      return direction === 'desc' ? -comparison : comparison;
    });
  }, []);

  // Optimized filtered products with memoization
  const filteredProducts = useMemo(() => {
    let result = products;
    
    // Early return if no products
    if (result.length === 0) return result;
    
    // Filter by category
    if (selectedCategory) {
      result = result.filter(product => product.category === selectedCategory);
    }
    
    // Filter by stock
    if (showOnlyInStock) {
      result = result.filter(product => (product.quantityInStock || 0) > 0);
    }
    
    // Filter by rating
    if (ratingFilter[0] > 0 || ratingFilter[1] < 5) {
      result = result.filter(product => 
        (product.rating || 0) >= ratingFilter[0] && (product.rating || 0) <= ratingFilter[1]
      );
    }
    
    // Filter by flags
    if (selectedFlags.length > 0) {
      result = result.filter(product => {
        return selectedFlags.some(flag => {
          return Boolean(product[flag as keyof Product]);
        });
      });
    }
    
    // Apply date filter
    result = filterByDate(result, selectedDateType, selectedDatePreset);
    
    // Apply search query based on search mode
    if (searchQuery.trim()) {
      if (searchMode === 'item') {
        result = fuzzySearchProducts(result, searchQuery);
      } else if (searchMode === 'rate') {
        const searchRate = parseFloat(searchQuery);
        if (!isNaN(searchRate)) {
          result = result.filter(product => {
            const rate = product.finalRate || 0;
            const gst = product.gstPercentage || 0;
            const tolerance = 0.05;
            return (
              Math.abs(rate - searchRate) <= rate * tolerance ||
              Math.abs(gst - searchRate) <= gst * tolerance
            );
          });
        }
      } else if (searchMode === 'hsn') {
        result = result.filter(product => 
          (product.hsnCode || '').toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
    }
    
    // Apply new sorting system
    result = sortProducts(result, currentSortField, currentSortDirection);
    
    return result;
  }, [
    products,
    selectedCategory,
    showOnlyInStock,
    searchQuery,
    searchMode,
    currentSortField,
    currentSortDirection,
    selectedDateType,
    selectedDatePreset,
    ratingFilter,
    selectedFlags,
    filterByDate,
    sortProducts
  ]);

  // Initial data load and setup
useEffect(() => {
  const initializeApp = async () => {
    await loadAdminConfig();
    fetchProducts();
  };

  initializeApp();

  // Set up auto-refresh every 5 minutes
  const intervalId = setInterval(() => {
    fetchProducts(true);
  }, 5 * 60 * 1000);

  return () => clearInterval(intervalId);
}, []); // <-- Only run once on mount


  // Check for negative stock
  useEffect(() => {
    if (products.length > 0) {
      const negativeStockItems = products.filter(product => (product.quantityInStock || 0) < 0);
      if (negativeStockItems.length > 0) {
        const itemNames = negativeStockItems.map(item => item.name).join(', ');
        showToast(`⚠️ Negative stock: ${itemNames}`, 'error', 'top');
      }
    }
  }, [products, showToast]);

  // Check for negative stock memoized
  const hasNegativeStock = useMemo(() => {
    return products.some(product => (product.quantityInStock || 0) < 0);
  }, [products]);

  return {
    products,
    filteredProducts,
    selectedCategory,
    searchQuery,
    showOnlyInStock,
    isLoading,
    hasNegativeStock,
    searchMode,
    toastMessage,
    toastVisible,
    toastPosition,
    currentSort,
    currentSortField,
    currentSortDirection,
    selectedDateType,
    selectedDatePreset,
    ratingFilter,
    selectedFlags,
    setSelectedCategory,
    setSearchQuery,
    setShowOnlyInStock,
    setSearchMode,
    setCurrentSort,
    setSortField,
    setDateFilter,
    setRatingFilter,
    setSelectedFlags,
    resetAllFilters,
    refreshData: () => fetchProducts(true),
    showToast,
    hideToast,
    adminConfig,
    updateAdminConfig: (config: any) => {
      setAdminConfig(config);
      fetchProducts(true);
    }
  };
});