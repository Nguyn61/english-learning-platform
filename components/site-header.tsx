'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BookOpenCheck, LayoutDashboard, History, ShieldCheck } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

// NOTE: Admin access is UI-only — controlled by NEXT_PUBLIC_ADMIN_EMAILS.
// In production, enforce access with Firebase Auth custom claims and Firestore Security Rules.
const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? '').split(',').map((e) => e.trim())
const SHOW_ADMIN = ADMIN_EMAILS.length > 0 && ADMIN_EMAILS[0] !== ''

const NAV_ITEMS = [
  { href: '/', label: 'Practice', icon: LayoutDashboard },
  { href: '/results', label: 'Results', icon: History },
  ...(SHOW_ADMIN ? [{ href: '/admin', label: 'Admin', icon: ShieldCheck }] : []),
]

export function SiteHeader() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-card/95 shadow-sm backdrop-blur-md">
      <div className="mx-auto flex min-h-16 max-w-6xl items-center justify-between gap-3 px-3 py-2 sm:px-6">
        <Link
          href="/"
          className="flex min-w-0 items-center gap-2.5 rounded-lg font-semibold text-foreground outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50"
          aria-label="YouPass English home"
        >
          <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm shadow-primary/20">
            <BookOpenCheck className="size-5" aria-hidden="true" />
          </div>
          <div className="hidden leading-tight sm:block">
            <span className="block text-sm font-extrabold tracking-tight">YouPass English</span>
            <span className="hidden text-[11px] font-semibold text-muted-foreground sm:block">TOEIC practice hub</span>
          </div>
        </Link>

        <nav aria-label="Main navigation" className="flex min-w-0 items-center gap-1 rounded-lg border border-border bg-muted/60 p-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex min-h-11 items-center gap-1.5 rounded-md px-2 text-xs font-bold transition-colors duration-200 outline-none focus-visible:ring-3 focus-visible:ring-ring/50 sm:px-3 sm:text-sm',
                  active
                    ? 'bg-card text-primary shadow-sm ring-1 ring-border'
                    : 'text-muted-foreground hover:bg-card/80 hover:text-foreground'
                )}
                aria-current={active ? 'page' : undefined}
              >
                <Icon className="size-4" aria-hidden="true" />
                <span>{label}</span>
              </Link>
            )
          })}
        </nav>

        <Badge variant="outline" className="hidden border-brand-orange/30 bg-brand-orange-light text-brand-orange lg:inline-flex">
          Student mode
        </Badge>
      </div>
    </header>
  )
}
