'use client';

import { FileText, Gamepad2, Menu, Settings, User, Users, X } from "lucide-react";
import { useEffect, useState } from "react";

import LanguageSwitcher from "./LanguageSwitcher";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

export default function Navbar() {
  const pathname = usePathname();
  const t = useTranslations("nav");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Verificar si hay una sesión activa
    const checkSession = async () => {
      try {
        const response = await fetch('/api/auth/session');
        const data = await response.json();
        setIsLoggedIn(!!data.user);
        setUserRole(data.user?.role || null);
      } catch {
        setIsLoggedIn(false);
        setUserRole(null);
      }
    };
    checkSession();
  }, []);

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };

  const navItems = [
    { href: "/news", label: t("news") },
    { href: "/games", label: t("games") },
    { href: "/blog", label: t("blog") },
    { href: "/multimedia", label: t("multimedia") },
    { href: "/events", label: t("events") },
    { href: "/team", label: t("team") },
  ];

  // Role-based menu items
  const roleMenuItems: { href: string; label: string; icon: React.ReactNode; allowedRoles: string[] }[] = [
    {
      href: "/admin/news",
      label: "Gestionar Noticias",
      icon: <FileText className="h-4 w-4" />,
      allowedRoles: ["admin", "redactor"],
    },
    {
      href: "/admin/users",
      label: "Gestionar Usuarios",
      icon: <Users className="h-4 w-4" />,
      allowedRoles: ["admin"],
    },
    {
      href: "/admin/settings",
      label: "Configuración",
      icon: <Settings className="h-4 w-4" />,
      allowedRoles: ["admin"],
    },
  ];

  const visibleRoleItems = roleMenuItems.filter(item => 
    userRole && item.allowedRoles.includes(userRole)
  );

  return (
    <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur sticky top-0 z-50">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold text-white">
          <Gamepad2 className="h-6 w-6 text-violet-500" />
          GameHub
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-6 text-lg text-zinc-400 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`hover:text-white ${
                isActive(item.href)
                  ? "text-violet-400 underline underline-offset-4"
                  : ""
              }`}
            >
              {item.label}
            </Link>
          ))}
          {visibleRoleItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-1 hover:text-white ${
                isActive(item.href)
                  ? "text-violet-400 underline underline-offset-4"
                  : ""
              }`}
            >
              {item.icon}
              <span className="text-base">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          
          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-800 text-zinc-300 md:hidden hover:bg-zinc-700"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          {/* Desktop Login/Profile Button */}
          {isLoggedIn ? (
            <Link
              href="/dashboard"
              className="hidden md:flex items-center gap-2 rounded-md bg-violet-600 px-4 py-2 text-base font-medium text-white hover:bg-violet-700"
            >
              <User className="h-4 w-4" />
              {t("profile")}
            </Link>
          ) : (
            <Link
              href="/login"
              className="hidden md:flex rounded-md bg-violet-600 px-4 py-2 text-base font-medium text-white hover:bg-violet-700"
            >
              {t("login")}
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-zinc-800 bg-zinc-950/95 backdrop-blur">
          <nav className="mx-auto max-w-7xl px-4 py-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-3 text-base font-medium ${
                  isActive(item.href)
                    ? "bg-violet-500/10 text-violet-400"
                    : "text-zinc-300 hover:bg-zinc-800 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            ))}
            
            {visibleRoleItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-3 text-base font-medium ${
                  isActive(item.href)
                    ? "bg-violet-500/10 text-violet-400"
                    : "text-zinc-300 hover:bg-zinc-800 hover:text-white"
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}

            {/* Mobile Login/Profile */}
            <div className="border-t border-zinc-800 pt-4 mt-4">
              {isLoggedIn ? (
                <Link
                  href="/dashboard"
                  className="flex items-center gap-3 rounded-lg bg-violet-600 px-3 py-3 text-base font-medium text-white hover:bg-violet-700"
                >
                  <User className="h-4 w-4" />
                  {t("profile")}
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-3 rounded-lg bg-violet-600 px-3 py-3 text-base font-medium text-white hover:bg-violet-700"
                >
                  {t("login")}
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
