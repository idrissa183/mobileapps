// frontend/Clothes/context/ThemeContext.tsx
import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightTheme, darkTheme, ThemeType } from '../utils/theme';

interface ThemeContextType {
  theme: ThemeType;
  isDarkMode: boolean;
  toggleTheme: () => void;
  setDarkMode: (isDark: boolean) => void;
}

export const ThemeContext = createContext<ThemeContextType>({
  theme: lightTheme,
  isDarkMode: false,
  toggleTheme: () => {},
  setDarkMode: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [theme, setTheme] = useState<ThemeType>(lightTheme);

  useEffect(() => {
    // Load theme preference from AsyncStorage
    const loadThemePreference = async () => {
      try {
        const themePreference = await AsyncStorage.getItem('isDarkMode');
        if (themePreference !== null) {
          const isDark = themePreference === 'true';
          setIsDarkMode(isDark);
          setTheme(isDark ? darkTheme : lightTheme);
        }
      } catch (error) {
        console.error('Error loading theme preference:', error);
      }
    };

    loadThemePreference();
  }, []);

  const toggleTheme = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    setTheme(newDarkMode ? darkTheme : lightTheme);
    
    // Save theme preference to AsyncStorage
    AsyncStorage.setItem('isDarkMode', newDarkMode.toString());
  };

  const setDarkMode = (isDark: boolean) => {
    setIsDarkMode(isDark);
    setTheme(isDark ? darkTheme : lightTheme);
    
    // Save theme preference to AsyncStorage
    AsyncStorage.setItem('isDarkMode', isDark.toString());
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDarkMode,
        toggleTheme,
        setDarkMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};