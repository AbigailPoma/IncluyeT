'use client'

import Link from 'next/link'
import { AccessibilityControls } from '@/components/accessibility-controls'
import { Logo } from '@/components/logo'
import { buttonVariants } from '@/components/ui/button'

export function PublicHeader() {
  return (
    <header
      className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur"
      aria-label="Barra de navegación"
    >
      <div className="mx-auto flex h-16 max-w-300 items-center gap-4 px-4 lg:px-6">
        <Logo />
        <nav
          aria-label="Navegación principal"
          className="ml-4 hidden items-center gap-1 md:flex"
        >
          <Link
            href="/#empresas"
            className="rounded-md px-3 py-2 text-sm font-semibold text-foreground hover:bg-muted focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            Empresas
          </Link>
          <Link
            href="/candidato/cursos"
            className="rounded-md px-3 py-2 text-sm font-semibold text-foreground hover:bg-muted focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            Cursos del Estado
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <AccessibilityControls className="hidden sm:flex" />
          <Link
            href="/login/candidato"
            className={buttonVariants({ variant: 'ghost', size: 'sm' })}
          >
            Iniciar sesión
          </Link>
          <Link
            href="/registro/candidato"
            className={buttonVariants({ size: 'sm' })}
          >
            Registrarse
          </Link>
        </div>
      </div>
    </header>
  )
}
