import React from 'react';
import { 
  Modal, 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  ScrollView,
  Linking
} from 'react-native';
import { Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';
import { useThemeColors } from '@/constants/colors';
import { useTheme } from '@/contexts/ThemeContext';

type HelpPopupProps = {
  visible: boolean;
  onClose: () => void;
  onOpenAdmin?: () => void;
};

export default function HelpPopup({ visible, onClose, onOpenAdmin }: HelpPopupProps) {
  const { isDarkMode } = useTheme();
  const colors = useThemeColors(isDarkMode);
  
  const openGitHub = () => {
    Linking.openURL('https://github.com/wassayknp');
  };
  
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>How to Use SH Rate</Text>
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={onClose}
              testID="close-help-button"
            >
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Search Instructions */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.primary }]}>Search Modes</Text>
              
              <View style={styles.instructionItem}>
                <View style={[styles.iconContainer, { backgroundColor: colors.primary }]}>
                  <Ionicons name="information-circle" size={16} color="#fff" />
                </View>
                <View style={styles.instructionText}>
                  <Text style={[styles.instructionTitle, { color: colors.text }]}>Item Search</Text>
                  <Text style={[styles.instructionDesc, { color: colors.text }]}>
                    Search products by name using fuzzy matching
                  </Text>
                </View>
              </View>
              
              <View style={styles.instructionItem}>
                <View style={[styles.iconContainer, { backgroundColor: colors.primary }]}>
                  <MaterialIcons name="currency-rupee" size={16} color="#fff" />
                </View>
                <View style={styles.instructionText}>
                  <Text style={[styles.instructionTitle, { color: colors.text }]}>Rate Search</Text>
                  <Text style={[styles.instructionDesc, { color: colors.text }]}>
                    Search by price or GST percentage (±5% tolerance)
                  </Text>
                </View>
              </View>
              
              <View style={styles.instructionItem}>
                <View style={[styles.iconContainer, { backgroundColor: colors.primary }]}>
                  <Feather name="hash" size={16} color="#fff" />
                </View>
                <View style={styles.instructionText}>
                  <Text style={[styles.instructionTitle, { color: colors.text }]}>HSN Search</Text>
                  <Text style={[styles.instructionDesc, { color: colors.text }]}>
                    Search products by HSN code
                  </Text>
                </View>
              </View>
            </View>
            
            {/* Voice & Camera Instructions */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.primary }]}>Voice & Camera</Text>
              
              <View style={styles.instructionItem}>
                <View style={[styles.iconContainer, { backgroundColor: colors.success }]}>
                  <Ionicons name="mic" size={16} color="#fff" />
                </View>
                <View style={styles.instructionText}>
                  <Text style={[styles.instructionTitle, { color: colors.text }]}>Voice Search</Text>
                  <Text style={[styles.instructionDesc, { color: colors.text }]}>
                    Tap mic button and speak product name. Supports English & Hindi.
                  </Text>
                </View>
              </View>
              
              <View style={styles.instructionItem}>
                <View style={[styles.iconContainer, { backgroundColor: colors.primary }]}>
                  <Ionicons name="camera" size={16} color="#fff" />
                </View>
                <View style={styles.instructionText}>
                  <Text style={[styles.instructionTitle, { color: colors.text }]}>Camera Scan</Text>
                  <Text style={[styles.instructionDesc, { color: colors.text }]}>
                    Scan product labels with OCR. Auto-closes after 10 seconds or when products found.
                  </Text>
                </View>
              </View>
            </View>
            
            {/* Features */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.primary }]}>Features</Text>
              
              <View style={styles.featureList}>
                <Text style={[styles.featureItem, { color: colors.text }]}>
                  • Auto-refresh every 5 minutes
                </Text>
                <Text style={[styles.featureItem, { color: colors.text }]}>
                  • Smart product badges (New, Hot Seller, etc.)
                </Text>
                <Text style={[styles.featureItem, { color: colors.text }]}>
                  • Rating system based on consumption
                </Text>
                <Text style={[styles.featureItem, { color: colors.text }]}>
                  • Stock filtering (In-stock only / All items)
                </Text>
                <Text style={[styles.featureItem, { color: colors.text }]}>
                  • Category-wise filtering
                </Text>
                <Text style={[styles.featureItem, { color: colors.text }]}>
                  • Tap product cards for detailed view
                </Text>
                <Text style={[styles.featureItem, { color: colors.text }]}>
                  • Dark/Light/Auto theme modes
                </Text>
              </View>
            </View>
            
            {/* Tips */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.primary }]}>Tips</Text>
              
              <View style={styles.featureList}>
                <Text style={[styles.featureItem, { color: colors.text }]}>
                  • Tap app logo to refresh data manually
                </Text>
                <Text style={[styles.featureItem, { color: colors.text }]}>
                  • Product details auto-close after 5 seconds
                </Text>
                <Text style={[styles.featureItem, { color: colors.text }]}>
                  • Voice search works best in quiet environments
                </Text>
                <Text style={[styles.featureItem, { color: colors.text }]}>
                  • Camera works better with good lighting
                </Text>
              </View>
            </View>
            
            {/* Admin Section */}
            {onOpenAdmin && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.primary }]}>Admin</Text>
                <TouchableOpacity
                  style={[styles.adminButton, { backgroundColor: colors.primary }]}
                  onPress={onOpenAdmin}
                >
                  <Text style={styles.adminButtonText}>Open Admin Configuration</Text>
                </TouchableOpacity>
              </View>
            )}
            
            {/* Footer */}
            <View style={styles.footer}>
              <Text style={[styles.footerText, { color: colors.text }]}>
                Developed with <Ionicons name="heart" size={12} color="#FF6B6B" /> in 🇮🇳 by{' '}
                <Text 
                  style={[styles.link, { color: colors.primary }]} 
                  onPress={openGitHub}
                >
                  wassayknp
                </Text>
              </Text>
              <Text style={[styles.copyright, { color: colors.text }]}>
                © 2025 AI Rate List
              </Text>
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  instructionText: {
    flex: 1,
  },
  instructionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  instructionDesc: {
    fontSize: 14,
    opacity: 0.8,
    lineHeight: 20,
  },
  featureList: {
    gap: 8,
  },
  featureItem: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.9,
  },
  footer: {
    alignItems: 'center',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  footerText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  link: {
    textDecorationLine: 'underline',
  },
  copyright: {
    fontSize: 12,
    opacity: 0.6,
  },
  adminButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  adminButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});