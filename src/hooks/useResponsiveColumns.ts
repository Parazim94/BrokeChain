import { useWindowDimensions } from 'react-native';

export function useResponsiveColumns(): number {
  const { width } = useWindowDimensions();
  
  // Breakpoints for different device sizes
  if (width >= 1024) {
    return 3; // Desktop: 3 columns
  } else if (width >= 768) {
    return 2; // Tablet: 2 columns
  } else {
    return 1; // Mobile: 1 column
  }
}
