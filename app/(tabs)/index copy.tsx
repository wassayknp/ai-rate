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
import { useVoiceSearch } from '@/hooks/useVoiceSearch_n';
import { Product } from '@/types/product';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View
} from 'react-native';

type SortOption = 'category' | 'name-asc' | 'name-desc' | 'rating' | 'hsn' | 'stock';

export default function ProductsScreen() {
  const { isDarkMode } = useTheme();
  const colors = useThemeColors(isDarkMode);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [filterVisible, setFilterVisible] = useState(false);
  const [helpVisible, setHelpVisible] = useState(false);
  const [adminVisible, setAdminVisible] = useState(false);
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
    currentSort,
    ratingFilter,
    selectedFlags,
    adminConfig,
    setSelectedCategory,
    setSearchQuery,
    setShowOnlyInStock,
    setSearchMode,
    setCurrentSort,
    setRatingFilter,
    setSelectedFlags,
    refreshData,
    showToast,
    hideToast,
    updateAdminConfig
  } = useProducts();

  const handleVoiceCommand = (text: string) => {
  const lower = text.toLowerCase();

  if (lower.includes('refresh')) {
    refreshData();
    showToast('🔄 Data refreshed via voice');
  } else if (lower.includes('toggle stock')) {
    const newVal = !showOnlyInStock;
    handleStockToggle(newVal);
    showToast(`🎛️ Stock filter toggled: ${newVal ? 'In stock' : 'All'}`);
  } else if (lower.includes('filter by')) {
    const category = lower.split('filter by')[1]?.trim();
    if (category) {
      handleCategoryChange(category);
      showToast(`🗂️ Filter applied: ${category}`);
    }
  } else if (lower.includes('sort by')) {
    const sortValue = lower.split('sort by')[1]?.trim();
    const sortMap: Record<string, SortOption> = {
      'name asc': 'name-asc',
      'name desc': 'name-desc',
      'rating': 'rating',
      'hsn': 'hsn',
      'stock': 'stock',
      'category': 'category',
    };
    const mappedSort = sortMap[sortValue];
    if (mappedSort) {
      handleSortChange(mappedSort);
      showToast(`📊 Sorted by ${mappedSort}`);
    } else {
      showToast(`❓ Unknown sort type: ${sortValue}`);
    }
  } else {
    // default: treat as search
    setSearchQuery(text);
    showToast(`🔍 Searching: ${text}`);
  }
};

const { isListening, startListening, stopListening } = useVoiceSearch({
  onResult: handleVoiceCommand,
  showToast: showToast,
});




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
    showToast(`📊 ${categoryName}: ${count} items`, 'center');
  };

  const handleStockToggle = (value: boolean) => {
    setShowOnlyInStock(value);
    const message = value
      ? '🟢 Showing in-stock items only'
      : '🔴 Showing all stock items';
    showToast(message, 'center');
  };

  const handleSortChange = (sort: SortOption) => {
    setCurrentSort(sort);
    showToast(`📊 Sorted by ${sort.replace('-', ' ')}`, 'center');
  };

  const handleRatingFilter = (min: number, max: number) => {
    setRatingFilter(min, max);
    showToast(`⭐ Rating filter: ${min.toFixed(1)} - ${max.toFixed(1)}`, 'center');
  };

  const handleDateFilter = (type: 'purchase' | 'sale', preset: string) => {
    showToast(`📅 ${type} date filter: ${preset}`, 'center');
  };

  const handleFlagFilter = (flags: string[]) => {
    setSelectedFlags(flags);
    showToast(`🏷️ Badge filters: ${flags.length} selected`, 'center');
  };

  const handleAdminSave = (config: any) => {
    updateAdminConfig(config);
    showToast('⚙️ Admin configuration saved', 'center');
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
      />



      {isLoading ? (
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
      <BottomFooter />

      {/* Material Toast */}
      <MaterialToast
        message={toastMessage}
        visible={toastVisible}
        position={toastPosition}
        onHide={hideToast}
      />

      {/* Product Detail Modal */}
      <ProductDetailModal
        visible={modalVisible}
        product={selectedProduct}
        onClose={() => setModalVisible(false)}
        allProducts={products}
      />

      {/* Bottom Drag Filter */}
      <BottomDragFilter
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
        onSortChange={handleSortChange}
        onRatingFilter={handleRatingFilter}
        onDateFilter={handleDateFilter}
        onFlagFilter={handleFlagFilter}
        onCategoryFilter={handleCategoryChange}
        currentSort={currentSort}
        selectedCategory={selectedCategory}
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
    paddingTop: 0, // Cards aligned from top
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