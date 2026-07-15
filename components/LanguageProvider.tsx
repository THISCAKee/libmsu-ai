"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type Language = "th" | "en";

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
};

const STORAGE_KEY = "lib-ai-language";
const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("th");

  useEffect(() => {
    try {
      const savedLanguage = localStorage.getItem(STORAGE_KEY);
      if (savedLanguage === "th" || savedLanguage === "en") {
        setLanguageState(savedLanguage);
      }
    } catch {
      // ใช้ภาษาไทยเป็นค่าเริ่มต้นเมื่อ browser storage ไม่พร้อมใช้งาน
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      setLanguage: (nextLanguage) => {
        setLanguageState(nextLanguage);
        try {
          localStorage.setItem(STORAGE_KEY, nextLanguage);
        } catch {
          // การเปลี่ยนภาษายังคงทำงานแม้บันทึกค่าไม่ได้
        }
      },
    }),
    [language],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }

  return context;
}
