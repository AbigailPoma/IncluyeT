'use client'

import type React from 'react'
import { useState } from 'react'
import {
  Accessibility,
  Briefcase,
  Building2,
  CheckCircle2,
  Eye,
  Info,
  Loader2,
  MapPin,
  Plus,
  Send,
  Sparkles,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, Input, Select, Textarea } from '@/components/ui/field'
import { crearOferta } from '@/lib/api'
import { useAuth } from '@/Backend/context/auth-context'

const ADAPTACIONES_INICIALES = [
  'Trabajo remoto / teletrabajo',
  'Jornada laboral flexible',
  'Accesibilidad física (rampas, ascensor)',
  'Baño adaptado en las instalaciones',
  'Intérprete de lengua de señas peruana',
  'Software y documentos accesibles (lector de pantalla)',
  'Pausas activas y descansos adicionales',
  'Mobiliario ergonómico adaptado',
]

export default function OfertaTrabajo() {
  const { empresa } = useAuth()
  // Estado dinámico de los campos del formulario
  const [formData, setFormData] = useState({
    titulo: '',
    modalidad: 'Remoto',
    ubicacion: 'Lima, Perú',
    experiencia: '1-2 años',
    salario: '',
    funciones: '',
  })

  // Lista dinámica de adaptaciones de accesibilidad
  const [adaptaciones, setAdaptaciones] = useState<string[]>(ADAPTACIONES_INICIALES)
  const [seleccionadas, setSeleccionadas] = useState<string[]>([
    ADAPTACIONES_INICIALES[0],
    ADAPTACIONES_INICIALES[1],
  ])
  const [nuevaAdaptacion, setNuevaAdaptacion] = useState('')

  // Estados de interacción
  const [loading, setLoading] = useState(false)
  const [published, setPublished] = useState(false)
  const [mostrarVistaPrevia, setMostrarVistaPrevia] = useState(false)
  const [error, setError] = useState('')

  // Manejador genérico para actualizar inputs
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  // Alternar selección de checkbox
  const toggleAdaptacion = (item: string) => {
    setSeleccionadas((prev) =>
      prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item]
    )
  }

  // Agregar nueva adecuación personalizada
  const handleAgregarPersonalizada = (e: React.FormEvent) => {
    e.preventDefault()
    const texto = nuevaAdaptacion.trim()
    if (!texto) return

    if (!adaptaciones.includes(texto)) {
      setAdaptaciones((prev) => [...prev, texto])
    }
    if (!seleccionadas.includes(texto)) {
      setSeleccionadas((prev) => [...prev, texto])
    }
    setNuevaAdaptacion('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setPublished(false)
    setError('')

    try {
      if (!empresa?.access_token) {
        throw new Error('Tu sesión no permite publicar. Vuelve a iniciar sesión.')
      }
      await crearOferta(empresa.access_token, {
        ...formData,
        modalidad: formData.modalidad as 'Remoto' | 'Híbrido' | 'Presencial',
        adaptaciones: seleccionadas,
      })
      setPublished(true)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : 'No se pudo publicar la oferta.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header con botón de Vista Previa */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary"
          >
            <Briefcase className="size-6" />
          </span>
          <div>
            <h1 className="font-display text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
              Publicar oferta de empleo
            </h1>
            <p className="text-muted-foreground text-sm">
              Detalla el puesto y las adecuaciones de accesibilidad.
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={() => setMostrarVistaPrevia(!mostrarVistaPrevia)}
          className="gap-2 shrink-0 font-semibold"
        >
          <Eye className="size-4 text-primary" />
          {mostrarVistaPrevia ? 'Ocultar vista previa' : 'Vista previa del candidato'}
        </Button>
      </div>

      {/* Alerta de Éxito */}
      {published && (
        <div
          role="status"
          className="flex items-start gap-3 rounded-xl border-2 border-emerald-500/40 bg-emerald-500/10 p-4"
        >
          <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600" aria-hidden="true" />
          <div className="space-y-1">
            <p className="font-semibold text-foreground">¡Oferta publicada exitosamente!</p>
            <p className="text-sm text-muted-foreground">
              Tu vacante para <strong className="text-foreground">{formData.titulo || 'el puesto'}</strong> ya está activa y lista para ser evaluada dinámicamente mediante el motor de IA.
            </p>
          </div>
        </div>
      )}

      {error && (
        <div role="alert" className="rounded-xl border-2 border-destructive/40 bg-destructive/10 p-4 text-sm font-medium text-destructive">
          {error}
        </div>
      )}

      {/* Tarjeta Dinámica de Vista Previa */}
      {mostrarVistaPrevia && (
        <Card className="border-2 border-primary/30 bg-muted/20">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2 text-primary">
              <Sparkles className="size-4" />
              Vista Previa: Así se verá tu publicación para los postulantes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-lg text-foreground">
                  {formData.titulo || 'Título del Puesto (Sin especificar)'}
                </h3>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                  <span className="flex items-center gap-1 font-semibold text-foreground">
                    <Building2 className="size-3.5 text-primary" />
                    Tech Perú S.A.
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="size-3.5" />
                    {formData.ubicacion || 'Lima'}
                  </span>
                  <Badge variant="outline">{formData.modalidad}</Badge>
                  {formData.salario && <Badge variant="default">S/ {formData.salario}</Badge>}
                </div>
              </div>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
              {formData.funciones || 'Aquí se mostrarán las funciones principales ingresadas...'}
            </p>

            <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-border">
              <span className="text-xs font-semibold text-muted-foreground">Adecuaciones ofrecidas:</span>
              {seleccionadas.length > 0 ? (
                seleccionadas.map((a) => (
                  <Badge key={a} variant="accent" className="text-xs">
                    <Accessibility className="size-3 mr-1" />
                    {a}
                  </Badge>
                ))
              ) : (
                <span className="text-xs text-muted-foreground italic">Ninguna adecuación elegida</span>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Formulario Principal */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Información del puesto</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Field label="Título del puesto" htmlFor="titulo" required className="sm:col-span-2">
              <Input
                id="titulo"
                value={formData.titulo}
                onChange={handleChange}
                placeholder="Ej. Analista de Datos Junior"
                required
              />
            </Field>

            <Field label="Modalidad" htmlFor="modalidad" required>
              <Select id="modalidad" value={formData.modalidad} onChange={handleChange}>
                <option value="Remoto">Remoto</option>
                <option value="Híbrido">Híbrido</option>
                <option value="Presencial">Presencial</option>
              </Select>
            </Field>

            <Field label="Ubicación" htmlFor="ubicacion">
              <Input
                id="ubicacion"
                value={formData.ubicacion}
                onChange={handleChange}
                placeholder="Lima, Perú"
              />
            </Field>

            <Field label="Experiencia requerida" htmlFor="experiencia">
              <Select id="experiencia" value={formData.experiencia} onChange={handleChange}>
                <option value="Sin experiencia">Sin experiencia</option>
                <option value="1-2 años">1-2 años</option>
                <option value="3-5 años">3-5 años</option>
                <option value="Más de 5 años">Más de 5 años</option>
              </Select>
            </Field>

            <Field label="Rango salarial (S/)" htmlFor="salario" hint="Mensual, en soles">
              <Input
                id="salario"
                value={formData.salario}
                onChange={handleChange}
                placeholder="2,800 - 3,500"
                inputMode="numeric"
              />
            </Field>

            <Field label="Funciones principales" htmlFor="funciones" required className="sm:col-span-2">
              <Textarea
                id="funciones"
                value={formData.funciones}
                onChange={handleChange}
                rows={4}
                placeholder="Describe las responsabilidades del puesto y tecnologías clave (Python, SQL, PowerBI...)"
                required
              />
            </Field>
          </CardContent>
        </Card>

        {/* Sección de Adecuaciones Accesibles Dinámicas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Accessibility className="size-5 text-accent-strong" aria-hidden="true" />
              Adecuaciones de accesibilidad del puesto
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-start gap-2 rounded-lg border border-accent/40 bg-accent/5 p-3">
              <Info className="mt-0.5 size-5 shrink-0 text-accent-strong" aria-hidden="true" />
              <p className="text-sm leading-relaxed text-foreground">
                Marca las adecuaciones que ofrece la posición o añade nuevas etiquetas personalizadas.
              </p>
            </div>

            <fieldset className="grid gap-2 sm:grid-cols-2">
              <legend className="sr-only">Adecuaciones de accesibilidad disponibles</legend>
              {adaptaciones.map((a) => {
                const isChecked = seleccionadas.includes(a)
                return (
                  <label
                    key={a}
                    className={`flex cursor-pointer items-start gap-2.5 rounded-lg border-2 p-3 text-sm font-medium transition-colors ${
                      isChecked
                        ? 'border-accent bg-accent/10 text-foreground'
                        : 'border-input hover:bg-muted text-muted-foreground'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleAdaptacion(a)}
                      className="mt-0.5 size-4 accent-accent focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring"
                    />
                    <span>{a}</span>
                  </label>
                )
              })}
            </fieldset>

            {/* Input Dinámico para Agregar Nueva Adecuación */}
            <div className="pt-2 flex items-center gap-2">
              <Input
                placeholder="Agregar otra adecuación específica..."
                value={nuevaAdaptacion}
                onChange={(e) => setNuevaAdaptacion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAgregarPersonalizada(e)
                }}
                className="text-sm"
              />
              <Button
                type="button"
                variant="secondary"
                onClick={handleAgregarPersonalizada}
                disabled={!nuevaAdaptacion.trim()}
                className="gap-1.5 shrink-0"
              >
                <Plus className="size-4" />
                Añadir
              </Button>
            </div>

            <p className="text-sm text-muted-foreground" role="status">
              {seleccionadas.length}{' '}
              {seleccionadas.length === 1 ? 'adecuación seleccionada' : 'adecuaciones seleccionadas'}
            </p>
          </CardContent>
        </Card>

        {/* Acciones del Formulario */}
        <div className="flex flex-wrap justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setFormData({
                titulo: '',
                modalidad: 'Remoto',
                ubicacion: 'Lima, Perú',
                experiencia: '1-2 años',
                salario: '',
                funciones: '',
              })
              setSeleccionadas([])
            }}
          >
            Limpiar borrador
          </Button>

          <Button type="submit" disabled={loading} className="gap-2 font-semibold">
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Publicando...
              </>
            ) : (
              <>
                <Send className="size-4" aria-hidden="true" />
                Publicar oferta
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}