'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { AuthShell } from '@/components/auth-shell'
import { Button } from '@/components/ui/button'
import { Field, Input } from '@/components/ui/field'
import { useAuth } from '@/Backend/context/auth-context'

export default function LoginEmpresaPage() {
  const router = useRouter()
  const { loginEmpresa } = useAuth()
  const [usuario, setUsuario] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  return (
    <AuthShell
      title="Acceso empresas"
      subtitle="Ingresa a tu panel para gestionar ofertas y postulaciones."
      footer={
        <>
          ¿Aún no tienes cuenta?{' '}
          <Link
            href="/registro/empresa"
            className="font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            Registra tu empresa
          </Link>
        </>
      }
    >
      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault()
          setError('')
          loginEmpresa(usuario, password)
            .then((success) => {
              if (success) router.push('/empresa')
            })
            .catch((reason: unknown) => {
              setError(reason instanceof Error ? reason.message : 'No se pudo iniciar sesión.')
            })
        }}
      >
        {error && <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs font-medium text-rose-600">{error}</div>}
        <Field label="Correo corporativo" htmlFor="usuario" required>
          <Input
            id="usuario"
            placeholder="20123456789 o rrhh@empresa.com"
            autoComplete="username"
            required
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
          />
        </Field>
        <Field label="Contraseña" htmlFor="password" required>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>
        <div className="flex justify-end">
          <Link
            href="#"
            className="rounded text-sm font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
        <Button type="submit" size="lg">
          Iniciar sesión
        </Button>
      </form>
    </AuthShell>
  )
}
