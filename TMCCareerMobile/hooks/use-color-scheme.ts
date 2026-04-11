import { useThemeContext } from '@/context/ThemeContext';

export function useColorScheme() {
  const context = useThemeContext().colorScheme;
  return context;
}
