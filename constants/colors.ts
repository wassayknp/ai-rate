export const lightColors = {
  primary: '#3498db',
  secondary: '#2ecc71',
  background: '#f9f9f9',
  card: '#ffffff',
  text: '#333333',
  border: '#e0e0e0',
  error: '#e74c3c',
  warning: '#f39c12',
  success: '#27ae60',
  inactive: '#95a5a6',

  boxShadow: 'rgba(0, 0, 0, 0.1)',
  // Additional colors for the app
  stockName: '#2c3e50',
  pinkRate: '#e91e63',
  greenPositive: '#27ae60',
  orangePer: '#ff9800',
  purpleHsn: '#9c27b0',
  bluePrice: '#2196f3',
  navBar: '#34495e',
  cameraButton: '#ff6b35',
  micButton: '#4caf50',
};

export const darkColors = {
  primary: '#3498db',
  secondary: '#2ecc71',
  background: '#121212',
  card: '#1e1e1e',
  text: '#ffffff',
  border: '#404040',
  error: '#e74c3c',
  warning: '#f39c12',
  success: '#27ae60',
  inactive: '#95a5a6',
  shadow: 'rgba(0, 0, 0, 0.3)',
  // Additional colors for the app
  stockName: '#ecf0f1',
  pinkRate: '#e91e63',
  greenPositive: '#27ae60',
  orangePer: '#ff9800',
  purpleHsn: '#9c27b0',
  bluePrice: '#2196f3',
  navBar: '#1a1a1a',
  cameraButton: '#ff6b35',
  micButton: '#4caf50',
};

export const useThemeColors = (isDarkMode?: boolean) => {
  if (isDarkMode !== undefined) {
    return isDarkMode ? darkColors : lightColors;
  }
  // Fallback to light colors if no theme context
  return lightColors;
};

const colors = useThemeColors();

export default colors;