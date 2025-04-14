import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightTheme, darkTheme, ThemeType } from '../utils/theme';


type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: ThemeType;
  isDarkMode: boolean;
  themeMode: ThemeMode;
  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode) => void;
}

export const ThemeContext = createContext<ThemeContextType>({
  theme: lightTheme,
  isDarkMode: false,
  themeMode: 'light',
  toggleTheme: () => {},
  setThemeMode: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [theme, setTheme] = useState<ThemeType>(lightTheme);
  const [themeMode, setThemeModeState] = useState<ThemeMode>('light');

  const detectSystemTheme = () => {
    const isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    return isDark;
  };

  const applyTheme = (mode: ThemeMode) => {
    let shouldUseDarkMode = false;
    
    switch (mode) {
      case 'light':
        shouldUseDarkMode = false;
        break;
      case 'dark':
        shouldUseDarkMode = true;
        break;
      case 'system':
        shouldUseDarkMode = detectSystemTheme();
        break;
    }
    
    setIsDarkMode(shouldUseDarkMode);
    setTheme(shouldUseDarkMode ? darkTheme : lightTheme);
  };

  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const savedThemeMode = await AsyncStorage.getItem('themeMode');
        if (savedThemeMode && (savedThemeMode === 'light' || savedThemeMode === 'dark' || savedThemeMode === 'system')) {
          setThemeModeState(savedThemeMode as ThemeMode);
          applyTheme(savedThemeMode as ThemeMode);
        } else {
          setThemeModeState('system');
          applyTheme('system');
        }
      } catch (error) {
        console.error('Error loading theme preference:', error);
        setThemeModeState('system');
        applyTheme('system');
      }
    };

    loadThemePreference();

    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      const handleChange = () => {
        if (themeMode === 'system') {
          applyTheme('system');
        }
      };
      
      mediaQuery.addEventListener('change', handleChange);
      
      return () => {
        mediaQuery.removeEventListener('change', handleChange);
      };
    }
  }, [themeMode]);

  const toggleTheme = () => {
    const newMode = isDarkMode ? 'light' : 'dark';
    setThemeMode(newMode);
  };

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    applyTheme(mode);
    
    AsyncStorage.setItem('themeMode', mode);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDarkMode,
        themeMode,
        toggleTheme,
        setThemeMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};