'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { AuthShell } from '@/components/auth-shell'
import { Button } from '@/components/ui/button'
import { Field, Input } from '@/components/ui/field'
import { useAuth } from '@/Backend/context/auth-context'

export default function LoginCandidatoPage() {
  const router = useRouter()
  const { login } = useAuth()

  const [correo, setCorreo] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    try {
      if (await login(correo, password)) router.push('/candidato')
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : 'No se pudo iniciar sesión.')
    }
  }

  return (
    <AuthShell
      title="Iniciar Sesión"
      subtitle="Ingresa con tu correo para acceder a tu panel de empleos y compatibilidad con IA."
      footer={
        <>
          ¿Aún no tienes cuenta?{' '}
          <Link
            href="/registro/candidato"
            className="font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            Regístrate aquí
          </Link>
        </>
      }
    >
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        {error && (
          <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs font-medium text-rose-600">
            {error}
          </div>
        )}

        <Field label="Correo electrónico" htmlFor="correo" required>
          <Input
            id="correo"
            type="email"
            placeholder="tucorreo@ejemplo.com"
            autoComplete="email"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            required
          />
        </Field>

        <Field label="Contraseña" htmlFor="password" required>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </Field>

        <Button type="submit" size="lg" className="mt-2">
          Ingresar
        </Button>
      </form>
    </AuthShell>
  )
}