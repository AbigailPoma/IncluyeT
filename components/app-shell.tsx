'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import {
  Bell,
  Building2,
  GraduationCap,
  LayoutDashboard,
  PlusCircle,
  UserCog,
  X,
} from 'lucide-react'
import { AppHeader } from '@/components/app-header'
import { AccessibilityControls } from '@/components/accessibility-controls'
import { cn } from '@/lib/utils'

export type NavItem = {
  label: string
  href: string
  icon: string
}

const navIconMap = {
  dashboard: LayoutDashboard,
  profile: UserCog,
  notifications: Bell,
  courses: GraduationCap,
  companies: Building2,
  offer: PlusCircle,
} as const

export function AppShell({
  role,
  nav,
  children,
}: {
  role: 'candidato' | 'empresa'
  nav: NavItem[]
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      <AppHeader role={role} onOpenNav={() => setOpen(true)} />

      <div className="mx-auto flex max-w-350">
        {/* Sidebar - desktop */}
        <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-64 shrink-0 border-r border-border bg-card lg:block">
          <SidebarNav nav={nav} pathname={pathname} />
        </aside>

        {/* Sidebar - mobile drawer */}
        {open && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-foreground/40"
              onClick={() => setOpen(false)}
              aria-hidden="true"
            />
            <div
              className="absolute left-0 top-0 h-full w-72 border-r border-border bg-card"
              role="dialog"
              aria-label="Menú de navegación"
            >
              <div className="flex h-16 items-center justify-between border-b border-border px-4">
                <span className="font-display font-bold">Menú</span>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="inline-flex size-10 items-center justify-center rounded-md border-2 border-input hover:bg-muted focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  aria-label="Cerrar menú"
                >
                  <X className="size-5" aria-hidden="true" />
                </button>
              </div>
              <SidebarNav
                nav={nav}
                pathname={pathname}
                onNavigate={() => setOpen(false)}
              />
              <div className="border-t border-border p-4">
                <AccessibilityControls />
              </div>
            </div>
          </div>
        )}

        <main id="contenido-principal" className="min-w-0 flex-1 px-4 py-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  )
}

function SidebarNav({
  nav,
  pathname,
  onNavigate,
}: {
  nav: NavItem[]
  pathname: string
  onNavigate?: () => void
}) {
  return (
    <nav aria-label="Secciones" className="flex flex-col gap-1 p-3">
      {nav.map(({ label, href, icon }) => {
        const activeItem =
          pathname === href || (href !== '/' && pathname.startsWith(href))
        const Icon = navIconMap[icon as keyof typeof navIconMap]

        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-current={activeItem ? 'page' : undefined}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring',
              activeItem
                ? 'bg-primary text-primary-foreground'
                : 'text-foreground hover:bg-muted',
            )}
          >
            {Icon ? <Icon className="size-5 shrink-0" aria-hidden="true" /> : null}
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
