"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { courses as demoCourses } from "@/lib/data"
import { inscribirseCurso, listarCursos, listarInscripciones, type CourseApi } from "@/lib/api"
import { useAuth } from "@/Backend/context/auth-context"
import { GraduationCap, Building2, Monitor, MapPin, Blend, CheckCircle2, Users } from "lucide-react"
import { cn } from "@/lib/utils"

const entities = ["Todas", "MTPE", "CONADIS", "SENATI"] as const
const modalities = ["Todas", "Virtual", "Presencial", "Semipresencial"] as const

export default function CursosPage() {
  const { candidato } = useAuth()
  const [entity, setEntity] = useState<(typeof entities)[number]>("Todas")
  const [modality, setModality] = useState<(typeof modalities)[number]>("Todas")
  const [courses, setCourses] = useState<CourseApi[]>(demoCourses.map((course) => ({ id: course.id, title: course.title, entity: course.entity, modality: course.modality, duration: course.duration, seats: course.seats, topic: course.topic })))
  const [enrolled, setEnrolled] = useState<string[]>([])

  useEffect(() => {
    listarCursos().then(setCourses).catch(() => undefined)
    if (candidato?.access_token) listarInscripciones(candidato.access_token).then(setEnrolled).catch(() => undefined)
  }, [candidato?.access_token])

  const filtered = courses.filter(
    (c) => (entity === "Todas" || c.entity === entity) && (modality === "Todas" || c.modality === modality),
  )

  async function toggleEnroll(id: string) {
    if (!candidato?.access_token) return
    try {
      await inscribirseCurso(id, candidato.access_token)
      setEnrolled((prev) => (prev.includes(id) ? prev : [...prev, id]))
    } catch {
      // The persisted state remains unchanged when the API rejects a duplicate enrollment.
    }
  }

  const modalityIcon = (m: string) => {
    if (m === "Virtual") return <Monitor className="size-4" aria-hidden="true" />
    if (m === "Presencial") return <MapPin className="size-4" aria-hidden="true" />
    return <Blend className="size-4" aria-hidden="true" />
  }

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm font-semibold text-primary">
          <GraduationCap className="size-5" aria-hidden="true" />
          Estado Peruano
        </div>
        <h1 className="mt-1 font-display text-2xl font-extrabold tracking-tight text-foreground text-balance sm:text-3xl">
          Cursos y Recursos de Capacitación
        </h1>
        <p className="mt-2 max-w-2xl leading-relaxed text-muted-foreground">
          Capacitaciones oficiales y gratuitas ofrecidas por entidades del Estado para fortalecer tu perfil profesional.
        </p>
      </div>

      {/* Filters */}
      <div className="mb-8 grid gap-6 rounded-xl border border-border bg-card p-5 md:grid-cols-2">
        <fieldset>
          <legend className="mb-2 flex items-center gap-2 text-sm font-bold text-foreground">
            <Building2 className="size-4 text-primary" aria-hidden="true" /> Entidad
          </legend>
          <div className="flex flex-wrap gap-2">
            {entities.map((e) => {
              const activeChip = entity === e
              return (
                <button
                  key={e}
                  type="button"
                  aria-pressed={activeChip}
                  onClick={() => setEntity(e)}
                  className={cn(
                    "rounded-full border-2 px-3 py-1 text-sm font-semibold transition-colors focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring",
                    activeChip
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-input bg-card text-foreground hover:bg-muted",
                  )}
                >
                  {e}
                </button>
              )
            })}
          </div>
        </fieldset>
        <fieldset>
          <legend className="mb-2 flex items-center gap-2 text-sm font-bold text-foreground">
            <Monitor className="size-4 text-primary" aria-hidden="true" /> Modalidad
          </legend>
          <div className="flex flex-wrap gap-2">
            {modalities.map((m) => {
              const activeChip = modality === m
              return (
                <button
                  key={m}
                  type="button"
                  aria-pressed={activeChip}
                  onClick={() => setModality(m)}
                  className={cn(
                    "rounded-full border-2 px-3 py-1 text-sm font-semibold transition-colors focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring",
                    activeChip
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-input bg-card text-foreground hover:bg-muted",
                  )}
                >
                  {m}
                </button>
              )
            })}
          </div>
        </fieldset>
      </div>

      <p className="mb-4 text-sm font-medium text-muted-foreground" role="status">
        {filtered.length} {filtered.length === 1 ? "curso disponible" : "cursos disponibles"}
      </p>

      <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((c) => {
          const isEnrolled = enrolled.includes(c.id)
          return (
            <li key={c.id}>
              <Card className="flex h-full flex-col">
                <CardContent className="flex flex-1 flex-col p-5">
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="default">{c.entity}</Badge>
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                      {modalityIcon(c.modality)}
                      {c.modality}
                    </span>
                  </div>
                  <h2 className="mt-3 font-display text-lg font-bold leading-snug text-foreground text-balance">
                    {c.title}
                  </h2>
                  <p className="mt-2 text-sm text-muted-foreground">Área: {c.topic}</p>
                  <dl className="mt-4 flex-1 space-y-0 border-t border-border pt-4 text-sm">
                    <div className="flex items-center justify-between gap-2 py-1">
                      <dt className="text-muted-foreground">Duración</dt>
                      <dd className="font-semibold text-foreground">{c.duration}</dd>
                    </div>
                    <div className="flex items-center justify-between gap-2 py-1">
                      <dt className="text-muted-foreground">Costo</dt>
                      <dd className="font-semibold text-success">Gratuito</dd>
                    </div>
                    <div className="flex items-center justify-between gap-2 py-1">
                      <dt className="flex items-center gap-1.5 text-muted-foreground">
                        <Users className="size-4" aria-hidden="true" />
                        Cupos
                      </dt>
                      <dd className="font-semibold text-foreground">{c.seats}</dd>
                    </div>
                  </dl>
                  <Button
                    className="mt-4 w-full"
                    variant={isEnrolled ? "success" : "default"}
                    onClick={() => toggleEnroll(c.id)}
                    aria-pressed={isEnrolled}
                  >
                    {isEnrolled ? (
                      <>
                        <CheckCircle2 className="size-4" aria-hidden="true" /> Inscrito
                      </>
                    ) : (
                      "Inscribirme"
                    )}
                  </Button>
                </CardContent>
              </Card>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
