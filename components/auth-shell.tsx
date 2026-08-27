import Link from 'next/link'
import { AccessibilityControls } from '@/components/accessibility-controls'
import { Logo } from '@/components/logo'

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string
  subtitle: string
  children: React.ReactNode
  footer?: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col bg-secondary/40">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex h-16 max-w-250 items-center justify-between px-4 lg:px-6">
          <Logo />
          <AccessibilityControls />
        </div>
      </header>
      <main
        id="contenido-principal"
        className="flex flex-1 items-center justify-center px-4 py-10"
      >
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
            <h1 className="font-display text-2xl font-extrabold tracking-tight text-foreground text-balance">
              {title}
            </h1>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              {subtitle}
            </p>
            <div className="mt-6">{children}</div>
          </div>
          {footer && (
            <p className="mt-4 text-center text-sm text-muted-foreground">
              {footer}
            </p>
          )}
          <p className="mt-6 text-center text-xs text-muted-foreground">
            <Link
              href="/"
              className="rounded underline-offset-4 hover:underline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              ← Volver al inicio
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}
