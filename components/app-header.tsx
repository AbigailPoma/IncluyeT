'use client'

import Link from 'next/link'
import { useState } from 'react'
import {
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  Search,
  SlidersHorizontal,
  User,
} from 'lucide-react'
import { AccessibilityControls } from '@/components/accessibility-controls'
import { Logo } from '@/components/logo'
import { cn } from '@/lib/utils'

type Role = 'candidato' | 'empresa'

const FILTERS = [
  'Trabajo remoto',
  'Jornada flexible',
  'Lengua de señas (LSP)',
  'Accesibilidad física',
  'Contratación directa',
]

export function AppHeader({
  role,
  onOpenNav,
}: {
  role: Role
  onOpenNav?: () => void
}) {
  const [showFilters, setShowFilters] = useState(false)
  const [active, setActive] = useState<string[]>([])
  const base = role === 'candidato' ? '/candidato' : '/empresa'

  function toggleFilter(f: string) {
    setActive((prev) =>
      prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f],
    )
  }

  return (
    <header
      className="sticky top-0 z-40 border-b border-border bg-card"
      aria-label="Barra de navegación principal"
    >
      <div className="mx-auto flex h-16 max-w-350 items-center gap-3 px-4 lg:px-6">
        {onOpenNav && (
          <button
            type="button"
            onClick={onOpenNav}
            className="inline-flex size-10 items-center justify-center rounded-md border-2 border-input text-foreground hover:bg-muted focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring lg:hidden"
            aria-label="Abrir menú de navegación"
          >
            <Menu className="size-5" aria-hidden="true" />
          </button>
        )}

        <Logo href={base} className="shrink-0" />

        {/* Search + filters */}
        <div className="relative ml-2 hidden flex-1 md:block">
          <form
            role="search"
            className="flex items-center gap-2"
            onSubmit={(e) => e.preventDefault()}
          >
            <div className="relative flex-1">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <label htmlFor="buscador" className="sr-only">
                Buscar empleos, empresas o cursos
              </label>
              <input
                id="buscador"
                type="search"
                placeholder="Buscar empleos, empresas o cursos…"
                className="h-11 w-full rounded-lg border-2 border-input bg-background pl-10 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-3 focus-visible:outline-offset-1 focus-visible:outline-ring"
              />
            </div>
            <button
              type="button"
              onClick={() => setShowFilters((v) => !v)}
              aria-expanded={showFilters}
              aria-controls="panel-filtros"
              className={cn(
                'inline-flex h-11 items-center gap-2 rounded-lg border-2 border-input px-3.5 text-sm font-semibold text-foreground hover:bg-muted focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring',
                active.length > 0 && 'border-primary text-primary',
              )}
            >
              <SlidersHorizontal className="size-4" aria-hidden="true" />
              Filtros
              {active.length > 0 && (
                <span className="flex size-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                  {active.length}
                </span>
              )}
            </button>
          </form>

          {showFilters && (
            <div
              id="panel-filtros"
              className="absolute right-0 top-14 z-50 w-80 rounded-xl border border-border bg-popover p-4 shadow-lg"
            >
              <p className="mb-2 text-sm font-bold text-popover-foreground">
                Filtros inclusivos
              </p>
              <ul className="flex flex-col gap-1">
                {FILTERS.map((f) => (
                  <li key={f}>
                    <label className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 hover:bg-muted">
                      <input
                        type="checkbox"
                        checked={active.includes(f)}
                        onChange={() => toggleFilter(f)}
                        className="size-4 accent-primary focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring"
                      />
                      <span className="text-sm text-popover-foreground">
                        {f}
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <AccessibilityControls className="hidden lg:flex" />

          {/* Notifications */}
          <Link
            href={`${base}/notificaciones`}
            className="relative inline-flex size-10 items-center justify-center rounded-md border-2 border-input text-foreground hover:bg-muted focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring"
            aria-label="Centro de notificaciones, 3 sin leer"
          >
            <Bell className="size-5" aria-hidden="true" />
            <span
              className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full border-2 border-card bg-destructive text-[10px] font-bold text-destructive-foreground"
              aria-hidden="true"
            >
              3
            </span>
          </Link>

          {/* Profile */}
          <Link
            href={`${base}/perfil`}
            className="inline-flex items-center gap-2 rounded-md border-2 border-input py-1 pl-1 pr-2.5 text-foreground hover:bg-muted focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring"
            aria-label="Ir a mi perfil"
          >
            <span className="flex size-8 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
              <User className="size-4" aria-hidden="true" />
            </span>
            <span className="hidden text-sm font-semibold lg:inline">
              {role === 'candidato' ? 'María R.' : 'Tech Perú'}
            </span>
            <ChevronDown
              className="hidden size-4 text-muted-foreground lg:inline"
              aria-hidden="true"
            />
          </Link>

          <Link
            href="/"
            className="hidden size-10 items-center justify-center rounded-md border-2 border-input text-foreground hover:bg-muted focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring sm:inline-flex"
            aria-label="Cerrar sesión"
          >
            <LogOut className="size-5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </header>
  )
}
