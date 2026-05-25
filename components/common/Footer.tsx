'use client';

import { Gamepad2, Mail, MapPin, Phone } from 'lucide-react';

import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

export function Footer() {
  const currentYear = new Date().getFullYear();
  const tFooter = useTranslations('footer');
  const tNav = useTranslations('nav');

  const footerLinks = {
    navigation: [
      { label: tNav('news'), href: '/news' },
      { label: tNav('games'), href: '/games' },
      { label: tNav('blog'), href: '/blog' },
      { label: tNav('events'), href: '/events' },
      { label: tNav('multimedia'), href: '/multimedia' },
    ],
    community: [
      { label: tFooter('team'), href: '/team' },
      { label: tFooter('contact'), href: '/contact' },
      { label: tFooter('login'), href: '/login' },
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
              {tFooter('tagline')}
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">{tFooter('navigationHeading')}</h4>
            <ul className="mt-4 space-y-2.5">
              {footerLinks.navigation.map((link) => (
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
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">{tFooter('communityHeading')}</h4>
            <ul className="mt-4 space-y-2.5">
              {footerLinks.community.map((link) => (
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
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">{tFooter('contactHeading')}</h4>
            <ul className="mt-4 space-y-3">
              <li className="flex items-start gap-2.5 text-sm text-zinc-400">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-zinc-500" />
                <span>{tFooter('contactEmail')}</span>
              </li>
              <li className="flex items-start gap-2.5 text-sm text-zinc-400">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-zinc-500" />
                <span>{tFooter('contactPhone')}</span>
              </li>
              <li className="flex items-start gap-2.5 text-sm text-zinc-400">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-zinc-500" />
                <span>{tFooter('location')}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-zinc-800 pt-8 sm:flex-row">
          <p className="text-sm text-zinc-500">
            {tFooter('copyright').replace('2025', currentYear.toString())}
          </p>
          <div className="flex items-center gap-6 text-sm text-zinc-600">
            <Link href="/contact" className="transition hover:text-zinc-400">
              {tFooter('contact')}
            </Link>
            <Link href="/team" className="transition hover:text-zinc-400">
              {tFooter('team')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
