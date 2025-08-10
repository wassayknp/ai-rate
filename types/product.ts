import { ImageSourcePropType } from 'react-native';

// API Product structure
export type APIProduct = {
  i: string;
  n: string; // name
  c: string; // category
  u: string; // unit of measurement
  q: number; // quantity in stock
  h: string; // HSN code
  p: number; // GST percentage
  b: number; // base rate
  g: number; // GST rate (final rate)
  iq: number; // inward quantity
  oq: number; // outward quantity
  pd: string; // purchase date
  sd: string; // sale date
  r: number; // rating (0.0 to 5.0)
  f: {
  hc: number; // isHighestConsumption flag (0/1)
  hr: number; // isHighestRated flag (0/1)
  hs: number; // isHighestStock flag (0/1)
  fs: number; // isFrequentlySold flag (0/1)
  na: number; // isNewArrival flag (0/1)
  ld: number; // isLowDemand flag (0/1)
  os: number; // isOutOfStock flag (0/1)
  osk: number; // isOldStock flag (0/1)
  }
};

// Internal Product structure (transformed from API)
export type Product = {
  id: string;
  name: string;
  category: string;
  quantityInStock: number;
  hsnCode: string;
  gstPercentage: number;
  baseRate: number;
  finalRate: number;
  rating: number; // 0.0 to 5.0 (from API)
  unitOfMeasurement: string;
  inwardQuantity: number;
  outwardQuantity: number;
  purchaseDate: string;
  saleDate: string;
  // Badge flags from API
  isHighestConsumption: boolean;
  isHighestRated: boolean;
  isHighestStock: boolean;
  isFrequentlySold: boolean;
  isNewArrival: boolean;
  isLowDemand: boolean;
  isOutOfStock: boolean;
  isOldStock: boolean;
};

export type Category = {
  id: string;
  name: string;
  color: string;
  icon: string;
  logo: ImageSourcePropType;
};