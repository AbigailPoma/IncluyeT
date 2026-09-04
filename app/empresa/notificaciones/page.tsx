"use client"

import { useEffect, useState } from "react"
import { CheckCircle2, Eye, FileText, Star, UserPlus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { listarNotificaciones, marcarNotificacionesLeidas } from "@/lib/api"
import { useAuth } from "@/Backend/context/auth-context"

type NotifType = "postulacion" | "match" | "vista" | "cierre"

const META: Record<
  NotifType,
  { icon: React.ComponentType<{ className?: string }>; className: string }
> = {
  postulacion: { icon: UserPlus, className: "bg-primary/10 text-primary" },
  match: { icon: Star, className: "bg-accent/12 text-accent-strong" },
  vista: { icon: Eye, className: "bg-secondary text-foreground" },
  cierre: { icon: CheckCircle2, className: "bg-success/12 text-success" },
}

const INITIAL = [
  {
    id: 1,
    type: "postulacion" as NotifType,
    title: "Nueva postulación: Analista de Datos Junior",
    body: "Carlos Mendoza postuló a tu oferta. Coincidencia del 95% con adaptaciones compatibles.",
    time: "Hace 20 min",
    unread: true,
  },
  {
    id: 2,
    type: "match" as NotifType,
    title: "Candidato recomendado disponible",
    body: "Lucía Fernández encaja con tu vacante de Diseñador/a UX (91% de coincidencia).",
    time: "Hace 2 horas",
    unread: true,
  },
  {
    id: 3,
    type: "postulacion" as NotifType,
    title: "Nueva postulación: Asistente Administrativo",
    body: "Diego Ramírez postuló a tu oferta y requiere accesibilidad física.",
    time: "Ayer",
    unread: true,
  },
  {
    id: 4,
    type: "vista" as NotifType,
    title: "Tu perfil de empresa recibió 12 visitas",
    body: "Más candidatos están conociendo tu cultura inclusiva.",
    time: "Ayer",
    unread: false,
  },
]

type NotificationItem = {
  id: string | number
  type: NotifType
  title: string
  body: string
  time: string
  unread: boolean
}

export default function EmpresaNotificaciones() {
  const { empresa } = useAuth()
  const [items, setItems] = useState<NotificationItem[]>(INITIAL)
  useEffect(() => {
    if (!empresa?.access_token) return
    listarNotificaciones(empresa.access_token).then((notifications) => setItems(notifications.map((item) => ({ id: item.id, type: (item.tipo === 'postulacion' ? 'postulacion' : 'match') as NotifType, title: item.titulo, body: item.cuerpo, time: new Date(item.created_at).toLocaleString('es-PE'), unread: !item.leida })))).catch(() => undefined)
  }, [empresa?.access_token])
  const unread = items.filter((i) => i.unread).length

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            Notificaciones
          </h1>
          <p className="mt-1 flex items-center gap-2 text-muted-foreground">
            Actividad en tiempo real
            <Badge variant="default">{unread} sin leer</Badge>
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={async () => {
            if (empresa?.access_token) await marcarNotificacionesLeidas(empresa.access_token)
            setItems((prev) => prev.map((i) => ({ ...i, unread: false })))
          }}
        >
          Marcar todas como leídas
        </Button>
      </div>

      <ul className="flex flex-col gap-3">
        {items.map((n) => {
          const meta = META[n.type]
          const Icon = meta.icon
          return (
            <li key={n.id}>
              <Card className={cn("flex gap-3 p-4", n.unread && "border-l-4 border-l-primary")}>
                <span
                  className={cn(
                    "flex size-11 shrink-0 items-center justify-center rounded-full",
                    meta.className,
                  )}
                  aria-hidden="true"
                >
                  <Icon className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-foreground text-pretty">{n.title}</p>
                    {n.unread && (
                      <span className="mt-1.5 size-2.5 shrink-0 rounded-full bg-primary" aria-label="Sin leer" />
                    )}
                  </div>
                  <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">{n.body}</p>
                  <div className="mt-2 flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">{n.time}</span>
                    {(n.type === "postulacion" || n.type === "match") && (
                      <Button variant="link" size="sm" className="h-auto px-0">
                        <FileText className="size-4" aria-hidden="true" />
                        Revisar perfil
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
