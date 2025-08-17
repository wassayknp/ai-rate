import categories from '@/constants/categories';
import { useThemeColors } from '@/constants/colors';
import { useTheme } from '@/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Dimensions,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const BOTTOM_SHEET_MAX_HEIGHT = SCREEN_HEIGHT * 0.7;

type SortField = 'category' | 'name' | 'rating' | 'stock' | 'finalprice' | 'hsn';
type SortDirection = 'asc' | 'desc';
type DateType = 'purchase' | 'sale';
type DatePreset = 'last-month' | 'last-quarter' | 'last-year' | 'all-time';

type BottomDragFilterProps = {
  visible: boolean;
  onClose: () => void;
  onSortChange: (field: SortField, direction: SortDirection) => void;
  onDateFilter: (type: DateType, preset: DatePreset) => void;
  onFlagFilter: (flags: string[]) => void;
  onCategoryFilter?: (category: string | null) => void;
  onResetFilters: () => void;
  onOpenCalendar: () => void;
  currentSortField?: SortField | null;
  currentSortDirection?: SortDirection;
  selectedCategory?: string | null;
  selectedDateType?: DateType;
  selectedDatePreset?: DatePreset;
};

export default function BottomDragFilter({
  visible,
  onClose,
  onSortChange,
  onDateFilter,
  onFlagFilter,
  onCategoryFilter,
  onResetFilters,
  onOpenCalendar,
  currentSortField,
  currentSortDirection = 'asc',
  selectedCategory,
  selectedDateType = 'purchase',
  selectedDatePreset = 'all-time'
}: BottomDragFilterProps) {
  const { isDarkMode } = useTheme();
  const colors = useThemeColors(isDarkMode);
  
  const [selectedFlags, setSelectedFlags] = useState<string[]>([]);
  const [dateType, setDateType] = useState<DateType>(selectedDateType);
  const [datePreset, setDatePreset] = useState<DatePreset>(selectedDatePreset);
  
  // Update local state when props change
  React.useEffect(() => {
    setDateType(selectedDateType);
  }, [selectedDateType]);
  
  React.useEffect(() => {
    setDatePreset(selectedDatePreset);
  }, [selectedDatePreset]);
  
  const sortOptions: { key: SortField; label: string; icon: string }[] = [
    { key: 'category', label: 'Category', icon: 'grid-outline' },
    { key: 'name', label: 'Name', icon: 'text-outline' },
    { key: 'rating', label: 'Rating', icon: 'star-outline' },
    { key: 'stock', label: 'Stock', icon: 'cube-outline' },
    { key: 'finalprice', label: 'Price', icon: 'pricetag-outline' },
    { key: 'hsn', label: 'HSN Code', icon: 'barcode-outline' },
  ];
  
  const flagOptions = [
    { key: 'isHighestConsumption', label: 'Hot Seller', icon: 'flame-outline' },
    { key: 'isHighestStock', label: 'High Stock', icon: 'cube-outline' },
    { key: 'isNewArrival', label: 'New', icon: 'sparkles-outline' },
    { key: 'isLowDemand', label: 'Low Demand', icon: 'trending-down-outline' },
    { key: 'isOldStock', label: 'Old Stock', icon: 'time-outline' },
    { key: 'isOutOfStock', label: 'Out of Stock', icon: 'close-circle-outline' },
  ];
  
  const datePresets: { key: DatePreset; label: string }[] = [
    { key: 'last-month', label: 'Last Month' },
    { key: 'last-quarter', label: 'Last Quarter' },
    { key: 'last-year', label: 'Last Year' },
    { key: 'all-time', label: 'All Time' },
  ];
  
  const handleSortToggle = (field: SortField) => {
    let newDirection: SortDirection = 'asc';
    
    if (currentSortField === field) {
      // Toggle direction if same field
      newDirection = currentSortDirection === 'asc' ? 'desc' : 'asc';
    }
    
    onSortChange(field, newDirection);
  };
  
  const toggleFlag = (flag: string) => {
    const newFlags = selectedFlags.includes(flag)
      ? selectedFlags.filter(f => f !== flag)
      : [...selectedFlags, flag];
    setSelectedFlags(newFlags);
    onFlagFilter(newFlags);
  };
  
  const handleDateTypeChange = (type: DateType) => {
    setDateType(type);
    onDateFilter(type, datePreset);
  };
  
  const handleDatePresetChange = (preset: DatePreset) => {
    setDatePreset(preset);
    onDateFilter(dateType, preset);
  };
  
  const handleResetFilters = () => {
    setSelectedFlags([]);
    setDateType('purchase');
    setDatePreset('all-time');
    onResetFilters();
  };
  
  if (!visible) return null;
  
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity 
          style={styles.backdrop} 
          activeOpacity={1} 
          onPress={onClose}
        />
        
        <View 
          style={[
            styles.bottomSheet,
            { backgroundColor: colors.card }
          ]}
        >
          {/* Handle */}
          <View style={styles.handle}>
            <View style={[styles.handleBar, { backgroundColor: colors.text }]} />
          </View>
            
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Reset Filters Button */}
            <View style={styles.resetSection}>
              <TouchableOpacity
                style={[
                  styles.resetButton,
                  { backgroundColor: colors.primary }
                ]}
                onPress={handleResetFilters}
              >
                <Ionicons name="refresh-outline" size={18} color="#fff" />
                <Text style={styles.resetButtonText}>Reset Filters</Text>
              </TouchableOpacity>
            </View>

            {/* Category Filter */}
            {onCategoryFilter && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Category</Text>
                <View style={styles.categoryGrid}>
                  <TouchableOpacity
                    style={[
                      styles.categoryOption,
                      { 
                        backgroundColor: !selectedCategory ? colors.primary : colors.background,
                        borderColor: colors.border 
                      }
                    ]}
                    onPress={() => onCategoryFilter(null)}
                  >
                    <Ionicons 
                      name="apps-outline" 
                      size={16} 
                      color={!selectedCategory ? '#fff' : colors.text} 
                    />
                    <Text style={[
                      styles.categoryOptionText,
                      { color: !selectedCategory ? '#fff' : colors.text }
                    ]}>
                      All
                    </Text>
                  </TouchableOpacity>
                  
                  {categories.map((category) => (
                    <TouchableOpacity
                      key={category.id}
                      style={[
                        styles.categoryOption,
                        { 
                          backgroundColor: selectedCategory === category.name ? colors.primary : colors.background,
                          borderColor: colors.border
                        }
                      ]}
                      onPress={() => onCategoryFilter(category.name)}
                    >
                      <Image 
                        source={category.logo} 
                        style={{ width: 20, height: 20, marginRight: 6, resizeMode: 'contain' }}
                      />
                      <Text
                        style={[
                          styles.categoryOptionText,
                          { color: selectedCategory === category.name ? '#fff' : colors.text }
                        ]}
                      >
                        {category.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
            
            {/* Sort Options */}
            <View style={styles.section}>
              <View style={styles.sortHeaderContainer}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Sort By</Text>
                <View style={styles.sortDirectionIndicators}>
                  <View style={styles.sortDirectionItem}>
                    <Text style={[styles.sortDirectionLabel, { color: colors.text }]}>ASC</Text>
                    <Ionicons name="chevron-up" size={16} color={colors.text} />
                  </View>
                  <View style={styles.sortDirectionItem}>
                    <Text style={[styles.sortDirectionLabel, { color: colors.text }]}>DESC</Text>
                    <Ionicons name="chevron-down" size={16} color={colors.text} />
                  </View>
                </View>
              </View>
              <View style={styles.sortGrid}>
                {sortOptions.map((option) => {
                  const isSelected = currentSortField === option.key;
                  const directionIconName = isSelected 
                    ? (currentSortDirection === 'asc' ? 'chevron-up' : 'chevron-down')
                    : 'chevron-up';
                  
                  return (
                    <TouchableOpacity
                      key={option.key}
                      style={[
                        styles.sortOption,
                        { 
                          backgroundColor: isSelected ? colors.primary : colors.background,
                          borderColor: colors.border 
                        }
                      ]}
                      onPress={() => handleSortToggle(option.key)}
                    >
                      <Ionicons 
                        name={option.icon as any} 
                        size={18} 
                        color={isSelected ? '#fff' : colors.text} 
                      />
                      <Text style={[
                        styles.sortOptionText,
                        { color: isSelected ? '#fff' : colors.text }
                      ]}>
                        {option.label}
                      </Text>
                      <Ionicons 
                        name={directionIconName} 
                        size={14} 
                        color={isSelected ? '#fff' : colors.text} 
                      />
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
            
            {/* Flag Filters */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Product Badges</Text>
              <View style={styles.flagGrid}>
                {flagOptions.map((flag) => (
                  <TouchableOpacity
                    key={flag.key}
                    style={[
                      styles.flagOption,
                      { 
                        backgroundColor: selectedFlags.includes(flag.key) ? colors.primary : colors.background,
                        borderColor: colors.border
                      }
                    ]}
                    onPress={() => toggleFlag(flag.key)}
                  >
                    <Ionicons 
                      name={flag.icon as any} 
                      size={16} 
                      color={selectedFlags.includes(flag.key) ? '#fff' : colors.text} 
                    />
                    <Text style={[
                      styles.flagOptionText,
                      { color: selectedFlags.includes(flag.key) ? '#fff' : colors.text }
                    ]}>
                      {flag.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            {/* Date Range */}
            <View style={styles.section}>
              <View style={styles.dateHeader}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Date Range</Text>
                <TouchableOpacity style={styles.calendarButton} onPress={onOpenCalendar}>
                  <Ionicons name="calendar-outline" size={20} color={colors.primary} />
                </TouchableOpacity>
              </View>
              
              {/* Date Type Toggle */}
              <View style={styles.dateTypeContainer}>
                <TouchableOpacity
                  style={[
                    styles.dateTypeButton,
                    { 
                      backgroundColor: dateType === 'purchase' ? colors.primary : colors.background,
                      borderColor: colors.border
                    }
                  ]}
                  onPress={() => handleDateTypeChange('purchase')}
                >
                  <Text style={[
                    styles.dateTypeText,
                    { color: dateType === 'purchase' ? '#fff' : colors.text }
                  ]}>
                    Purchase Date
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.dateTypeButton,
                    { 
                      backgroundColor: dateType === 'sale' ? colors.primary : colors.background,
                      borderColor: colors.border
                    }
                  ]}
                  onPress={() => handleDateTypeChange('sale')}
                >
                  <Text style={[
                    styles.dateTypeText,
                    { color: dateType === 'sale' ? '#fff' : colors.text }
                  ]}>
                    Sale Date
                  </Text>
                </TouchableOpacity>
              </View>
              
              {/* Date Presets */}
              <View style={styles.datePresets}>
                {datePresets.map((preset) => (
                  <TouchableOpacity
                    key={preset.key}
                    style={[
                      styles.datePreset,
                      { 
                        backgroundColor: datePreset === preset.key ? colors.primary : colors.background,
                        borderColor: colors.border 
                      }
                    ]}
                    onPress={() => handleDatePresetChange(preset.key)}
                  >
                    <Text style={[
                      styles.datePresetText,
                      { color: datePreset === preset.key ? '#fff' : colors.text }
                    ]}>
                      {preset.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* TODO: Implement a proper date range slider, e.g., using @miblanchard/react-native-slider */}
              <View style={styles.sliderPlaceholder}>
                <Text style={{ color: colors.text }}>Date Range Slider Placeholder</Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  bottomSheet: {
    height: BOTTOM_SHEET_MAX_HEIGHT,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  handle: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    opacity: 0.3,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  resetSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    gap: 8,
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  dateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  calendarButton: {
    padding: 8,
  },
  sliderPlaceholder: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    marginTop: 16,
  },
  sortGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  sortOptionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  sortHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sortDirectionIndicators: {
    flexDirection: 'row',
    gap: 12,
  },
  sortDirectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sortDirectionLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  flagGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  flagOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    gap: 4,
  },
  flagOptionText: {
    fontSize: 12,
    fontWeight: '500',
  },
  dateTypeContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  dateTypeButton: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
  },
  dateTypeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  datePresets: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  datePreset: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  datePresetText: {
    fontSize: 12,
    fontWeight: '500',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    gap: 4,
  },
  categoryOptionText: {
    fontSize: 12,
    fontWeight: '500',
  },
});