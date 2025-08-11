import AdminConfig from '@/components/AdminConfig';
import BottomDragFilter from '@/components/BottomDragFilter';
import BottomFooter from '@/components/BottomFooter';
import HelpPopup from '@/components/HelpPopup';
import MaterialToast from '@/components/MaterialToast';
import ProductCard from '@/components/ProductCard';
import ProductDetailModal from '@/components/ProductDetailModal';
import SearchBar from '@/components/SearchBar';
import { useThemeColors } from '@/constants/colors';
import { useTheme } from '@/contexts/ThemeContext';
import { useProducts } from '@/hooks/useProducts';
import useNativeVoiceSearch from '@/hooks/useNativeVoiceSearch';
import useVoiceSearch from '@/hooks/useVoiceSearch';
import { Product } from '@/types/product';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  View
} from 'react-native';

// Updated types to match new BottomDragFilter
type SortField = 'category' | 'name' | 'rating' | 'stock' | 'finalprice' | 'hsn';
type SortDirection = 'asc' | 'desc';
type DateType = 'purchase' | 'sale';
type DatePreset = 'last-month' | 'last-quarter' | 'last-year' | 'all-time';

export default function ProductsScreen() {
  const { isDarkMode } = useTheme();
  const colors = useThemeColors(isDarkMode);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [filterVisible, setFilterVisible] = useState(false);
  const [helpVisible, setHelpVisible] = useState(false);
  const [adminVisible, setAdminVisible] = useState(false);
  
  // New filter states
  const [selectedDateType, setSelectedDateType] = useState<DateType>('purchase');
  const [selectedDatePreset, setSelectedDatePreset] = useState<DatePreset>('all-time');
  
  const { 
    products,
    filteredProducts, 
    selectedCategory,
    searchQuery,
    showOnlyInStock,
    searchMode,
    isLoading,
    toastMessage,
    toastVisible,
    toastPosition,
    toastType,
    currentSort, // Keep this for backward compatibility if needed
    currentSortField,
    currentSortDirection,
    ratingFilter,
    selectedFlags,
    adminConfig,
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
    refreshData,
    showToast,
    hideToast,
    updateAdminConfig
  } = useProducts();
  
  const handleVoiceCommand = (text: string) => {
    const lower = text.toLowerCase();
    showToast(`🗣️ Heard: "${text}"`, 'info', 'top');

    if (lower.includes('refresh')) {
      refreshData();
    } else if (lower.includes('toggle stock')) {
      const newVal = !showOnlyInStock;
      handleStockToggle(newVal);
    } else if (lower.includes('filter by')) {
      const category = lower.split('filter by')[1]?.trim();
      if (category) {
        handleCategoryChange(category);
      }
    } else if (lower.includes('sort by')) {
      const sortValue = lower.split('sort by')[1]?.trim();
      const sortMap: Record<string, { field: SortField; direction: SortDirection }> = {
        'name': { field: 'name', direction: 'asc' },
        'name asc': { field: 'name', direction: 'asc' },
        'name desc': { field: 'name', direction: 'desc' },
        'rating': { field: 'rating', direction: 'desc' },
        'hsn': { field: 'hsn', direction: 'asc' },
        'stock': { field: 'stock', direction: 'desc' },
        'price': { field: 'finalprice', direction: 'asc' },
        'category': { field: 'category', direction: 'asc' },
      };
      const mappedSort = sortMap[sortValue];
      if (mappedSort) {
        handleSortChange(mappedSort.field, mappedSort.direction);
      } else {
        showToast(`❓ Unknown sort command: "${sortValue}"`, 'error', 'center');
      }
    } else {
      // default: treat as search
      setSearchQuery(text);
      showToast(`🔍 Searching for: "${text}"`, 'info', 'center');
    }
  };

  const voiceSearchHook = Platform.select({
    web: useVoiceSearch,
    default: useNativeVoiceSearch,
  });

  const { isListening, error, isSupported, startListening, stopListening } = voiceSearchHook(
    handleVoiceCommand,
    showToast
  );

  const handleProductPress = (product: Product) => {
    setSelectedProduct(product);
    setModalVisible(true);
    
    // Auto-close modal after 5 seconds
    setTimeout(() => {
      setModalVisible(false);
    }, 5000);
  };
  
  const renderItem = ({ item }: { item: Product }) => (
    <ProductCard 
      product={item}
      allProducts={products}
      onPress={() => handleProductPress(item)}
    />
  );
  
  const handleCategoryChange = (category: string | null) => {
    setSelectedCategory(category);
    const count = category 
      ? products.filter(p => p.category === category).length
      : products.length;
    const categoryName = category || 'All';
    showToast(`🗂️ Filtered by ${categoryName}: ${count} items`, 'success', 'center');
  };
  
  const handleStockToggle = (value: boolean) => {
    setShowOnlyInStock(value);
    const message = value 
      ? '🟢 Showing in-stock items only'
      : '🔴 Showing all stock items';
    showToast(message, value ? 'success' : 'error', 'center');
  };
  
  // Updated sort handler
  const handleSortChange = (field: SortField, direction: SortDirection) => {
    setSortField(field, direction);
    showToast(`📊 Sorted by ${field} ${direction === 'asc' ? 'ascending' : 'descending'}`, 'success', 'center');
  };
  
  // Updated date filter handler
  const handleDateFilter = (type: DateType, preset: DatePreset) => {
    setDateFilter(type, preset);
    showToast(`📅 Date filter changed to ${type}: ${preset}`, 'success', 'center');
  };
  
  const handleFlagFilter = (flags: string[]) => {
    setSelectedFlags(flags);
    showToast(`🏷️ ${flags.length} badge filters selected`, 'success', 'center');
  };

  // New reset filters handler
  const handleResetFilters = () => {
    resetAllFilters();
    showToast('🔄 All filters have been reset', 'info', 'center');
  };
  
  const handleAdminSave = (config: any) => {
    updateAdminConfig(config);
    showToast('⚙️ Admin configuration saved successfully', 'success', 'center');
  };
  
  const openFilterSheet = () => {
    setFilterVisible(true);
  };
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]} testID="products-screen">
      <SearchBar 
        value={searchQuery}
        onChangeText={setSearchQuery}
        onClear={() => setSearchQuery('')}
        isListening={isListening}
        onStartVoiceSearch={startListening}
        onStopVoiceSearch={stopListening}
        onRefresh={refreshData}
        searchMode={searchMode}
        onSearchModeChange={setSearchMode}
        showOnlyInStock={showOnlyInStock}
        onToggleStock={handleStockToggle}
        onOpenHelp={() => setHelpVisible(true)}
        onOpenFilter={openFilterSheet}
        companyName={adminConfig?.companyName}
        companyLogo={adminConfig?.companyLogo}
        onTestVoice={startListening}
      />
      
      {isLoading && products.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : filteredProducts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.text }]}>No products found</Text>
          <Text style={[styles.emptySubtext, { color: colors.text }]}>
            Try changing your search or filters
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          testID="products-list"
        />
      )}
      
      {/* Bottom Footer */}
      <BottomFooter
        onPressAdmin={() => setAdminVisible(true)}
        onPressHelp={() => setHelpVisible(true)}
      />
      
      {/* Material Toast */}
      <MaterialToast
        message={toastMessage}
        visible={toastVisible}
        position={toastPosition}
        type={toastType}
        onHide={hideToast}
      />
      
      {/* Product Detail Modal */}
      <ProductDetailModal 
        visible={modalVisible}
        product={selectedProduct}
        onClose={() => setModalVisible(false)}
        allProducts={products}
      />
      
      {/* Bottom Drag Filter - Updated */}
      <BottomDragFilter
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
        onSortChange={handleSortChange}
        onDateFilter={handleDateFilter}
        onFlagFilter={handleFlagFilter}
        onCategoryFilter={handleCategoryChange}
        onResetFilters={handleResetFilters}
        currentSortField={currentSortField}
        currentSortDirection={currentSortDirection}
        selectedCategory={selectedCategory}
        selectedDateType={selectedDateType}
        selectedDatePreset={selectedDatePreset}
      />
      
      {/* Help Popup */}
      <HelpPopup
        visible={helpVisible}
        onClose={() => setHelpVisible(false)}
        onOpenAdmin={() => {
          setHelpVisible(false);
          setAdminVisible(true);
        }}
      />
      
      {/* Admin Config */}
      <AdminConfig
        visible={adminVisible}
        onClose={() => setAdminVisible(false)}
        onSave={handleAdminSave}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingTop: 0,
    paddingHorizontal: 0,
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
  },
  webFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    margin: 10,
    gap: 6,
  },
  webFilterText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});