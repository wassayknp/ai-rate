import { useThemeColors } from '@/constants/colors';
import { useTheme } from '@/contexts/ThemeContext';
import { Product } from '@/types/product';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Dimensions,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

type AdminConfigData = {
  serverUrl: string;
  companyName: string;
  companyLogo: string;
  categoryIcons: { [key: string]: string };
};

type AdminConfigProps = {
  visible: boolean;
  onClose: () => void;
  onSave: (config: AdminConfigData) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  products: Product[];
};

export default function AdminConfig({ visible, onClose, onSave, showToast, products }: AdminConfigProps) {
  const { isDarkMode } = useTheme();
  const colors = useThemeColors(isDarkMode);
  
  const [config, setConfig] = useState<AdminConfigData>({
    serverUrl: '192.168.5.25:12345',
    companyName: 'Supreme Handloom',
    companyLogo: '',  
    categoryIcons: {}
  });

  const dynamicCategories = useMemo(() => {
    const categories = new Set(products.map(p => p.category));
    return Array.from(categories);
  }, [products]);
  
  // Load saved config on mount
  useEffect(() => {
    loadConfig();
  }, []);
  
  const loadConfig = async () => {
    try {
      const savedConfig = await AsyncStorage.getItem('adminConfig');
      if (savedConfig) {
        const parsedConfig = JSON.parse(savedConfig);
        setConfig(parsedConfig);
      }
    } catch (error) {
      console.error('Failed to load admin config:', error);
    }
  };

  const [newCategory, setNewCategory] = useState('');
  const [newIcon, setNewIcon] = useState('');

  const handleSave = async () => {
    if (!config.serverUrl.trim()) {
      showToast('❌ Server URL is required', 'error');
      return;
    }
    
    if (!config.companyName.trim()) {
      showToast('❌ Company name is required', 'error');
      return;
    }

    try {
      await AsyncStorage.setItem('adminConfig', JSON.stringify(config));
      
      const testUrl = config.serverUrl.startsWith('http') ? config.serverUrl : `http://${config.serverUrl}`;
      
      const response = await fetch(`${testUrl}/list`, {
        method: 'GET',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(3000)
      });
      
      if (response.ok) {
        showToast('✅ Configuration saved and API connection verified!', 'success');
        onSave(config);
        onClose();
      } else {
        showToast('⚠️ Configuration saved, but API connection failed. Please check the server URL.', 'error');
        onSave(config); // Save anyway, but show error
        onClose();
      }
    } catch (error) {
      showToast('⚠️ Configuration saved, but could not connect to API. Please verify the server URL.', 'error');
      onSave(config); // Save anyway, but show error
      onClose();
    }
  };

  const pickImage = async () => {
    if (Platform.OS === 'web') {
      Alert.alert('Info', 'Image upload not supported on web');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setConfig(prev => ({
        ...prev,
        companyLogo: result.assets[0].uri
      }));
    }
  };

  const addCategory = () => {
    if (newCategory.trim() && newIcon.trim()) {
      setConfig(prev => ({
        ...prev,
        categoryIcons: {
          ...prev.categoryIcons,
          [newCategory.trim()]: newIcon.trim()
        }
      }));
      setNewCategory('');
      setNewIcon('');
    }
  };

  const removeCategory = (category: string) => {
    setConfig(prev => {
      const newIcons = { ...prev.categoryIcons };
      delete newIcons[category];
      return {
        ...prev,
        categoryIcons: newIcons
      };
    });
  };

  const commonIcons = ['📦', '🧺', '👘', '🧣', '🏖️', '🧥', '🎭', '🏷️', '📋', '🔧', '⚙️', '📊'];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
        <View style={[styles.bottomSheet, { backgroundColor: colors.card }]}>
          <View style={styles.handle}>
            <View style={[styles.handleBar, { backgroundColor: colors.text }]} />
          </View>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>Admin Configuration</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Server Configuration */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.primary }]}>Server Settings</Text>
              <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: colors.text }]}>Server URL</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                  value={config.serverUrl}
                  onChangeText={(text) => setConfig(prev => ({ ...prev, serverUrl: text }))}
                  placeholder="192.168.5.25:12345"
                  placeholderTextColor={colors.text + '80'}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <Text style={[styles.hint, { color: colors.text }]}>
                  Format: servername or ip:port (API endpoints: /list)
                </Text>
              </View>
            </View>

            {/* Company Branding */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.primary }]}>Company Branding</Text>
              
              <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: colors.text }]}>Company Name</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                  value={config.companyName}
                  onChangeText={(text) => setConfig(prev => ({ ...prev, companyName: text }))}
                  placeholder="Supreme Handloom"
                  placeholderTextColor={colors.text + '80'}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: colors.text }]}>Company Logo</Text>
                <TouchableOpacity
                  style={[styles.logoButton, { backgroundColor: colors.background, borderColor: colors.border }]}
                  onPress={pickImage}
                >
                  {config.companyLogo ? (
                    <Text style={[styles.logoText, { color: colors.text }]}>Logo Selected ✓</Text>
                  ) : (
                    <>
                      <Ionicons name="cloud-upload-outline" size={24} color={colors.text} />
                      <Text style={[styles.logoText, { color: colors.text }]}>Upload Logo</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Category Icons */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.primary }]}>Category Icons</Text>
              
              {/* Dynamic Categories */}
              <View style={styles.categoryList}>
                {dynamicCategories.map((category) => (
                  <View key={category} style={[styles.categoryItem, { backgroundColor: colors.background }]}>
                    <TextInput
                      style={styles.iconInput}
                      value={config.categoryIcons[category] || ''}
                      onChangeText={(text) => {
                        const newIcons = { ...config.categoryIcons, [category]: text };
                        setConfig(prev => ({ ...prev, categoryIcons: newIcons }));
                      }}
                      placeholder="?"
                      maxLength={2}
                    />
                    <Text style={[styles.categoryName, { color: colors.text }]}>{category}</Text>
                  </View>
                ))}
              </View>
            </View>
          </ScrollView>

          {/* Save Button */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: colors.primary }]}
              onPress={handleSave}
            >
              <Text style={styles.saveButtonText}>Save Configuration</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const BOTTOM_SHEET_MAX_HEIGHT = SCREEN_HEIGHT * 0.8;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  bottomSheet: {
    height: BOTTOM_SHEET_MAX_HEIGHT,
    width: '100%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
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
    flex: 1,
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
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  hint: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 4,
  },
  logoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 16,
    gap: 8,
  },
  logoText: {
    fontSize: 16,
    fontWeight: '500',
  },
  categoryList: {
    gap: 8,
    marginBottom: 16,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 12,
  },
  categoryIcon: {
    fontSize: 20,
  },
  categoryName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  removeButton: {
    padding: 4,
  },
  addCategoryContainer: {
    gap: 12,
  },
  addCategoryRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  categoryInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
  },
  iconInput: {
    width: 60,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    textAlign: 'center',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  iconOption: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconOptionText: {
    fontSize: 18,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  saveButton: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});