"use client";

import { useEffect, useState, useTransition } from "react";
import { Globe } from "lucide-react";
import { localeLabels, locales, type Locale } from "@/i18n/config";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";

export default function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [currentLocale, setCurrentLocale] = useState<Locale>(locale);
  const [isOpen, setIsOpen] = useState(false);
  const [, startTransition] = useTransition();

  useEffect(() => {
    setCurrentLocale(locale);
  }, [locale]);

  const handleLocaleChange = (nextLocale: Locale) => {
    setIsOpen(false);

    if (nextLocale === currentLocale) return;

    startTransition(() => {
      document.cookie = `locale=${nextLocale}; path=/; max-age=${60 * 60 * 24 * 365}`;
      localStorage.setItem("locale", nextLocale);
      router.replace(pathname, { locale: nextLocale });
      router.refresh();
    });
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
