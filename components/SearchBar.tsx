import CameraPopup from '@/components/CameraPopup';
import HelpPopup from '@/components/HelpPopup';
import { useThemeColors } from '@/constants/colors';
import { useTheme } from '@/contexts/ThemeContext';
import { Feather, Ionicons, MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

type SearchMode = 'item' | 'rate' | 'hsn';

type SearchBarProps = {
  value: string;
  onChangeText: (text: string) => void;
  onClear: () => void;
  isListening: boolean;
  onStartVoiceSearch: () => void;
  onStopVoiceSearch: () => void;
  searchMode: SearchMode;
  onSearchModeChange: (mode: SearchMode) => void;
  showOnlyInStock: boolean;
  onToggleStock: (value: boolean) => void;
  onRefresh: () => void;
  onOpenHelp?: () => void;
  onOpenFilter?: () => void;
  companyName?: string;
  companyLogo?: string;
};

export default function SearchBar({
  value,
  onChangeText,
  onClear,
  isListening,
  onStartVoiceSearch,
  onStopVoiceSearch,
  searchMode,
  onSearchModeChange,
  showOnlyInStock,
  onToggleStock,
  onRefresh,
  onOpenHelp,
  onOpenFilter,
  companyName = 'SH Rate',
  companyLogo
}: SearchBarProps) {
  const { isDarkMode, themeMode, setThemeMode } = useTheme();
  const colors = useThemeColors(isDarkMode);
  const [showCamera, setShowCamera] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const getSearchModeIcon = () => {
    switch (searchMode) {
      case 'item': return <Ionicons name="information-circle" size={20} color="#fff" />;
      case 'rate': return <MaterialIcons name="currency-rupee" size={20} color="#fff" />;
      case 'hsn': return <Feather name="hash" size={20} color="#fff" />;
    }
  };

  const getSearchModePlaceholder = () => {
    switch (searchMode) {
      case 'item': return 'Search products...';
      case 'rate': return 'Search by rate/GST...';
      case 'hsn': return 'Search by HSN code...';
    }
  };

  const toggleSearchMode = () => {
    const modes: SearchMode[] = ['item', 'rate', 'hsn'];
    const currentIndex = modes.indexOf(searchMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    onSearchModeChange(modes[nextIndex]);
  };

  const handleCameraPress = () => {
    setShowCamera(true);
  };
  
  const handleLogoPress = () => {
    onRefresh();
  };

  const toggleTheme = () => {
    const modes: ('light' | 'dark' | 'auto')[] = ['light', 'dark', 'auto'];
    const currentIndex = modes.indexOf(themeMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setThemeMode(modes[nextIndex]);
  };

  const getThemeIcon = () => {
    switch (themeMode) {
      case 'light': return <Ionicons name="sunny" size={20} color="#fff" />;
      case 'dark': return <Ionicons name="moon" size={20} color="#fff" />;
      case 'auto': return isDarkMode ? <Ionicons name="moon" size={20} color="#fff" /> : <Ionicons name="sunny" size={20} color="#fff" />;
    }
  };
  return (
    <>
      {/* Logo and Header */}
      <View style={[styles.header, { backgroundColor: colors.navBar }]}>
        <TouchableOpacity onPress={handleLogoPress} style={styles.logoContainer}>
          {companyLogo ? (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Image source={{ uri: companyLogo }} style={styles.logoImage} />
              <Text style={styles.logoText}> {companyName}</Text>
            </View>
          ) : (
            <Text style={styles.logoText}>🏢 {companyName}</Text>
          )}
        </TouchableOpacity>
        
        <View style={styles.headerActions}>
          {/* Search Mode Toggle */}
          <TouchableOpacity 
            style={[styles.headerButton, { backgroundColor: colors.primary }]} 
            onPress={toggleSearchMode}
            testID="search-mode-button"
          >
            {getSearchModeIcon()}
          </TouchableOpacity>
          
          {/* Stock Toggle */}
          <TouchableOpacity 
            style={[styles.headerButton, { backgroundColor: showOnlyInStock ? colors.success : colors.error }]} 
            onPress={() => onToggleStock(!showOnlyInStock)}
            testID="stock-toggle-button"
          >
            {showOnlyInStock ? <Ionicons name="toggle" size={20} color="#fff" /> : <Ionicons name="toggle-outline" size={20} color="#fff" />}
          </TouchableOpacity>
          
          {/* Theme Toggle */}
          <TouchableOpacity 
            style={[styles.headerButton, { backgroundColor: colors.inactive }]} 
            onPress={toggleTheme}
            testID="theme-toggle-button"
          >
            {getThemeIcon()}
          </TouchableOpacity>
          
          {/* Help Button */}
          <TouchableOpacity 
            style={[styles.headerButton, { backgroundColor: colors.inactive }]} 
            onPress={onOpenHelp || (() => setShowHelp(true))}
            testID="help-button"
          >
            <Ionicons name="help-circle" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={[styles.container, { backgroundColor: colors.background }]} testID="search-bar">
        {/* Camera Button - Left side */}
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: colors.cameraButton }]} 
          onPress={handleCameraPress}
          testID="camera-button-left"
        >
          <Ionicons name="camera" size={20} color="#fff" />
        </TouchableOpacity>
        
        <View style={[styles.searchContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Ionicons name="search" size={20} color={colors.text} style={styles.searchIcon} />
          
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder={getSearchModePlaceholder()}
            placeholderTextColor={colors.inactive}
            value={value}
            onChangeText={onChangeText}
            testID="search-input"
          />
          
          {value ? (
            <TouchableOpacity onPress={onClear} testID="clear-search">
              <Ionicons name="close" size={20} color={colors.text} />
            </TouchableOpacity>
          ) : null}
        </View>
        
        <TouchableOpacity 
          style={[
            styles.actionButton,
            { backgroundColor: colors.micButton },
            isListening && { backgroundColor: colors.error }
          ]} 
          onPress={isListening ? onStopVoiceSearch : onStartVoiceSearch}
          testID="voice-search-button"
        >
          {isListening ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Ionicons name="mic" size={20} color="#fff" />
          )}
        </TouchableOpacity>
        
        {/* Sort Button */}
        {onOpenFilter && (
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: colors.secondary }]} 
            onPress={onOpenFilter}
            testID="sort-button"
          >
            <Ionicons name="funnel-outline" size={20} color="#fff" />
          </TouchableOpacity>
        )}
      </View>

      {/* Camera Popup */}
      <CameraPopup 
        visible={showCamera}
        onClose={() => setShowCamera(false)}
      />
      
      {/* Help Popup */}
      <HelpPopup 
        visible={showHelp}
        onClose={() => setShowHelp(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 50, // Account for status bar
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 8,
  },
  logoText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
    borderWidth: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    height: '100%',
  },
  actionButton: {
    width: 48,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 50,
  },
  cameraCloseButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 10,
  },
  cameraFlipButton: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginTop: 50,
  },
  cameraCaptureButton: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 35,
    paddingHorizontal: 30,
    paddingVertical: 15,
    marginBottom: 50,
  },
  cameraButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  centerBox: {
    width: '60%',
    height: '60%',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
    borderRadius: 10,
    backgroundColor: 'transparent',
  },
});