'use client';

import {
  BarChart3,
  BookOpen,
  CalendarClock,
  ClipboardList,
  Gamepad2,
  Heart,
  Home,
  LayoutDashboard,
  MessageSquare,
  Newspaper,
  PenLine,
  Settings,
  ShieldAlert,
  User,
  Users,
} from "lucide-react";

import { Link } from "@/i18n/navigation";
import { usePathname } from "next/navigation";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

interface DashboardSidebarProps {
  role: string;
  userName?: string | null;
}

const navItemsByRole: Record<string, { section: string; items: NavItem[] }[]> = {
  admin: [
    {
      section: "General",
      items: [
        { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
      ],
    },
    {
      section: "Gestión",
      items: [
        { href: "/admin/users", label: "Usuarios", icon: <Users className="h-5 w-5" /> },
        { href: "/dashboard/my-news", label: "Noticias", icon: <Newspaper className="h-5 w-5" /> },
        { href: "/dashboard/comments", label: "Moderación", icon: <ShieldAlert className="h-5 w-5" /> },
      ],
    },
    {
      section: "Sistema",
      items: [
        { href: "/dashboard/stats", label: "Estadísticas", icon: <BarChart3 className="h-5 w-5" /> },
        { href: "/admin/settings", label: "Configuración", icon: <Settings className="h-5 w-5" /> },
      ],
    },
  ],
  redactor: [
    {
      section: "General",
      items: [
        { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
      ],
    },
    {
      section: "Contenido",
      items: [
        { href: "/dashboard/write/news", label: "Crear Noticia", icon: <PenLine className="h-5 w-5" /> },
        { href: "/dashboard/my-news", label: "Mis Noticias", icon: <Newspaper className="h-5 w-5" /> },
        { href: "/dashboard/drafts", label: "Borradores", icon: <ClipboardList className="h-5 w-5" /> },
        { href: "/dashboard/schedule", label: "Programar", icon: <CalendarClock className="h-5 w-5" /> },
      ],
    },
  ],
  suscriptor: [
    {
      section: "General",
      items: [
        { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
      ],
    },
    {
      section: "Mi Cuenta",
      items: [
        { href: "/dashboard/profile", label: "Perfil", icon: <User className="h-5 w-5" /> },
        { href: "/dashboard/comments", label: "Comentarios", icon: <MessageSquare className="h-5 w-5" /> },
        { href: "/dashboard/favorites", label: "Favoritos", icon: <Heart className="h-5 w-5" /> },
        { href: "/dashboard/history", label: "Historial", icon: <BookOpen className="h-5 w-5" /> },
      ],
    },
  ],
};

export default function DashboardSidebar({ role, userName }: DashboardSidebarProps) {
  const pathname = usePathname();
  const sections = navItemsByRole[role] || navItemsByRole.suscriptor;

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === href || pathname === "/dashboard/";
    return pathname.startsWith(href);
  };

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:shrink-0 lg:border-r lg:border-zinc-800 lg:bg-zinc-950">
      {/* Brand */}
      <div className="flex h-16 items-center gap-2 border-b border-zinc-800 px-6">
        <Gamepad2 className="h-6 w-6 text-violet-500" />
        <span className="text-lg font-bold text-white">GameHub</span>
      </div>

      {/* User */}
      <div className="border-b border-zinc-800 px-6 py-4">
        <p className="text-sm font-medium text-white truncate">{userName || "Usuario"}</p>
        <p className="mt-0.5 text-xs text-zinc-500 capitalize">{role}</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-4">
        {sections.map((section) => (
          <div key={section.section} className="mb-6">
            <h3 className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
              {section.section}
            </h3>
            <ul className="space-y-0.5">
              {section.items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                      isActive(item.href)
                        ? "bg-violet-500/10 text-violet-400"
                        : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* Back to home */}
      <div className="border-t border-zinc-800 p-4">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-400 transition hover:bg-zinc-900 hover:text-white"
        >
          <Home className="h-4 w-4" />
          Volver a inicio
        </Link>
      </div>
    </aside>
  );
}
