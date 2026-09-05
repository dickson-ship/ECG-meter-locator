import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

const ThemeContext = createContext();

const THEME_KEY = '@theme_preference';

export function ThemeProvider({ children }) {
  const systemColorScheme = useRNColorScheme();
  const [themePreference, setThemePreference] = useState('system');

  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const saved = await AsyncStorage.getItem(THEME_KEY);
      if (saved !== null) {
        setThemePreference(saved);
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
    }
  };

  const saveThemePreference = async (preference) => {
    try {
      await AsyncStorage.setItem(THEME_KEY, preference);
      setThemePreference(preference);
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  const getColorScheme = () => {
    if (themePreference === 'system') {
      return systemColorScheme || 'light';
    }
    return themePreference;
  };

  return (
    <ThemeContext.Provider
      value={{
        themePreference,
        setThemePreference: saveThemePreference,
        colorScheme: getColorScheme(),
        isDark: getColorScheme() === 'dark',
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
