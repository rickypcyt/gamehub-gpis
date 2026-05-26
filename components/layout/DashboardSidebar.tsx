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
import { useTranslations } from "next-intl";

interface NavItem {
  href: string;
  labelKey: string;
  icon: React.ReactNode;
}

interface DashboardSidebarProps {
  role: string;
  userName?: string | null;
}

const navItemsByRole: Record<string, { sectionKey: string; items: NavItem[] }[]> = {
  admin: [
    {
      sectionKey: "general",
      items: [
        { href: "/dashboard", labelKey: "dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
      ],
    },
    {
      sectionKey: "management",
      items: [
        { href: "/admin/users", labelKey: "users", icon: <Users className="h-5 w-5" /> },
        { href: "/dashboard/my-news", labelKey: "news", icon: <Newspaper className="h-5 w-5" /> },
        { href: "/dashboard/comments", labelKey: "moderation", icon: <ShieldAlert className="h-5 w-5" /> },
      ],
    },
    {
      sectionKey: "system",
      items: [
        { href: "/dashboard/stats", labelKey: "stats", icon: <BarChart3 className="h-5 w-5" /> },
        { href: "/admin/settings", labelKey: "settings", icon: <Settings className="h-5 w-5" /> },
      ],
    },
  ],
  redactor: [
    {
      sectionKey: "general",
      items: [
        { href: "/dashboard", labelKey: "dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
      ],
    },
    {
      sectionKey: "content",
      items: [
        { href: "/dashboard/write/news", labelKey: "createNews", icon: <PenLine className="h-5 w-5" /> },
        { href: "/dashboard/my-news", labelKey: "myNews", icon: <Newspaper className="h-5 w-5" /> },
        { href: "/dashboard/drafts", labelKey: "drafts", icon: <ClipboardList className="h-5 w-5" /> },
        { href: "/dashboard/schedule", labelKey: "schedule", icon: <CalendarClock className="h-5 w-5" /> },
      ],
    },
  ],
  suscriptor: [
    {
      sectionKey: "general",
      items: [
        { href: "/dashboard", labelKey: "dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
      ],
    },
    {
      sectionKey: "myAccount",
      items: [
        { href: "/dashboard/profile", labelKey: "profile", icon: <User className="h-5 w-5" /> },
        { href: "/dashboard/comments", labelKey: "comments", icon: <MessageSquare className="h-5 w-5" /> },
        { href: "/dashboard/favorites", labelKey: "favorites", icon: <Heart className="h-5 w-5" /> },
        { href: "/dashboard/history", labelKey: "history", icon: <BookOpen className="h-5 w-5" /> },
      ],
    },
  ],
};

export default function DashboardSidebar({ role, userName }: DashboardSidebarProps) {
  const pathname = usePathname();
  const t = useTranslations("dashboard.sidebar");
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
        <p className="text-sm font-medium text-white truncate">{userName || t("userFallback")}</p>
        <p className="mt-0.5 text-xs text-zinc-500 capitalize">{role}</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-4">
        {sections.map((section) => (
          <div key={section.sectionKey} className="mb-6">
            <h3 className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
              {t(`sections.${section.sectionKey}`)}
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
                    {t(`items.${item.labelKey}`)}
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
          {t("backToHome")}
        </Link>
      </div>
    </aside>
  );
}
