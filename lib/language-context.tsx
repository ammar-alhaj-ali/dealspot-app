import React, { createContext, useContext, useState, useMemo, useCallback, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { translations, type Language } from "@/lib/translations";

const LANG_KEY = "dealspot_language";

interface LanguageContextValue {
  language: Language;
  isRTL: boolean;
  toggleLanguage: () => void;
  t: (key: keyof typeof translations.en, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");

  React.useEffect(() => {
    AsyncStorage.getItem(LANG_KEY).then((val) => {
      if (val === "ar" || val === "en") setLanguage(val);
    });
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguage((prev) => {
      const next = prev === "en" ? "ar" : "en";
      AsyncStorage.setItem(LANG_KEY, next);
      return next;
    });
  }, []);

  const isRTL = language === "ar";

  const t = useCallback(
    (key: keyof typeof translations.en, params?: Record<string, string | number>) => {
      let text = translations[language][key] || translations.en[key] || key;
      if (params) {
        Object.entries(params).forEach(([k, v]) => {
          text = text.replace(`{${k}}`, String(v));
        });
      }
      return text;
    },
    [language]
  );

  const value = useMemo(
    () => ({ language, isRTL, toggleLanguage, t }),
    [language, isRTL, toggleLanguage, t]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
