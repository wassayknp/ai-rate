import ProductCard from '@/components/ProductCard';
import ProductDetailModal from '@/components/ProductDetailModal';
import { useThemeColors } from '@/constants/colors';
import { useTheme } from '@/contexts/ThemeContext';
import useOCR from '@/hooks/useOCR';
import { useProducts } from '@/hooks/useProducts';
import { Product } from '@/types/product';
import { Ionicons } from '@expo/vector-icons';
import { CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

type CameraPopupProps = {
  visible: boolean;
  onClose: () => void;
};

export default function CameraPopup({ visible, onClose }: CameraPopupProps) {
  const { isDarkMode } = useTheme();
  const colors = useThemeColors(isDarkMode);
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [matchedProducts, setMatchedProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
const [autoCloseTimer, setAutoCloseTimer] = useState<number | null>(null);
  
  const cameraRef = useRef<any>(null);
  const { products, showToast } = useProducts();
  
  const { isProcessing, processImage } = useOCR(products, (foundProducts) => {
    setMatchedProducts(foundProducts);
    if (foundProducts.length > 0) {
      showToast(`📷 Found ${foundProducts.length} matching product${foundProducts.length > 1 ? 's' : ''}`,'success', 'center');
      // Auto-close camera after finding products
      setTimeout(() => {
        onClose();
      }, 3000);
    } else {
      showToast('📷 No matching products found', 'error', 'center');
    }
  });
  // Auto-close timer effect
  useEffect(() => {
    if (visible && !capturedImage) {
      // Auto-close after 10 seconds if no capture
      const timer = setTimeout(() => {
        showToast('📷 Camera closed automatically', 'info', 'center');
        onClose();
      }, 10000);
      setAutoCloseTimer(10000);
      
      return () => {
        if (timer) clearTimeout(timer);
      };
    }
  }, [visible, capturedImage, onClose, showToast]);
  
  // Clear timer when component unmounts or modal closes
  useEffect(() => {
    if (!visible && autoCloseTimer) {
      clearTimeout(autoCloseTimer);
      setAutoCloseTimer(null);
    }
  }, [visible, autoCloseTimer]);
  
  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
    
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };
  
  const takePicture = async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    // Clear auto-close timer when user captures
    if (autoCloseTimer) {
      clearTimeout(autoCloseTimer);
      setAutoCloseTimer(null);
    }
    
    try {
      if (cameraRef.current && Platform.OS !== 'web') {
        // Real camera capture for mobile
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: false,
        });
        
        if (photo && photo.uri) {
          setCapturedImage(photo.uri);
          showToast('📷 Processing image...', 'info','center');
          await processImage(photo.uri);
        }
      } else {
        // For web or fallback, use mock processing
        showToast('📷 Processing image...', 'info', 'center');
        setCapturedImage('mock-image');
        await processImage('mock-image');
      }
    } catch (error) {
      console.error('Error taking picture:', error);
      showToast('📷 Failed to capture image', 'error', 'center');
    }
  };
  
  const resetCamera = () => {
    setCapturedImage(null);
    setMatchedProducts([]);
    
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };
  
  const handleClose = () => {
    if (autoCloseTimer) {
      clearTimeout(autoCloseTimer);
      setAutoCloseTimer(null);
    }
    resetCamera();
    onClose();
  };
  
  const handleProductPress = (product: Product) => {
    setSelectedProduct(product);
    setModalVisible(true);
    
    // Auto-close modal after 5 seconds
    setTimeout(() => {
      setModalVisible(false);
    }, 5000);
  };
  
  if (!visible) return null;
  
  const renderPermissionView = () => (
    <View style={styles.permissionContainer}>
      <Text style={[styles.permissionTitle, { color: colors.text }]}>Camera access needed</Text>
      <Text style={[styles.permissionText, { color: colors.text }]}>
        We need camera permission to scan product labels
      </Text>
      <TouchableOpacity 
        style={[styles.permissionButton, { backgroundColor: colors.primary }]} 
        onPress={requestPermission}
      >
        <Text style={styles.permissionButtonText}>Grant Permission</Text>
      </TouchableOpacity>
    </View>
  );
  
  const renderLoadingView = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
  
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.cameraContainer, { backgroundColor: colors.background }]}>
          {/* Header with close button */}
          <View style={styles.header}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Scan Product</Text>
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={handleClose}
              testID="close-camera-button"
            >
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          {!permission ? renderLoadingView() : 
           !permission.granted ? renderPermissionView() :
           Platform.OS === 'web' ? (
            <View style={styles.webPlaceholder}>
              <Text style={[styles.webPlaceholderTitle, { color: colors.text }]}>Camera Not Available</Text>
              <Text style={[styles.webPlaceholderText, { color: colors.text }]}>
                The camera scanning feature is only available on mobile devices.
              </Text>
            </View>
          ) : capturedImage ? (
            <View style={styles.resultContainer}>
              <View style={styles.resultHeader}>
                <Text style={[styles.resultTitle, { color: colors.text }]}>
                  {matchedProducts.length > 0 
                    ? `Found ${matchedProducts.length} product${matchedProducts.length > 1 ? 's' : ''}` 
                    : 'No products found'}
                </Text>
                <TouchableOpacity 
                  style={styles.resetButton} 
                  onPress={resetCamera}
                  testID="reset-camera-button"
                >
                  <Ionicons name="refresh" size={20} color={colors.text} />
                </TouchableOpacity>
              </View>
              
              {isProcessing ? (
                <View style={styles.processingContainer}>
                  <ActivityIndicator size="large" color={colors.primary} />
                  <Text style={[styles.processingText, { color: colors.text }]}>Processing image...</Text>
                </View>
              ) : matchedProducts.length > 0 ? (
                <ScrollView 
                  style={styles.matchedProductsContainer}
                  contentContainerStyle={styles.matchedProductsContent}
                >
                  {matchedProducts.map(product => (
                    <ProductCard 
                      key={product.id} 
                      product={product} 
                      onPress={() => handleProductPress(product)}
                    />
                  ))}
                </ScrollView>
              ) : (
                <View style={styles.noResultsContainer}>
                  <Text style={[styles.noResultsText, { color: colors.text }]}>
                    No products matched the scanned image.
                  </Text>
                  <Text style={[styles.noResultsSubtext, { color: colors.text }]}>
                    Try scanning a different product or use voice search.
                  </Text>
                </View>
              )}
            </View>
          ) : (
            <>
              <View style={styles.cameraViewContainer}>
                <CameraView 
                  style={styles.camera} 
                  facing={facing}
                  ref={cameraRef}
                >
                  <View style={styles.overlay}>
                    <View style={styles.scanFrame} />
                    <Text style={styles.scanText}>
                      Position product label in frame
                    </Text>
                  </View>
                </CameraView>
              </View>
              
              <View style={styles.controls}>
                <TouchableOpacity 
                  style={[styles.controlButton, { backgroundColor: colors.card }]} 
                  onPress={toggleCameraFacing}
                  testID="flip-camera-button"
                >
                  <Ionicons name="camera-reverse" size={24} color={colors.text} />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.captureButton, { backgroundColor: colors.primary }]} 
                  onPress={takePicture}
                  testID="capture-button"
                >
                  <Ionicons name="checkmark" size={32} color="#fff" />
                </TouchableOpacity>
                
                <View style={styles.controlButton} />
              </View>
            </>
          )}
        </View>
      </View>
      
      <ProductDetailModal 
        visible={modalVisible}
        product={selectedProduct}
        onClose={() => setModalVisible(false)}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraContainer: {
    width: screenWidth,
    height: screenWidth, // Square container
    borderRadius: 20,
    overflow: 'hidden',
    marginHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  closeButton: {
    padding: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  permissionText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.7,
  },
  permissionButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cameraViewContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: screenWidth * 0.7,
    height: screenWidth * 0.4,
    borderWidth: 2,
    borderColor: '#fff',
    borderRadius: 8,
  },
  scanText: {
    color: '#fff',
    fontSize: 14,
    marginTop: 16,
    textAlign: 'center',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultContainer: {
    flex: 1,
    padding: 16,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  resetButton: {
    padding: 4,
  },
  processingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingText: {
    marginTop: 16,
    fontSize: 16,
  },
  matchedProductsContainer: {
    flex: 1,
  },
  matchedProductsContent: {
    paddingBottom: 20,
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noResultsText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  noResultsSubtext: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
  },
  webPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  webPlaceholderTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  webPlaceholderText: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
  },
});