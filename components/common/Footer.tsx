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
      <div className="mx-auto max-w-7xl px-4 py-6 sm:py-12">
        <div className="grid grid-cols-2 gap-4 sm:gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2 text-lg font-bold text-white sm:text-xl">
              <Gamepad2 className="h-5 w-5 text-violet-500 sm:h-6 sm:w-6" />
              GameHub
            </Link>
            <p className="mt-2 text-sm leading-relaxed text-zinc-400 sm:mt-4">
              {tFooter('tagline')}
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">{tFooter('navigationHeading')}</h4>
            <ul className="mt-2 space-y-1.5 sm:mt-4 sm:space-y-2.5">
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
            <ul className="mt-2 space-y-1.5 sm:mt-4 sm:space-y-2.5">
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
          <div className="col-span-2 sm:col-span-1">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">{tFooter('contactHeading')}</h4>
            <ul className="mt-2 space-y-2 sm:mt-4 sm:space-y-3">
              <li className="flex items-start gap-2 text-sm text-zinc-400 sm:gap-2.5">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-zinc-500" />
                <span>{tFooter('contactEmail')}</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-zinc-400 sm:gap-2.5">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-zinc-500" />
                <span>{tFooter('contactPhone')}</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-zinc-400 sm:gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-zinc-500" />
                <span>{tFooter('location')}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-6 flex flex-col items-center justify-between gap-2 border-t border-zinc-800 pt-4 sm:mt-12 sm:gap-4 sm:pt-8">
          <p className="text-xs text-center text-zinc-500 sm:text-sm">
            {tFooter('copyright').replace('2025', currentYear.toString())}
          </p>
          <div className="flex items-center gap-3 text-xs text-zinc-600 sm:gap-6 sm:text-sm">
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
