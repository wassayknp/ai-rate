declare module '@react-native-vector-icons/fontawesome' {
  export interface IconName {
    fire: string;
    warehouse: string;
    sparkles: string;
    trendingDown: string;
    clockO: string;
    timesCircle: string;
    info: string;
    rupee: string;
    hash: string;

  }

  export const FontAwesome: React.ComponentType<React.ComponentProps<typeof FontAwesome> & { name: keyof IconName }>;
}