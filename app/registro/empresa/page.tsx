'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { CheckCircle2, Loader2, ShieldCheck } from 'lucide-react'
import { AuthShell } from '@/components/auth-shell'
import { Button } from '@/components/ui/button'
import { Field, Input } from '@/components/ui/field'
import { registerEmpresa, validarRUC } from '@/lib/api'

type RucState = 'idle' | 'validating' | 'valid' | 'invalid'

export default function RegistroEmpresaPage() {
  const router = useRouter()
  const [ruc, setRuc] = useState('')
  const [razonSocial, setRazonSocial] = useState('')
  const [correo, setCorreo] = useState('')
  const [password, setPassword] = useState('')
  const [rucState, setRucState] = useState<RucState>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const rucValid = /^\d{11}$/.test(ruc)

  // Consulta asíncrona a la API de FastAPI
  async function handleValidarRuc() {
    if (!rucValid) {
      setRucState('invalid')
      setErrorMessage('El RUC debe tener exactamente 11 dígitos numéricos.')
      return
    }

    setRucState('validating')
    const res = await validarRUC(ruc)

    if (res?.valido) {
      setRucState('valid')
      setRazonSocial(res.razon_social || '')
    } else {
      setRucState('invalid')
      setErrorMessage(res?.mensaje || 'El RUC no está activo o registrado.')
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (rucState !== 'valid') {
      setErrorMessage('Primero debes validar el RUC ante SUNAT.')
      setRucState('invalid')
      return
    }

    try {
      const response = await registerEmpresa({ ruc, razon_social: razonSocial, email: correo, password })
      if (response.token_verificacion) {
        localStorage.setItem('verification_token', response.token_verificacion)
      }
      router.push(`/confirmacion?tipo=empresa${response.token_verificacion ? `&token_hash=${encodeURIComponent(response.token_verificacion)}` : ''}`)
    } catch (reason: unknown) {
      setErrorMessage(reason instanceof Error ? reason.message : 'No se pudo crear la cuenta.')
    }
  }

  return (
    <AuthShell
      title="Registra tu empresa"
      subtitle="Crea una cuenta corporativa para publicar ofertas laborales inclusivas."
      footer={
        <>
          ¿Ya tienes cuenta?{' '}
          <Link
            href="/login/empresa"
            className="font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            Inicia sesión
          </Link>
        </>
      }
    >
      <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
        <Field
          label="RUC"
          htmlFor="ruc"
          required
          hint="Ingresa los 11 dígitos de tu RUC y valida ante SUNAT."
          status={
            rucState === 'invalid'
              ? 'error'
              : rucState === 'valid'
                ? 'success'
                : undefined
          }
          message={
            rucState === 'invalid'
              ? errorMessage
              : rucState === 'valid'
                ? 'RUC validado correctamente ante SUNAT.'
                : undefined
          }
        >
          <div className="flex gap-2">
            <Input
              id="ruc"
              inputMode="numeric"
              maxLength={11}
              value={ruc}
              placeholder="20123456789"
              aria-invalid={rucState === 'invalid'}
              aria-describedby="ruc-hint"
              onChange={(e) => {
                setRuc(e.target.value.replace(/\D/g, ''))
                setRucState('idle')
              }}
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleValidarRuc}
              disabled={rucState === 'validating'}
              className="shrink-0"
            >
              {rucState === 'validating' ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  Validando
                </>
              ) : rucState === 'valid' ? (
                <>
                  <CheckCircle2 className="size-4 text-emerald-600" aria-hidden="true" />
                  Validado
                </>
              ) : (
                'Validar SUNAT'
              )}
            </Button>
          </div>
        </Field>

        <Field label="Razón social" htmlFor="razon" required>
          <Input
            id="razon"
            value={razonSocial}
            onChange={(e) => setRazonSocial(e.target.value)}
            placeholder="Se autocompletará al validar el RUC"
            autoComplete="organization"
            required
          />
        </Field>

        <Field
          label="Correo corporativo"
          htmlFor="correo"
          required
          hint="Usaremos este correo para verificar tu cuenta."
        >
          <Input
            id="correo"
            type="email"
            placeholder="rrhh@miempresa.com"
            autoComplete="email"
            required
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
          />
        </Field>

        <Field
          label="Contraseña"
          htmlFor="password"
          required
          hint="Mínimo 8 caracteres, con letras y números."
        >
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            minLength={8}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>

        <Button type="submit" size="lg" className="mt-2">
          Crear cuenta de empresa
        </Button>

        <p className="flex items-start gap-2 rounded-lg bg-secondary/60 p-3 text-xs leading-relaxed text-muted-foreground">
          <ShieldCheck
            className="mt-0.5 size-4 shrink-0 text-primary"
            aria-hidden="true"
          />
          Al registrarte aceptas nuestras políticas de inclusión y el
          tratamiento de datos conforme a la Ley N.° 29733.
        </p>
      </form>
    </AuthShell>
  )
}