import { useContext } from 'react';
import { ThemeContext } from './ThemeContextBase';

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within AppThemeProvider');
  }
  return context;
};
