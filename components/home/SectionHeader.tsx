import { Link } from "@/i18n/navigation";
import { ArrowRight, type LucideIcon } from "lucide-react";

interface SectionHeaderProps {
  icon: LucideIcon;
  title: string;
  href?: string;
  linkText?: string;
}

export function SectionHeader({ icon: Icon, title, href, linkText }: SectionHeaderProps) {
  return (
    <div className="mb-8 flex items-center justify-between">
      <h2 className="flex items-center gap-3 text-2xl font-bold text-white">
        <span className="inline-flex rounded-lg bg-violet-500/10 p-2 text-violet-500">
          <Icon className="h-6 w-6" />
        </span>
        {title}
      </h2>
      {href && linkText && (
        <Link
          href={href}
          className="group flex items-center gap-1.5 text-sm font-medium text-violet-400 transition hover:text-violet-300"
        >
          {linkText}
          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
        </Link>
      )}
    </div>
  );
}
