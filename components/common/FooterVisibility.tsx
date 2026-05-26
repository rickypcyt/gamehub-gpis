'use client';

import { usePathname } from 'next/navigation';

import { Footer } from '@/components/common/Footer';

const HIDE_ON_PATHS = ['/dashboard'];

export function FooterVisibility() {
  const pathname = usePathname();
  const shouldHideFooter = pathname
    ? HIDE_ON_PATHS.some((segment) => pathname.includes(segment))
    : false;

  if (shouldHideFooter) {
    return null;
  }

  return <Footer />;
}
