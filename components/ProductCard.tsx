import RatingIcon from '@/components/RatingIcon';
import categories from '@/constants/categories';
import { useThemeColors } from '@/constants/colors';
import { useTheme } from '@/contexts/ThemeContext';
import { Product } from '@/types/product';
import { FontAwesome5, Ionicons, MaterialIcons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';
import { hexToRgba } from '@/utils/utility';


type ProductCardProps = {
  product: Product;
  allProducts?: Product[];
  onPress?: () => void;
};

export default function ProductCard({ product, allProducts = [], onPress }: ProductCardProps) {
  const { isDarkMode } = useTheme();
  const colors = useThemeColors(isDarkMode);
  const category = categories.find(c => c.name === product.category);
  const isOutOfStock = product.quantityInStock <= 0;
  const isLowStock = product.quantityInStock < 10 && product.quantityInStock > 0;
  const categoryColorHex = category?.color || colors.primary; // fallback to primary color
const categoryColorRGBA = hexToRgba(categoryColorHex, 0.15);
  // Calculate badges based on API flags
  const badges = useMemo(() => {
    const badgeList: { type: string; icon: string; iconSet: string; color: string }[] = [];
    
    // Add badges based on API flags in priority order
    if (product.isHighestConsumption) badgeList.push({ type: 'highest-consumption', icon: 'local-fire-department', iconSet: 'MaterialIcons', color: '#FF5722' });
    if (product.isHighestStock) badgeList.push({ type: 'highest-stock', icon: 'warehouse', iconSet: 'FontAwesome5', color: '#4CAF50' });
    if (product.isFrequentlySold) badgeList.push({ type: 'frequently-sold', icon: 'local-fire-department', iconSet: 'MaterialIcons', color: '#FF9800' });
    if (product.isNewArrival) badgeList.push({ type: 'new-arrival', icon: 'sparkles', iconSet: 'Ionicons', color: '#00BCD4' });
    if (product.isLowDemand && !product.isOutOfStock) badgeList.push({ type: 'low-demand', icon: 'trending-down', iconSet: 'Ionicons', color: '#9E9E9E' });
    if (product.isOldStock) badgeList.push({ type: 'old-stock', icon: 'time', iconSet: 'Ionicons', color: '#8D6E63' });
    if (product.isOutOfStock) badgeList.push({ type: 'out-of-stock', icon: 'close-circle', iconSet: 'Ionicons', color: '#F44336' });
    
    return badgeList;
  }, [product]);
  
  // Auto-close modal after 5 seconds
  const handlePress = () => {
    if (onPress) {
      onPress();
      // Auto-close after 5 seconds
      setTimeout(() => {
        // This will be handled by the parent component
      }, 5000);
    }
  };
  
  return (
    <TouchableOpacity 
      style={[
        styles.card,
        { 
          backgroundColor: categoryColorRGBA,
          shadowColor: colors.boxShadow
        },
        isOutOfStock && { 
          ...styles.outOfStockCard,
          borderLeftColor: colors.error
        }
      ]}
      testID={`product-card-${product.id}`}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      {/* Category Icon */}
      <View 
        style={[
          styles.categoryIcon
        ]}
      >
    <Image source={category?.logo} style={{ width: 28, height: 28, marginLeft: 6, alignContent: 'center', resizeMode: 'contain' }} />
      </View>
      
      
      {/* Main Content Area */}
      <View style={styles.contentArea}>
        {/* First Row: Product Name and Final Rate */}
        <View style={styles.firstRow}>
          <Text style={[styles.productName, { color: colors.stockName }]} numberOfLines={2}>
            {product.name}
          </Text>
          
                {/* Badges */}
      <View style={styles.badgeContainer}>
        {badges.slice(0, ).map((badge, index) => {
          const renderIcon = () => {
            switch (badge.iconSet) {
              case 'MaterialIcons':
                return <MaterialIcons name={badge.icon as any} size={10} color="#fff" />;
              case 'FontAwesome5':
                return <FontAwesome5 name={badge.icon as any} size={10} color="#fff" />;
              case 'Ionicons':
              default:
                return <Ionicons name={badge.icon as any} size={10} color="#fff" />;
            }
          };
          
          return (
            <View 
              key={badge.type}
              style={[
                styles.badge,
                { backgroundColor: badge.color },
                index > 0 && { marginTop: 0 }
              ]}
            >
              {renderIcon()}
            </View>
          );
        })}
      </View>
          <Text style={[styles.finalRate, { color: colors.pinkRate }]}>
            {product.baseRate.toFixed(2)}
          </Text>
        </View>
        
        {/* Second Row: Stock, HSN, GST% */}
        <View style={styles.secondRow}>
          <Text 
            style={[
              styles.stockText,
              isOutOfStock ? { color: colors.error, fontWeight: '700' } : 
                (isLowStock ? { color: colors.warning, fontWeight: '600' } : { color: colors.greenPositive })
            ]}
          >
            {product.quantityInStock} {product.unitOfMeasurement}
          </Text>
          <View style={styles.ratingContainer}>
              <RatingIcon rating={product.rating} size={14} />
              <Text style={[styles.ratingText, { color: colors.text }]}>
                {product.rating.toFixed(1)}
              </Text>
            </View>
          <Text style={[styles.hsnText, { color: colors.orangePer }]}>
            {product.hsnCode}
          </Text>
          <Text style={[styles.gstText, { color: colors.purpleHsn }]}>
            {product.gstPercentage}%
          </Text>
        </View>
      </View>
      
      {/* Base Rate (Right Side) */}
      <Text style={[styles.baseRate, { color: colors.bluePrice }]}>
        {(Math.ceil(product.finalRate * 2) / 2).toFixed(1)}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 15,
    marginHorizontal: 8, // Very thin margins
    marginBottom: 3,
    paddingVertical: 5,
    paddingHorizontal: 5,
    flexDirection: 'row',
    alignItems: 'flex-start',
    minHeight: 35, // Slightly increased for rating
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  outOfStockCard: {
    opacity: 0.8,
    borderLeftWidth: 3,
  },
  categoryIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderTopLeftRadius:16,
    borderTopRightRadius: 16,

    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 2,
    marginTop: 5,
    marginBottom: 5,
  },
  iconText: {
    fontSize: 16,
  },
  contentArea: {
    flex: 1,
    marginLeft: 4,
    marginTop: 2,
    marginRight: 85, // Reduced margin for base rate
  },
  firstRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    minHeight: 18,
    marginTop: 1,
  },
  productName: {
    fontSize: 18,
    fontWeight: '500',
    flex: 6,
    marginLeft: 2,
    flexWrap: 'wrap',
    lineHeight: 20,
  },
  finalRate: {
    fontSize: 20,
    fontWeight: '500',
    textAlign: 'right',
    flex: 3,
  },
  secondRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    height: 14,
  },
  stockText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 3,
    marginLeft: 2,
  },
  hsnText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 3,
    textAlign: 'right',
  },
  gstText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
  baseRate: {
    fontSize: 26,
    fontWeight: '600',
    textAlign: 'right',
    width: 105, // Reduced width
    position: 'absolute',
    right: 5,
    top: 10,
  },
  badgeContainer: {
    position: 'sticky',
    alignItems: 'center',
    flexDirection: 'row', // ✅ horizontal layout
    flexWrap: 'wrap',     // ✅ allow wrapping to next line if too many
    gap: 4,               // ✅ small spacing between badges (RN 0.71+)
  },
  badge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
  marginBottom: 4, // gives space between rows when wrapping
  },
  ratingRow: {
    marginTop: 2,
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
});