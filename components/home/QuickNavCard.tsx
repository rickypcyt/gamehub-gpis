import { Link } from "@/i18n/navigation";
import { ArrowUpRight, type LucideIcon } from "lucide-react";

interface QuickNavCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  href: string;
}

export function QuickNavCard({ icon: Icon, title, description, href }: QuickNavCardProps) {
  return (
    <Link
      href={href}
      className="group flex flex-col rounded-lg border border-zinc-800 bg-zinc-900/50 p-6 transition hover:border-violet-500/30 hover:bg-zinc-900"
    >
      <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/10 text-violet-500 transition group-hover:bg-violet-500/20">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mb-2 flex items-center gap-2 text-lg font-semibold text-white group-hover:text-violet-400 transition">
        {title}
        <ArrowUpRight className="h-4 w-4 opacity-0 transition group-hover:opacity-100" />
      </h3>
      <p className="text-sm leading-relaxed text-zinc-400">{description}</p>
    </Link>
  );
}
