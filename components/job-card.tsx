'use client'

import { useState, useEffect } from 'react'
import {
  Accessibility,
  Banknote,
  Brain,
  Building2,
  Clock,
  Cpu,
  MapPin,
  Sparkles,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import type { Job } from '@/lib/data'
import { obtenerMatchIA } from '@/lib/api'

export interface MatchResult {
  match_percentage: number
  nivel: string
  metrica: string
  detalles: {
    procesado: boolean
    vector_dim: number
  }
}

interface JobCardProps {
  job: Job
  perfilCandidato?: string
  matchData?: MatchResult
}

export function JobCard({ job, perfilCandidato, matchData: propMatchData }: JobCardProps) {
  const [loading, setLoading] = useState(false)
  const [localMatchData, setLocalMatchData] = useState<MatchResult | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  // Prioriza los datos recibidos por prop (procesamiento masivo) sobre los locales
  const currentMatch = propMatchData || localMatchData

  // Abre automáticamente los detalles cuando el cálculo global termine
  useEffect(() => {
    if (propMatchData) {
      setShowDetails(true)
    }
  }, [propMatchData])

  const handleCalcularMatch = async () => {
    if (currentMatch) {
      setShowDetails(!showDetails)
      return
    }

    setLoading(true)
    const perfil =
      perfilCandidato ||
      'Desarrollador con experiencia en desarrollo web frontend, accesibilidad web, React, TypeScript y adaptación laboral.'
    const descripcionOferta = `${job.title} en ${job.company}. Modalidad: ${job.modality}. Adaptaciones: ${job.adaptations.join(', ')}`
    
    const res = await obtenerMatchIA(perfil, descripcionOferta)

    if (res) {
      setLocalMatchData(res)
      setShowDetails(true)
    }
    setLoading(false)
  }

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span
            aria-hidden="true"
            className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"
          >
            <Building2 className="size-5" />
          </span>
          <div>
            <h3 className="font-display text-base font-bold text-foreground text-pretty">
              {job.title}
            </h3>
            <p className="text-sm text-muted-foreground">{job.company}</p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1.5">
          <Badge variant={job.modality === 'Remoto' ? 'success' : 'muted'}>
            {job.modality}
          </Badge>

          {/* Badge dinámico del porcentaje de Match generado por IA */}
          {currentMatch && (
            <Badge
              variant="outline"
              className={`font-semibold border text-xs px-2 py-0.5 ${
                currentMatch.match_percentage >= 75
                  ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                  : currentMatch.match_percentage >= 50
                  ? 'bg-amber-500/10 text-amber-600 border-amber-500/30'
                  : 'bg-rose-500/10 text-rose-600 border-rose-500/30'
              }`}
            >
              {currentMatch.match_percentage}% Match
            </Badge>
          )}
        </div>
      </div>

      <dl className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <dt className="sr-only">Ubicación</dt>
          <MapPin className="size-4" aria-hidden="true" />
          <dd>{job.location}</dd>
        </div>
        <div className="flex items-center gap-1.5">
          <dt className="sr-only">Salario</dt>
          <Banknote className="size-4" aria-hidden="true" />
          <dd>{job.salary}</dd>
        </div>
        <div className="flex items-center gap-1.5">
          <dt className="sr-only">Publicado</dt>
          <Clock className="size-4" aria-hidden="true" />
          <dd>{job.posted}</dd>
        </div>
      </dl>

      <div className="mt-4">
        <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-foreground">
          <Accessibility className="size-4 text-accent-strong" aria-hidden="true" />
          Adaptaciones del puesto
        </p>
        <ul className="flex flex-wrap gap-1.5">
          {job.adaptations.map((a) => (
            <li key={a}>
              <Badge variant="accent">{a}</Badge>
            </li>
          ))}
        </ul>
      </div>

      {/* Sección del motor de IA / Deep Learning */}
      <div className="mt-4 pt-3 border-t border-border/60">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleCalcularMatch}
          disabled={loading}
          className="w-full justify-center gap-2 text-xs text-primary hover:text-primary hover:bg-primary/5"
        >
          <Sparkles className="size-3.5 text-primary" />
          {loading
            ? 'Analizando vectores...'
            : currentMatch
            ? (showDetails ? 'Ocultar evidencia IA' : 'Ver evidencia IA')
            : 'Calcular compatibilidad IA'}
        </Button>

        {/* Panel de evidencia técnica */}
        {showDetails && currentMatch && (
          <div className="mt-3 p-3 rounded-lg bg-secondary/50 border border-border text-xs space-y-2">
            <div className="flex items-center justify-between font-semibold text-foreground">
              <span className="flex items-center gap-1.5">
                <Brain className="size-4 text-primary" />
                Inferencia Deep Learning
              </span>
              <span className="text-[11px] text-muted-foreground">{currentMatch.metrica}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-muted-foreground pt-1">
              <div>
                <span className="block font-medium text-foreground">Ajuste:</span>
                <span className="capitalize">{currentMatch.nivel}</span>
              </div>
              <div>
                <span className="block font-medium text-foreground">Dimensión Vectorial:</span>
                <span>{currentMatch.detalles.vector_dim}D (SBERT)</span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground pt-1 border-t border-border/40">
              <Cpu className="size-3" />
              <span>Ejecutado dinámicamente con FastAPI y Transformer Embeddings</span>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 flex gap-2">
        <Button className="flex-1">Postular ahora</Button>
        <Button variant="outline">Guardar</Button>
      </div>
    </Card>
  )
}