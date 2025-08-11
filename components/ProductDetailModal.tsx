import React from 'react';
import { 
  Modal, 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  ScrollView
} from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { Product } from '@/types/product';
import colors, { useThemeColors } from '@/constants/colors';
import { useTheme } from '@/contexts/ThemeContext';
import categories from '@/constants/categories';

import { hexToRgba } from '@/utils/utility';

type ProductDetailModalProps = {
  visible: boolean;
  product: Product | null;
  onClose: () => void;
  allProducts?: Product[];
};

export default function ProductDetailModal({ 
  visible, 
  product, 
  onClose,
  allProducts = []
}: ProductDetailModalProps) {
  const { isDarkMode } = useTheme();
  const colors = useThemeColors(isDarkMode);
  
  if (!product) return null;
  
  const category = categories.find(c => c.name === product.category);
    const categoryColorHex = category?.color || colors.primary; // fallback to primary color
  const categoryColorRGBA = hexToRgba(categoryColorHex, 0.95);
  const isOutOfStock = product.quantityInStock <= 0;
  const isLowStock = product.quantityInStock < 10 && product.quantityInStock > 0;
  
  // Use API flags directly
  const isHighestRated = product.isHighestRated;
  const isHighestStock = product.isHighestStock;
  const isNewArrival = product.isNewArrival;
  const isFrequentlySold = product.isFrequentlySold;
  const isLowDemand = product.isLowDemand;
  const isHighestConsumption = product.isHighestConsumption;
  
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
          <View style={styles.header}>
            <View 
              style={[
                styles.categoryIndicator, 
                { backgroundColor: category?.color || colors.primary }
              ]}
            >
              <Text style={styles.categoryIcon}>{category?.icon || '📦'}</Text>
            </View>
            
            <View style={styles.productNameContainer}>
              <Text style={[styles.productName, { color: colors.text }]}>{product.name}</Text>
              {product.rating > 0 && (
                <View style={styles.ratingContainer}>
                  {isHighestRated ? (
                    <FontAwesome5 name="crown" size={16} color="#FFD700" />
                  ) : (
                    <Ionicons name="star" size={16} color="#FFD700" />
                  )}
                  <Text style={[styles.ratingText, { color: colors.text }]}>
                    {product.rating.toFixed(1)}
                  </Text>
                </View>
              )}
            </View>
            
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={onClose}
              testID="close-modal-button"
            >
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.detailsScroll}>
            {/* Badges Section */}
            <View style={[styles.section, { borderBottomColor: colors.border }]}>
              <Text style={[styles.sectionTitle, { color: colors.primary }]}>Status Badges</Text>
              <View style={styles.badgesContainer}>
                {isHighestRated && (
                  <View style={[styles.badge, { backgroundColor: '#FFD700' }]}>
                    <FontAwesome5 name="crown" size={14} color="#fff" />
                    <Text style={styles.badgeText}>Top Rated</Text>
                  </View>
                )}
                {isHighestConsumption && (
                  <View style={[styles.badge, { backgroundColor: '#FF5722' }]}>
                    <MaterialIcons name="local-fire-department" size={14} color="#fff" />
                    <Text style={styles.badgeText}>Highest Consumption</Text>
                  </View>
                )}
                {isHighestStock && (
                  <View style={[styles.badge, { backgroundColor: '#4CAF50' }]}>
                    <FontAwesome5 name="warehouse" size={14} color="#fff" />
                    <Text style={styles.badgeText}>Highest Stock</Text>
                  </View>
                )}
                {isFrequentlySold && (
                  <View style={[styles.badge, { backgroundColor: '#FF9800' }]}>
                    <MaterialIcons name="local-fire-department" size={14} color="#fff" />
                    <Text style={styles.badgeText}>Frequently Sold</Text>
                  </View>
                )}
                {isNewArrival && (
                  <View style={[styles.badge, { backgroundColor: '#00BCD4' }]}>
                    <Ionicons name="sparkles" size={14} color="#fff" />
                    <Text style={styles.badgeText}>New Arrival</Text>
                  </View>
                )}
                {isLowDemand && !isOutOfStock && (
                  <View style={[styles.badge, { backgroundColor: '#9E9E9E' }]}>
                    <Ionicons name="trending-down" size={14} color="#fff" />
                    <Text style={styles.badgeText}>Low Demand</Text>
                  </View>
                )}
                {product.isOldStock && (
                  <View style={[styles.badge, { backgroundColor: '#8D6E63' }]}>
                    <Ionicons name="time" size={14} color="#fff" />
                    <Text style={styles.badgeText}>Old Stock</Text>
                  </View>
                )}
                {isOutOfStock && (
                  <View style={[styles.badge, { backgroundColor: '#F44336' }]}>
                    <Ionicons name="close-circle" size={14} color="#fff" />
                    <Text style={styles.badgeText}>Out of Stock</Text>
                  </View>
                )}
              </View>
            </View>
            
            <View style={[styles.section, { borderBottomColor: colors.border }]}>
              <Text style={[styles.sectionTitle, { color: colors.primary }]}>Product Details</Text>
              
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.text }]}>Category:</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>{product.category}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.text }]}>HSN Code:</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>{product.hsnCode}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.text }]}>GST Rate:</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>{product.gstPercentage}%</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.text }]}>Unit of Measure:</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>{product.unitOfMeasurement}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.text }]}>Purchase Date:</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  {new Date(product.purchaseDate).toLocaleDateString()}
                </Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.text }]}>Last Sale Date:</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  {new Date(product.saleDate).toLocaleDateString()}
                </Text>
              </View>
            </View>
            
            <View style={[styles.section, { borderBottomColor: colors.border }]}>
              <Text style={[styles.sectionTitle, { color: colors.primary }]}>Inventory</Text>
              
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.text }]}>Quantity in Stock:</Text>
                <Text 
                  style={[
                    styles.detailValue, 
                    { color: colors.text },
                    isOutOfStock ? { color: colors.error, fontWeight: '700' } : 
                      (isLowStock ? { color: colors.warning, fontWeight: '600' } : null)
                  ]}
                >
                  {product.quantityInStock} {product.unitOfMeasurement} {isOutOfStock && '⚠️'}
                </Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.text }]}>Inward Quantity:</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  {product.inwardQuantity} {product.unitOfMeasurement}
                </Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.text }]}>Outward Quantity:</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  {product.outwardQuantity} {product.unitOfMeasurement}
                </Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.text }]}>Status:</Text>
                <Text 
                  style={[
                    styles.detailValue,
                    isOutOfStock ? { color: colors.error, fontWeight: '700' } : 
                      (isLowStock ? { color: colors.warning, fontWeight: '600' } : { color: colors.success, fontWeight: '600' })
                  ]}
                >
                  {isOutOfStock ? 'Out of Stock' : (isLowStock ? 'Low Stock' : 'In Stock')}
                </Text>
              </View>
              
              {isOutOfStock && (
                <View style={[styles.warningBox, { backgroundColor: colors.error + '20' }]}>
                  <Text style={[styles.warningText, { color: colors.error }]}>
                    This product is out of stock or has negative inventory.
                  </Text>
                </View>
              )}
            </View>
            
            <View style={[styles.section, { borderBottomColor: colors.border }]}>
              <Text style={[styles.sectionTitle, { color: colors.primary }]}>Pricing</Text>
              
              <View style={styles.ratesContainer}>
                <View style={styles.rateItem}>
                  <Text style={[styles.rateLabel, { color: colors.text }]}>Base Rate</Text>
                  <Text style={[styles.baseRate, { color: colors.bluePrice }]}>₹{product.baseRate.toFixed(2)}</Text>
                </View>
                
                <View style={styles.rateItem}>
                  <Text style={[styles.rateLabel, { color: colors.text }]}>GST Amount</Text>
                  <Text style={[styles.taxRate, { color: colors.purpleHsn }]}>
                    ₹{(product.finalRate - product.baseRate).toFixed(2)}
                  </Text>
                </View>
                
                <View style={styles.rateItem}>
                  <Text style={[styles.rateLabel, { color: colors.text }]}>Final Rate</Text>
                  <Text style={[styles.finalRate, { color: colors.pinkRate }]}>₹{product.finalRate.toFixed(2)}</Text>
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  categoryIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryIcon: {
    fontSize: 20,
  },
  productNameContainer: {
    flex: 1,
    marginRight: 8,
  },
  productName: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  closeButton: {
    padding: 4,
  },
  detailsScroll: {
    maxHeight: '100%',
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '500',
    marginLeft: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 15,
    opacity: 0.7,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  warningBox: {
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  warningText: {
    fontSize: 14,
  },
  ratesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rateItem: {
    alignItems: 'center',
    flex: 1,
  },
  rateLabel: {
    fontSize: 13,
    opacity: 0.7,
    marginBottom: 4,
  },
  baseRate: {
    fontSize: 16,
    fontWeight: '600',
  },
  taxRate: {
    fontSize: 16,
    fontWeight: '600',
  },
  finalRate: {
    fontSize: 18,
    fontWeight: '700',
  },
});