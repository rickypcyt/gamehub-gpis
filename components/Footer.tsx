'use client';

import { Cloud, Database, GitBranch } from 'lucide-react';

import Link from 'next/link';

export function Footer() {
  return (
    <footer className="mt-auto border-t border-zinc-800 bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="flex flex-col items-center justify-center gap-4 text-center sm:flex-row sm:justify-between">
          <p className="text-sm text-zinc-500">
            © 2026 GameHub. GPIS.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-zinc-600 sm:gap-6">
            <Link href="/contact" className="hover:text-zinc-400 transition-colors">Contacto</Link>
            <Link href="/team" className="hover:text-zinc-400 transition-colors">Equipo</Link>
            <div className="flex items-center gap-1.5">
              <Cloud className="h-3.5 w-3.5" />
              <span>Next.js + Vercel</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Database className="h-3.5 w-3.5" />
              <span>Neon (PostgreSQL)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <GitBranch className="h-3.5 w-3.5" />
              <span>GitHub</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
