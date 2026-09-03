'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowRight, BookOpen, FileText, Filter, Lightbulb, Loader2 } from 'lucide-react'
import { JobCard } from '@/components/job-card'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { jobs } from '@/lib/data'
import { cn } from '@/lib/utils'
import { listarOfertas, obtenerMatchIA } from '@/lib/api'
import { useAuth } from '@/Backend/context/auth-context'

const CHIPS = [
  'Todos',
  'Remoto',
  'Jornada flexible',
  'Accesibilidad física',
  'Intérprete LSP',
]

const PERFIL_FALLBACK =
  'Desarrolladora Frontend especializada en React, TypeScript y accesibilidad web WCAG. Experiencia en proyectos inclusivos, buscando vacantes con modalidad remota o jornada flexible.'

interface MatchData {
  match_percentage: number
  nivel: string
  metrica: string
  detalles: { procesado: boolean; vector_dim: number }
}

export default function CandidatoDashboard() {
  const { candidato } = useAuth()
  const [active, setActive] = useState('Todos')
  const [loadingIA, setLoadingIA] = useState(false)
  const [matches, setMatches] = useState<Record<string, MatchData>>({})
  const [availableJobs, setAvailableJobs] = useState(jobs)

  useEffect(() => {
    let active = true
    listarOfertas()
      .then((publishedJobs) => {
        if (active && publishedJobs.length > 0) setAvailableJobs(publishedJobs)
      })
      .catch(() => {
        // El catálogo demo permite seguir usando la pantalla si la API está apagada.
      })
    return () => {
      active = false
    }
  }, [])

  // Nombre y perfil dinámicos desde el estado global de autenticación
  const nombreUsuario = candidato?.nombre?.split(' ')[0] || 'María'
  const perfilActivo = candidato
    ? [
        candidato.tituloProfesional,
        candidato.resumenPerfil,
        candidato.habilidades?.length ? `Habilidades: ${candidato.habilidades.join(', ')}` : '',
        candidato.adaptaciones?.length ? `Adaptaciones: ${candidato.adaptaciones.join(', ')}` : '',
      ]
        .filter(Boolean)
        .join('. ')
    : PERFIL_FALLBACK

  // Filtrado dinámico por modalidad o etiquetas de accesibilidad
  const filtered =
    active === 'Todos'
      ? availableJobs
      : availableJobs.filter(
          (j) =>
            j.modality === active ||
            j.adaptations.some((a) => a.toLowerCase().includes(active.split(' ')[0].toLowerCase())),
        )

  // Actualiza las coincidencias automáticamente según el perfil y las ofertas disponibles.
  useEffect(() => {
    let active = true

    if (availableJobs.length === 0) {
      setMatches({})
      setLoadingIA(false)
      return () => {
        active = false
      }
    }

    const ejecutarAnalisisIA = async () => {
    setLoadingIA(true)
    try {
      const resultados = await Promise.all(
        availableJobs.map(async (job) => {
          const descripcion = `${job.title} en ${job.company}. Modalidad: ${job.modality}. Adaptaciones: ${job.adaptations.join(', ')}`
          const res = await obtenerMatchIA(perfilActivo, descripcion)
          return { id: job.id, res }
        }),
      )

      const nuevosMatches: Record<string, MatchData> = {}
      resultados.forEach(({ id, res }) => {
        if (res) nuevosMatches[id] = res
      })

      if (active) setMatches(nuevosMatches)
    } catch (error) {
      console.error('Error procesando compatibilidad IA:', error)
    } finally {
      if (active) setLoadingIA(false)
    }
    }

    ejecutarAnalisisIA()
    return () => {
      active = false
    }
  }, [availableJobs, perfilActivo])

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Encabezado Principal */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            Hola, {nombreUsuario}
          </h1>
          <p className="mt-1 text-muted-foreground">
            Estos son los empleos que mejor se ajustan a tu perfil y necesidades de accesibilidad.
          </p>
        </div>

        <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground" role="status" aria-live="polite">
          {loadingIA && <Loader2 className="size-4 animate-spin text-primary" aria-hidden="true" />}
          {loadingIA ? 'Actualizando recomendaciones...' : 'Recomendaciones actualizadas'}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Columna Principal: Lista de Empleos */}
        <div>
          {/* Barra de Filtros Inclusivos */}
          <div
            role="group"
            aria-label="Filtros inclusivos"
            className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card p-3 shadow-sm"
          >
            <span className="flex items-center gap-1.5 text-sm font-bold text-foreground">
              <Filter className="size-4 text-primary" aria-hidden="true" />
              Filtros:
            </span>
            {CHIPS.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => setActive(chip)}
                aria-pressed={active === chip}
                className={cn(
                  'rounded-full border-2 px-3 py-1 text-sm font-semibold transition-colors focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring',
                  active === chip
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-input bg-card text-foreground hover:bg-muted',
                )}
              >
                {chip}
              </button>
            ))}
          </div>

          <p className="mb-3 text-sm text-muted-foreground" role="status">
            {filtered.length} {filtered.length === 1 ? 'empleo encontrado' : 'empleos encontrados'}
          </p>

          {/* Listado de Ofertas */}
          <ul className="flex flex-col gap-4">
            {filtered.map((job) => (
              <li key={job.id}>
                <JobCard
                  job={job}
                  perfilCandidato={perfilActivo}
                  matchData={matches[job.id]}
                />
              </li>
            ))}
          </ul>
        </div>

        {/* Columna Lateral: Recursos y Estado de Perfil */}
        <aside className="flex flex-col gap-4" aria-label="Recursos educativos y estado">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <BookOpen className="size-5 text-accent-strong" aria-hidden="true" />
                Recursos educativos
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <ResourceLink title="Habilidades Digitales" meta="MTPE · Virtual · Gratis" />
              <ResourceLink title="Lengua de Señas Nivel 1" meta="CONADIS · Virtual · Gratis" />
              <ResourceLink title="Ofimática Certificada" meta="MTPE · Virtual · Gratis" />
              <Link
                href="/candidato/cursos"
                className="inline-flex items-center gap-1 text-sm font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                Ver todos los cursos
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </CardContent>
          </Card>

          <Card className="border-accent/40 bg-accent/5">
            <CardContent className="flex gap-3 p-5">
              <Lightbulb className="size-5 shrink-0 text-accent-strong" aria-hidden="true" />
              <div>
                <h2 className="font-display text-sm font-bold text-foreground">
                  Completa tu perfil
                </h2>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {candidato?.cvNombreFile
                    ? `CV registrado: ${candidato.cvNombreFile}. Mantenlo actualizado para obtener mejores recomendaciones.`
                    : 'Tu perfil está incompleto. Sube tu CV para recibir mejores recomendaciones.'}
                </p>
                <Link
                  href="/candidato/perfil"
                  className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  <FileText className="size-4" aria-hidden="true" />
                  {candidato?.cvNombreFile ? 'Editar perfil' : 'Completar perfil'}
                </Link>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  )
}

function ResourceLink({ title, meta }: { title: string; meta: string }) {
  return (
    <Link
      href="/candidato/cursos"
      className="flex flex-col gap-0.5 rounded-lg border border-border p-3 transition-colors hover:border-primary hover:bg-muted focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      <span className="text-sm font-semibold text-foreground">{title}</span>
      <span className="text-xs text-muted-foreground">{meta}</span>
    </Link>
  )
}