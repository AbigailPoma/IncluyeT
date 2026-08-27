'use client'

import Link from 'next/link'
import { Suspense, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { CheckCircle2, Mail } from 'lucide-react'
import { AccessibilityControls } from '@/components/accessibility-controls'
import { Logo } from '@/components/logo'
import { buttonVariants } from '@/components/ui/button'
import { useAuth } from '@/Backend/context/auth-context'

function ConfirmacionContent() {
  const searchParams = useSearchParams()
  const { verifyAccount } = useAuth()
  const tipo = searchParams.get('tipo')
  const token = searchParams.get('token_hash')
  const isEmpresa = tipo === 'empresa'
  const loginHref = isEmpresa ? '/login/empresa' : '/login/candidato'

  useEffect(() => {
    if (token) verifyAccount(isEmpresa ? 'empresa' : 'candidato', token)
  }, [isEmpresa, token, verifyAccount])

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
        <div className="w-full max-w-md text-center">
          <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
            <div
              className="mx-auto flex size-16 items-center justify-center rounded-full bg-success/12"
              aria-hidden="true"
            >
              <CheckCircle2 className="size-9 text-success" />
            </div>

            <div
              role="status"
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-success/12 px-3 py-1 text-sm font-semibold text-success"
            >
              <CheckCircle2 className="size-4" aria-hidden="true" />
              Cuenta validada con éxito
            </div>

            <h1 className="mt-4 font-display text-2xl font-extrabold tracking-tight text-foreground text-balance">
              ¡Tu correo fue verificado!
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Confirmamos tu dirección de correo electrónico y tu cuenta de{' '}
              {isEmpresa ? 'empresa' : 'candidato'} ya está activa. Ya puedes
              iniciar sesión y comenzar.
            </p>

            <Link
              href={loginHref}
              className={`${buttonVariants({ size: 'lg' })} mt-6 w-full`}
            >
              Iniciar sesión
            </Link>

            <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
              <Mail className="size-4" aria-hidden="true" />
              ¿No recibiste el correo?{' '}
              <button
                type="button"
                className="rounded font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                Reenviar
              </button>
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function ConfirmacionPage() {
  return (
    <Suspense fallback={null}>
      <ConfirmacionContent />
    </Suspense>
  )
}
