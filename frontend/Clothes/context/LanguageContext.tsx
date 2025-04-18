import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import locales from '../assets/locales';

type LanguageCode = 'en' | 'fr';

// Définir la structure des traductions
interface TranslationsType {
  [key: string]: any;
  onboarding: {
    slide1: { title: string; description: string };
    slide2: { title: string; description: string };
    slide3: { title: string; description: string };
    getStarted: string;
    next: string;
    skip: string;
  };
  auth: {
    [key: string]: string;
  };
  common: {
    [key: string]: string;
  };
  home: {
    [key: string]: string;
  };
  settings: {
    [key: string]: string;
  };
}

// Assurez-vous que les locales sont du bon type
const typedLocales: Record<LanguageCode, TranslationsType> = locales as Record<LanguageCode, TranslationsType>;

interface LanguageContextType {
  language: LanguageCode;
  translations: TranslationsType;
  setLanguage: (language: LanguageCode) => void;
  t: (key: string, section?: string) => string;
}

const defaultLanguage: LanguageCode = 'en';

export const LanguageContext = createContext<LanguageContextType>({
  language: defaultLanguage,
  translations: typedLocales[defaultLanguage],
  setLanguage: () => {},
  t: (key: string, section?: string) => key,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageCode>(defaultLanguage);
  const [translations, setTranslations] = useState<TranslationsType>(typedLocales[defaultLanguage]);

  useEffect(() => {
    // Load language preference from AsyncStorage
    const loadLanguagePreference = async () => {
      try {
        const languagePreference = await AsyncStorage.getItem('language');
        if (languagePreference && (languagePreference === 'en' || languagePreference === 'fr')) {
          setLanguageState(languagePreference as LanguageCode);
          setTranslations(typedLocales[languagePreference as LanguageCode]);
        }
      } catch (error) {
        console.error('Error loading language preference:', error);
      }
    };

    loadLanguagePreference();
  }, []);

  const setLanguage = (languageCode: LanguageCode) => {
    setLanguageState(languageCode);
    setTranslations(typedLocales[languageCode]);
    
    // Save language preference to AsyncStorage
    AsyncStorage.setItem('language', languageCode);
  };

  // Translation function
  const t = (key: string, section?: string): string => {
    try {
      if (section) {
        // Vérifier que la section existe
        const sectionData = translations[section];
        if (!sectionData) return key;
        
        // Naviguer dans les clés imbriquées si nécessaire
        const keys = key.split('.');
        let value: any = sectionData;
        
        for (const k of keys) {
          if (!value || typeof value[k] === 'undefined') return key;
          value = value[k];
        }
        
        return typeof value === 'string' ? value : key;
      } else {
        // Sans section, on navigue directement à partir de la racine
        const keys = key.split('.');
        let value: any = translations;
        
        for (const k of keys) {
          if (!value || typeof value[k] === 'undefined') return key;
          value = value[k];
        }
        
        return typeof value === 'string' ? value : key;
      }
    } catch (error) {
      console.error('Translation error:', error);
      return key;
    }
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        translations,
        setLanguage,
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};