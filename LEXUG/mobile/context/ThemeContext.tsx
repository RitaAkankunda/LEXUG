import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppColors, darkColors, lightColors } from '../theme';

type ThemeMode = 'light' | 'dark';

type ThemeContextValue = {
  colors: AppColors;
  isDark: boolean;
  mode: ThemeMode;
  toggleTheme: () => Promise<void>;
};

const THEME_STORAGE_KEY = 'lexugThemeMode';

const ThemeContext = createContext<ThemeContextValue>({
  colors: lightColors,
  isDark: false,
  mode: 'light',
  toggleTheme: async () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>('light');

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const storedMode = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (storedMode === 'light' || storedMode === 'dark') {
          setMode(storedMode);
        }
      } catch (error) {
        console.warn('Failed to load theme preference:', error);
      }
    };

    void loadTheme();
  }, []);

  const value = useMemo<ThemeContextValue>(() => {
    const nextColors = mode === 'dark' ? darkColors : lightColors;

    return {
      colors: nextColors,
      isDark: mode === 'dark',
      mode,
      toggleTheme: async () => {
        const nextMode: ThemeMode = mode === 'dark' ? 'light' : 'dark';
        setMode(nextMode);
        try {
          await AsyncStorage.setItem(THEME_STORAGE_KEY, nextMode);
        } catch (error) {
          console.warn('Failed to save theme preference:', error);
        }
      },
    };
  }, [mode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
