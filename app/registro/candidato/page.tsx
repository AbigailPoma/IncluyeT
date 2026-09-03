'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { ExternalLink, Info, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { AuthShell } from '@/components/auth-shell'
import { Button } from '@/components/ui/button'
import { Field, Input } from '@/components/ui/field'
import { validarCONADIS } from '@/lib/api'
import { useAuth } from '@/Backend/context/auth-context'

export default function RegistroCandidatoPage() {
  const router = useRouter()
  const { register } = useAuth()

  // Estados del formulario
  const [dni, setDni] = useState('')
  const [carnet, setCarnet] = useState('')
  const [nombres, setNombres] = useState('')
  const [apellidos, setApellidos] = useState('')
  const [correo, setCorreo] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const [touched, setTouched] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  const [conadisResult, setConadisResult] = useState<{
    registrado?: boolean
    carnet?: string
    tipo_discapacidad?: string
    mensaje?: string
  } | null>(null)

  const carnetValid = carnet.length === 0 || /^\d{6,10}$/.test(carnet)

  // Integración con la API en FastAPI para validar CONADIS
  async function handleValidarConadis() {
    if (dni.length !== 8) return
    setIsValidating(true)
    const data = await validarCONADIS(dni)
    setConadisResult(data)
    setIsValidating(false)

    // Si está registrado en la BD, autocompleta el carné
    if (data?.registrado && data.carnet) {
      setCarnet(data.carnet.replace(/\D/g, ''))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    try {
      setError('')
      await register({
        nombre: `${nombres} ${apellidos}`.trim() || 'Nuevo Candidato',
        email: correo,
        dni,
        password,
        numConadis: carnet || conadisResult?.carnet || '',
        conadisValido: Boolean(conadisResult?.registrado),
        tituloProfesional: 'Profesional en búsqueda activa',
        resumenPerfil: 'Perfil recién creado. Edita este resumen para mejorar el cálculo de compatibilidad IA.',
        habilidades: ['Trabajo en equipo', 'Comunicación'],
        adaptaciones: conadisResult?.tipo_discapacidad ? [conadisResult.tipo_discapacidad] : ['Trabajo Remoto'],
      })
      const token = localStorage.getItem('verification_token')
      router.push(`/confirmacion?tipo=candidato${token ? `&token_hash=${encodeURIComponent(token)}` : ''}`)
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : 'No se pudo crear la cuenta.')
    }
  }

  return (
    <AuthShell
      title="Crea tu perfil de candidato"
      subtitle="Regístrate para postular a empleos con adaptaciones y acceder a cursos gratuitos."
      footer={
        <>
    ¿Ya tienes cuenta?{' '}
    <Link
      href="/login/candidato"
      className="font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      Inicia sesión
    </Link>
  </>
      }
    >
      <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
        {error && (
          <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs font-medium text-rose-600">
            {error}
          </div>
        )}
        {/* Campo DNI con botón de verificación contra FastAPI */}
        <Field label="DNI" htmlFor="dni" required>
          <div className="flex gap-2">
            <Input
              id="dni"
              inputMode="numeric"
              maxLength={8}
              placeholder="12345678"
              value={dni}
              onChange={(e) => setDni(e.target.value.replace(/\D/g, ''))}
              required
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleValidarConadis}
              disabled={isValidating || dni.length !== 8}
              className="shrink-0"
            >
              {isValidating ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                'Verificar CONADIS'
              )}
            </Button>
          </div>
        </Field>

        {/* Banner con el resultado de la validación del backend */}
        {conadisResult && (
          <div className="-mt-2">
            {conadisResult.registrado ? (
              <div className="flex items-start gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-600">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
                <div>
                  <p className="font-semibold">Carné CONADIS Verificado</p>
                  <p>
                    Carné: {conadisResult.carnet} | Discapacidad:{' '}
                    {conadisResult.tipo_discapacidad}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-600">
                <AlertCircle className="size-4 shrink-0" />
                <span>
                  {conadisResult.mensaje ||
                    'DNI no registrado en el padrón del CONADIS.'}
                </span>
              </div>
            )}
          </div>
        )}

        <Field
          label="Código de carnet CONADIS"
          htmlFor="carnet"
          hint="Opcional. Acredita tu inscripción en el Registro Nacional de la Persona con Discapacidad."
          status={!carnetValid && touched ? 'error' : undefined}
          message={
            !carnetValid && touched
              ? 'El código debe contener entre 6 y 10 dígitos.'
              : undefined
          }
        >
          <Input
            id="carnet"
            inputMode="numeric"
            value={carnet}
            placeholder="123456"
            aria-invalid={!carnetValid && touched}
            onBlur={() => setTouched(true)}
            onChange={(e) => setCarnet(e.target.value.replace(/\D/g, ''))}
          />
        </Field>

        <a
          href="https://www.gob.pe/conadis"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-start gap-2 rounded-lg border border-border bg-secondary/60 p-3 text-sm leading-relaxed text-foreground underline-offset-4 hover:bg-secondary focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <Info className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
          <span>
            ¿Aún no tienes carnet?{' '}
            <span className="font-semibold text-primary underline">
              Tramítalo en la web oficial de CONADIS
            </span>
            <ExternalLink
              className="ml-1 inline size-3.5 text-primary"
              aria-label="(se abre en una nueva pestaña)"
            />
          </span>
        </a>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nombres" htmlFor="nombres" required>
            <Input
              id="nombres"
              autoComplete="given-name"
              value={nombres}
              onChange={(e) => setNombres(e.target.value)}
              required
            />
          </Field>
          <Field label="Apellidos" htmlFor="apellidos" required>
            <Input
              id="apellidos"
              autoComplete="family-name"
              value={apellidos}
              onChange={(e) => setApellidos(e.target.value)}
              required
            />
          </Field>
        </div>

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
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </Field>

        <Button type="submit" size="lg" className="mt-2">
          Crear mi perfil
        </Button>
      </form>
    </AuthShell>
  )
}