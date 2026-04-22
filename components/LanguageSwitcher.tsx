"use client";

import { useState, useEffect } from "react";
import { Globe } from "lucide-react";
import { locales, localeLabels, type Locale } from "@/i18n/config";

export default function LanguageSwitcher() {
  const [currentLocale, setCurrentLocale] = useState<Locale>("es");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Get locale from cookie or localStorage
    const cookieLocale = document.cookie
      .split("; ")
      .find((row) => row.startsWith("locale="))
      ?.split("=")[1] as Locale | undefined;

    const storedLocale = localStorage.getItem("locale") as Locale | undefined;
    const htmlLang = document.documentElement.lang as Locale;

    const detectedLocale =
      cookieLocale || storedLocale || htmlLang || "es";

    if (locales.includes(detectedLocale)) {
      setCurrentLocale(detectedLocale);
    }
  }, []);

  const handleLocaleChange = (locale: Locale) => {
    if (locale === currentLocale) {
      setIsOpen(false);
      return;
    }

    // Set cookie (expires in 1 year)
    document.cookie = `locale=${locale}; path=/; max-age=${60 * 60 * 24 * 365}`;
    localStorage.setItem("locale", locale);

    // Reload page to apply new locale
    window.location.reload();
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors"
        aria-label="Cambiar idioma"
      >
        <Globe className="h-4 w-4" />
        <span className="uppercase">{currentLocale}</span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 z-20 min-w-[140px] rounded-lg border border-zinc-700 bg-zinc-800 py-1 shadow-lg">
            {locales.map((locale) => (
              <button
                key={locale}
                onClick={() => handleLocaleChange(locale)}
                className={`w-full px-4 py-2 text-left text-sm transition-colors hover:bg-zinc-700 ${
                  locale === currentLocale
                    ? "bg-violet-500/20 text-violet-400"
                    : "text-zinc-300"
                }`}
              >
                {localeLabels[locale]}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
