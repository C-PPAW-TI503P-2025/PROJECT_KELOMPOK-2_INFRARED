'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const items = [
  { href: '/', label: 'Command Center' },
  { href: '/entries', label: 'Operations' },
  { href: '/history', label: 'Intelligence' },
];

export default function NavLinks() {
  const pathname = usePathname();

  return (
    <nav className="navLinks">
      {items.map((it) => {
        const active = pathname === it.href;
        return (
          <Link key={it.href} href={it.href} className={'navItem' + (active ? ' active' : '')}>
            <span className="navDot" aria-hidden="true" />
            <span className="navLabel">{it.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
