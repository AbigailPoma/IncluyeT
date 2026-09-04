'use client'

import type React from 'react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Accessibility,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileText,
  Sparkles,
  UploadCloud,
  Trash2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Field, Input, Select, Textarea } from '@/components/ui/field'
import { cn } from '@/lib/utils'
import { subirCvCandidato } from '@/lib/api'
import { useAuth } from '@/Backend/context/auth-context'

const STEPS = ['Datos personales', 'CV y experiencia', 'Accesibilidad', 'Revisión']

const ADAPTACIONES_OPCIONES = [
  'Trabajo remoto',
  'Jornada flexible',
  'Accesibilidad física / rampas',
  'Intérprete de lengua de señas',
  'Lector de pantalla',
  'Pausas adicionales',
]

export default function CandidatoPerfilWizard() {
  const router = useRouter()
  const { candidato, updateProfile, deleteAccount } = useAuth()

  const [step, setStep] = useState(0)
  const [isSaved, setIsSaved] = useState(false)
  const [errorValidation, setErrorValidation] = useState('')
  const [cvFile, setCvFile] = useState<File | null>(null)
  const [isProcessingCv, setIsProcessingCv] = useState(false)

  // Desglosar el nombre guardado en nombres y apellidos para el formulario
  const nombrePartes = (candidato?.nombre || 'María Rojas Quispe').split(' ')
  const initialNombres = nombrePartes[0] || 'María'
  const initialApellidos = nombrePartes.slice(1).join(' ') || 'Rojas'

  const [formData, setFormData] = useState({
    nombres: initialNombres,
    apellidos: initialApellidos,
    telefono: '',
    departamento: candidato?.departamento || 'Lima',
    bio:
      candidato?.resumenPerfil ||
      'Profesional con experiencia en desarrollo y análisis de datos, buscando vacantes en modalidad remota con herramientas de accesibilidad.',
    puesto: candidato?.tituloProfesional || 'Desarrolladora Frontend',
    adaptaciones: candidato?.adaptaciones || ['Trabajo remoto', 'Lector de pantalla'],
    numConadis: candidato?.numConadis || '',
    cvNombreFile: candidato?.cvNombreFile || '',
  })

  useEffect(() => {
    if (!candidato) return
    const nombrePartes = candidato.nombre.trim().split(/\s+/)
    setFormData((prev) => ({
      ...prev,
      nombres: nombrePartes[0] || '',
      apellidos: nombrePartes.slice(1).join(' '),
      bio: candidato.resumenPerfil,
      puesto: candidato.tituloProfesional,
      adaptaciones: candidato.adaptaciones,
      numConadis: candidato.numConadis || '',
      cvNombreFile: candidato.cvNombreFile || '',
      telefono: candidato.telefono || '',
      departamento: candidato.departamento || 'Lima',
    }))
  }, [candidato])

  const progress = ((step + 1) / STEPS.length) * 100

  const handleInputChange = (field: string, value: string) => {
    setErrorValidation('')
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleAdaptacionToggle = (opcion: string) => {
    setFormData((prev) => {
      const exists = prev.adaptaciones.includes(opcion)
      const updated = exists
        ? prev.adaptaciones.filter((item) => item !== opcion)
        : [...prev.adaptaciones, opcion]
      return { ...prev, adaptaciones: updated }
    })
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.type !== 'application/pdf') {
        alert('Por favor, sube un archivo en formato PDF.')
        return
      }
      if (!candidato?.access_token) {
        setErrorValidation('Inicia sesión nuevamente para procesar tu CV.')
        return
      }
      setIsProcessingCv(true)
      setErrorValidation('')
      try {
        const result = await subirCvCandidato(candidato.id, file, candidato.access_token)
        const perfil = result.perfil
        setFormData((prev) => ({
          ...prev,
          nombres: perfil.nombres || prev.nombres,
          apellidos: perfil.apellidos || prev.apellidos,
          puesto: perfil.puesto || prev.puesto,
          bio: perfil.resumenPerfil || prev.bio,
          adaptaciones: perfil.adaptaciones?.length ? perfil.adaptaciones : prev.adaptaciones,
          cvNombreFile: file.name,
        }))
        setCvFile(file)
      } catch (reason: unknown) {
        setErrorValidation(reason instanceof Error ? reason.message : 'No se pudo procesar el CV.')
      } finally {
        setIsProcessingCv(false)
      }
    }
  }

  const handleNextStep = () => {
    // Validación previa al avance de paso
    if (step === 0) {
      if (!formData.nombres.trim() || !formData.apellidos.trim()) {
        setErrorValidation('Por favor ingresa tus nombres y apellidos para continuar.')
        return
      }
    }
    setErrorValidation('')
    setStep((s) => Math.min(STEPS.length - 1, s + 1))
  }

  const handleSaveProfile = async () => {
    const nombreCompleto = `${formData.nombres.trim()} ${formData.apellidos.trim()}`

    try {
      await updateProfile({
        nombre: nombreCompleto,
        tituloProfesional: formData.puesto,
        resumenPerfil: formData.bio,
        adaptaciones: formData.adaptaciones,
        numConadis: formData.numConadis,
        cvNombreFile: formData.cvNombreFile,
        telefono: formData.telefono,
        departamento: formData.departamento,
      })
      if (cvFile && candidato?.access_token) {
        await subirCvCandidato(candidato.id, cvFile, candidato.access_token)
      }
      setIsSaved(true)
      setTimeout(() => router.push('/candidato'), 1500)
    } catch (reason: unknown) {
      setErrorValidation(reason instanceof Error ? reason.message : 'No se pudo actualizar el perfil.')
    }
  }

  const handleDeleteAccount = async () => {
    if (!window.confirm('¿Seguro que deseas eliminar tu cuenta? Esta acción no se puede deshacer.')) return
    try {
      await deleteAccount('candidato')
      router.push('/')
    } catch (reason: unknown) {
      setErrorValidation(reason instanceof Error ? reason.message : 'No se pudo eliminar la cuenta.')
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
          Completa tu perfil
        </h1>
        <p className="mt-1 text-muted-foreground">
          Un perfil completo mejora tus recomendaciones de empleo mediante IA.
        </p>
      </div>

      {/* Progress */}
      <div>
        <div className="mb-2 flex items-center justify-between text-sm font-semibold text-foreground">
          <span>
            Paso {step + 1} de {STEPS.length}: {STEPS[step]}
          </span>
          <span aria-hidden="true">{Math.round(progress)}%</span>
        </div>
        <div
          className="h-2.5 w-full overflow-hidden rounded-full bg-secondary"
          role="progressbar"
          aria-valuenow={Math.round(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Progreso del perfil"
        >
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Stepper */}
        <ol className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
          {STEPS.map((s, i) => (
            <li
              key={s}
              className="flex items-center gap-1.5 text-sm"
              aria-current={i === step ? 'step' : undefined}
            >
              <span
                className={cn(
                  'flex size-6 items-center justify-center rounded-full text-xs font-bold transition-colors',
                  i < step
                    ? 'bg-emerald-600 text-white'
                    : i === step
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-muted-foreground',
                )}
              >
                {i < step ? <Check className="size-3.5" aria-hidden="true" /> : i + 1}
              </span>
              <span
                className={cn(
                  'font-semibold',
                  i === step ? 'text-foreground' : 'text-muted-foreground',
                )}
              >
                {s}
              </span>
            </li>
          ))}
        </ol>
      </div>

      {errorValidation && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive font-medium">
          {errorValidation}
        </div>
      )}

      <Card>
        <CardContent className="p-6">
          {/* Step 0: Datos Personales */}
          {step === 0 && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Nombres" htmlFor="nombres" required>
                <Input
                  id="nombres"
                  value={formData.nombres}
                  onChange={(e) => handleInputChange('nombres', e.target.value)}
                  placeholder="María"
                />
              </Field>
              <Field label="Apellidos" htmlFor="apellidos" required>
                <Input
                  id="apellidos"
                  value={formData.apellidos}
                  onChange={(e) => handleInputChange('apellidos', e.target.value)}
                  placeholder="Rojas"
                />
              </Field>
              <Field label="Teléfono" htmlFor="tel">
                <Input
                  id="tel"
                  type="tel"
                  placeholder="+51 999 999 999"
                  value={formData.telefono}
                  onChange={(e) => handleInputChange('telefono', e.target.value)}
                />
              </Field>
              <Field label="Departamento" htmlFor="dep">
                <Select
                  id="dep"
                  value={formData.departamento}
                  onChange={(e) => handleInputChange('departamento', e.target.value)}
                >
                  <option value="Lima">Lima</option>
                  <option value="Arequipa">Arequipa</option>
                  <option value="Cusco">Cusco</option>
                  <option value="La Libertad">La Libertad</option>
                  <option value="Piura">Piura</option>
                </Select>
              </Field>
              <Field
                label="Sobre mí (Resumen Profesional para Match IA)"
                htmlFor="bio"
                className="sm:col-span-2"
                hint="Describe tus competencias. Este texto alimentará el modelo SBERT de compatibilidad."
              >
                <Textarea
                  id="bio"
                  rows={4}
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  placeholder="Profesional con experiencia en..."
                />
              </Field>
            </div>
          )}

          {/* Step 1: CV y experiencia */}
          {step === 1 && (
            <div className="flex flex-col gap-4">
              <div
                className={cn(
                  'flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-input bg-secondary/40 p-8 text-center transition-colors',
                  formData.cvNombreFile && 'border-emerald-500 bg-emerald-500/5',
                )}
              >
                {formData.cvNombreFile ? (
                  <>
                    <span className="flex size-12 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600">
                      <FileText className="size-6" aria-hidden="true" />
                    </span>
                    <p className="font-semibold text-foreground">{formData.cvNombreFile}</p>
                    <p className="flex items-center gap-1.5 text-sm font-medium text-emerald-600">
                      <Check className="size-4" aria-hidden="true" />
                      {isProcessingCv ? 'Analizando CV localmente...' : 'CV procesado; revisa los datos sugeridos'}
                    </p>
                    <label
                      htmlFor="cv-upload-input"
                      className="mt-2 text-xs text-primary underline cursor-pointer font-semibold"
                    >
                      Cambiar archivo
                    </label>
                  </>
                ) : (
                  <>
                    <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <UploadCloud className="size-6" aria-hidden="true" />
                    </span>
                    <p className="font-semibold text-foreground">Arrastra tu CV o selecciónalo</p>
                    <p className="text-sm text-muted-foreground">Formato PDF · Máx. 10 MB</p>
                    <label htmlFor="cv-upload-input">
                      <span className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-4 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground cursor-pointer mt-2">
                        Seleccionar archivo PDF
                      </span>
                    </label>
                  </>
                )}
                <input
                  id="cv-upload-input"
                  type="file"
                  accept=".pdf"
                  className="sr-only"
                  onChange={handleFileUpload}
                />
              </div>

              <div className="flex items-start gap-2 rounded-lg border border-accent/40 bg-accent/5 p-3">
                <Sparkles className="mt-0.5 size-5 shrink-0 text-accent-strong" aria-hidden="true" />
                <p className="text-sm leading-relaxed text-foreground">
                  <span className="font-semibold">Procesamiento de perfil:</span> al guardar, tu
                  resumen y CV alimentan los vectores de coincidencia con las ofertas laborales.
                </p>
              </div>

              <Field label="Puesto deseado" htmlFor="puesto">
                <Input
                  id="puesto"
                  placeholder="Ej. Desarrollador Frontend, Analista de Datos"
                  value={formData.puesto}
                  onChange={(e) => handleInputChange('puesto', e.target.value)}
                />
              </Field>
            </div>
          )}

          {/* Step 2: Accesibilidad */}
          {step === 2 && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <Accessibility className="size-5 text-accent-strong" aria-hidden="true" />
                <h2 className="font-display font-bold text-foreground">
                  Adaptaciones que necesitas
                </h2>
              </div>
              <p className="text-sm text-muted-foreground">
                Esta información es confidencial y solo se comparte con las empresas cuando
                postulas. Marca las que apliquen.
              </p>
              <fieldset className="grid gap-2 sm:grid-cols-2">
                <legend className="sr-only">Adaptaciones requeridas</legend>
                {ADAPTACIONES_OPCIONES.map((opt) => {
                  const isChecked = formData.adaptaciones.includes(opt)
                  return (
                    <label
                      key={opt}
                      className={cn(
                        'flex cursor-pointer items-center gap-2.5 rounded-lg border-2 border-input p-3 text-sm font-medium text-foreground hover:bg-muted transition-colors',
                        isChecked && 'border-primary bg-primary/5',
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleAdaptacionToggle(opt)}
                        className="size-4 accent-primary focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring"
                      />
                      {opt}
                    </label>
                  )
                })}
              </fieldset>

              <Field
                label="Número de carnet / registro CONADIS"
                htmlFor="conadis-tipo"
                hint="Ej. 01-2024-004928 (Opcional)"
              >
                <Input
                  id="conadis-tipo"
                  placeholder="01-2024-004928"
                  value={formData.numConadis}
                  onChange={(e) => handleInputChange('numConadis', e.target.value)}
                />
              </Field>
            </div>
          )}

          {/* Step 3: Revisión */}
          {step === 3 && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className="flex size-10 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600">
                  <Check className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <h2 className="font-display font-bold text-foreground">
                    ¡Todo listo para guardar!
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Revisa el resumen de tu perfil antes de finalizar.
                  </p>
                </div>
              </div>

              {isSaved && (
                <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-emerald-600 font-semibold text-sm">
                  <CheckCircle2 className="size-5" />
                  Perfil actualizado con éxito. Redirigiendo al panel...
                </div>
              )}

              <dl className="mt-2 divide-y divide-border rounded-lg border border-border">
                <SummaryRow
                  label="Nombre Completo"
                  value={`${formData.nombres} ${formData.apellidos}`}
                />
                <SummaryRow label="Ubicación" value={formData.departamento} />
                <SummaryRow label="Puesto Deseado" value={formData.puesto || 'No especificado'} />
                <SummaryRow
                  label="Archivo CV"
                  value={formData.cvNombreFile ? formData.cvNombreFile : 'Sin subir'}
                />
                <SummaryRow
                  label="Adaptaciones"
                  value={
                    formData.adaptaciones.length > 0
                      ? formData.adaptaciones.join(', ')
                      : 'Ninguna seleccionada'
                  }
                />
                <SummaryRow
                  label="N° CONADIS"
                  value={formData.numConadis ? formData.numConadis : 'No especificado'}
                />
              </dl>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Wizard controls */}
      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setErrorValidation('')
            setStep((s) => Math.max(0, s - 1))
          }}
          disabled={step === 0}
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
          Anterior
        </Button>
        {step < STEPS.length - 1 ? (
          <Button type="button" onClick={handleNextStep}>
            Siguiente
            <ChevronRight className="size-4" aria-hidden="true" />
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={handleDeleteAccount} disabled={isSaved}>
              <Trash2 className="size-4" aria-hidden="true" />
              Eliminar cuenta
            </Button>
            <Button
              type="button"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
              onClick={handleSaveProfile}
              disabled={isSaved}
            >
              <Check className="size-4" aria-hidden="true" />
              {isSaved ? 'Guardando...' : 'Guardar perfil'}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-sm font-semibold text-foreground text-right">{value}</dd>
    </div>
  )
}