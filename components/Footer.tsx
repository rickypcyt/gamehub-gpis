'use client';

import { Gamepad2, Globe, Mail, MapPin, Phone, Share2 } from 'lucide-react';

import { Link } from '@/i18n/navigation';

export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    navegacion: [
      { label: 'Noticias', href: '/news' },
      { label: 'Rankings', href: '/games' },
      { label: 'Blog', href: '/blog' },
      { label: 'Eventos', href: '/events' },
      { label: 'Multimedia', href: '/multimedia' },
    ],
    comunidad: [
      { label: 'Equipo', href: '/team' },
      { label: 'Contacto', href: '/contact' },
      { label: 'Login', href: '/login' },
    ],
  };

  return (
    <footer className="mt-auto border-t border-zinc-800 bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2 text-xl font-bold text-white">
              <Gamepad2 className="h-6 w-6 text-violet-500" />
              GameHub
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-zinc-400">
              Tu destino definitivo para rankings, noticias, eventos y comunidad gaming.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 transition hover:border-violet-500/30 hover:text-violet-400"
                aria-label="Twitter"
              >
                <Globe className="h-4 w-4" />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 transition hover:border-violet-500/30 hover:text-violet-400"
                aria-label="GitHub"
              >
                <Share2 className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">Navegación</h4>
            <ul className="mt-4 space-y-2.5">
              {footerLinks.navegacion.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-zinc-400 transition hover:text-violet-400"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Community */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">Comunidad</h4>
            <ul className="mt-4 space-y-2.5">
              {footerLinks.comunidad.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-zinc-400 transition hover:text-violet-400"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">Contacto</h4>
            <ul className="mt-4 space-y-3">
              <li className="flex items-start gap-2.5 text-sm text-zinc-400">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-zinc-500" />
                <span>contacto@gamehub.es</span>
              </li>
              <li className="flex items-start gap-2.5 text-sm text-zinc-400">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-zinc-500" />
                <span>+34 900 000 000</span>
              </li>
              <li className="flex items-start gap-2.5 text-sm text-zinc-400">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-zinc-500" />
                <span>Madrid, España</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-zinc-800 pt-8 sm:flex-row">
          <p className="text-sm text-zinc-500">
            © {currentYear} GameHub. Proyecto académico GPIS.
          </p>
          <div className="flex items-center gap-6 text-sm text-zinc-600">
            <Link href="/contact" className="transition hover:text-zinc-400">
              Contacto
            </Link>
            <Link href="/team" className="transition hover:text-zinc-400">
              Equipo
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
