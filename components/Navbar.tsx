'use client';

import { FileText, Gamepad2, Settings, User, Users } from "lucide-react";
import { useEffect, useState } from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

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
    { href: "/news", label: "Noticias" },
    { href: "/games", label: "Juegos" },
    { href: "/blog", label: "Blog" },
    { href: "/multimedia", label: "Multimedia" },
    { href: "/events", label: "Eventos" },
    { href: "/team", label: "Equipo" },
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
    <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold text-white">
          <Gamepad2 className="h-6 w-6 text-violet-500" />
          GameHub
        </Link>
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
          {isLoggedIn ? (
            <Link
              href="/dashboard"
              className="flex items-center gap-2 rounded-md bg-violet-600 px-4 py-2 text-base font-medium text-white hover:bg-violet-700"
            >
              <User className="h-4 w-4" />
              Ver Perfil
            </Link>
          ) : (
            <Link
              href="/login"
              className="rounded-md bg-violet-600 px-4 py-2 text-base font-medium text-white hover:bg-violet-700"
            >
              Iniciar Sesión
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
