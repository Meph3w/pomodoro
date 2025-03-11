"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

type Language = "pt" | "en" | "es"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
}

const LanguageContext = createContext<LanguageContextType>({
  language: "pt",
  setLanguage: () => {},
})

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("pt")

  useEffect(() => {
    // Try to get language from localStorage
    const savedLanguage = localStorage.getItem("pomodoro-language") as Language | null
    if (savedLanguage && ["pt", "en", "es"].includes(savedLanguage)) {
      setLanguage(savedLanguage as Language)
    }

    // Listen for language change events
    const handleLanguageChange = (e: CustomEvent) => {
      const newLang = e.detail as Language
      if (["pt", "en", "es"].includes(newLang)) {
        setLanguage(newLang)
        localStorage.setItem("pomodoro-language", newLang)
      }
    }

    window.addEventListener("changeLanguage", handleLanguageChange as EventListener)

    return () => {
      window.removeEventListener("changeLanguage", handleLanguageChange as EventListener)
    }
  }, [])

  return <LanguageContext.Provider value={{ language, setLanguage }}>{children}</LanguageContext.Provider>
}

export const useLanguage = () => useContext(LanguageContext)

