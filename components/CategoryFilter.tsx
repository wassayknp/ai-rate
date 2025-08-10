import React from 'react';
import { 
  ScrollView, 
  TouchableOpacity, 
  Text, 
  StyleSheet 
} from 'react-native';
import categories from '@/constants/categories';
import { useThemeColors } from '@/constants/colors';
import { useTheme } from '@/contexts/ThemeContext';

type CategoryFilterProps = {
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
};

export default function CategoryFilter({ 
  selectedCategory, 
  onSelectCategory 
}: CategoryFilterProps) {
  const { isDarkMode } = useTheme();
  const colors = useThemeColors(isDarkMode);
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
      testID="category-filter"
    >
      <TouchableOpacity
        style={[
          styles.categoryChip,
          { 
            backgroundColor: !selectedCategory ? colors.primary : colors.card,
            borderColor: colors.primary
          }
        ]}
        onPress={() => onSelectCategory(null)}
        testID="category-all"
      >
        <Text 
          style={[
            styles.categoryText, 
            { color: !selectedCategory ? '#fff' : colors.text }
          ]}
        >
          All
        </Text>
      </TouchableOpacity>
      
      {categories.map(category => (
        <TouchableOpacity
          key={category.id}
          style={[
            styles.categoryChip,
            { 
              backgroundColor: selectedCategory === category.name 
                ? category.color 
                : colors.card,
              borderColor: category.color
            }
          ]}
          onPress={() => onSelectCategory(category.name)}
          testID={`category-${category.name.toLowerCase()}`}
        >
          <Text 
            style={[
              styles.categoryText, 
              { 
                color: selectedCategory === category.name 
                  ? '#fff' 
                  : category.color 
              }
            ]}
          >
            {category.icon} {category.name}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 4,
    paddingVertical: 2, // Reduced padding
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 2, // Minimal vertical padding
    borderRadius: 20,
    borderWidth: 1,
    marginHorizontal: 2,
    height: 32, // Fixed height for text only
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryText: {
    fontWeight: '500',
    fontSize: 16, // Match Android size
    textAlign: 'center',
    lineHeight: 18,
  }
});