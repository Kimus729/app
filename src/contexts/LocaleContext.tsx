
"use client";

import type { Dispatch, ReactNode, SetStateAction } from 'react';
import { createContext, useContext, useState, useMemo } from 'react';
import { DEFAULT_LOCALE, type Locale, translations } from '@/config/locales';

interface LocaleContextType {
  locale: Locale;
  setLocale: Dispatch<SetStateAction<Locale>>;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export const LocaleProvider = ({ children }: { children: ReactNode }) => {
  const [locale, setLocale] = useState<Locale>(DEFAULT_LOCALE);

  const t = useMemo(() => (key: string, params?: Record<string, string | number>): string => {
    let translation = translations[key]?.[locale] || translations[key]?.[DEFAULT_LOCALE] || key;
    if (params) {
      Object.keys(params).forEach(paramKey => {
        translation = translation.replace(`{${paramKey}}`, String(params[paramKey]));
      });
    }
    return translation;
  }, [locale]);

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LocaleContext.Provider>
  );
};

export const useLocale = (): LocaleContextType => {
  const context = useContext(LocaleContext);
  if (context === undefined) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
};
