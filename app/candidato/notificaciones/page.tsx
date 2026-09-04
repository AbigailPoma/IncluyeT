'use client'

import { useEffect, useState } from 'react'
import {
  Briefcase,
  CheckCircle2,
  MessageSquare,
  Sparkles,
  XCircle,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { listarNotificaciones, marcarNotificacionesLeidas } from '@/lib/api'
import { useAuth } from '@/Backend/context/auth-context'

type NotifType = 'aceptada' | 'rechazada' | 'mensaje' | 'oferta'

type Notif = {
  id: string | number
  type: NotifType
  title: string
  body: string
  time: string
  unread: boolean
}

const ICONS: Record<
  NotifType,
  { icon: React.ComponentType<{ className?: string }>; className: string; label: string }
> = {
  aceptada: {
    icon: CheckCircle2,
    className: 'bg-success/12 text-success',
    label: 'Postulación aceptada',
  },
  rechazada: {
    icon: XCircle,
    className: 'bg-destructive/10 text-destructive',
    label: 'Postulación no seleccionada',
  },
  mensaje: {
    icon: MessageSquare,
    className: 'bg-primary/10 text-primary',
    label: 'Mensaje de empresa',
  },
  oferta: {
    icon: Sparkles,
      className: 'bg-accent/12 text-accent-strong',
    label: 'Oferta recomendada',
  },
}

const INITIAL: Notif[] = [
  {
    id: 1,
    type: 'aceptada',
    title: 'Tech Perú avanzó tu postulación',
    body: 'Pasaste a la etapa de entrevista para Analista de Datos Junior.',
    time: 'Hace 1 hora',
    unread: true,
  },
  {
    id: 2,
    type: 'mensaje',
    title: 'Banco Andino te envió un mensaje',
    body: '“Hola María, quisiéramos coordinar una entrevista virtual con intérprete LSP.”',
    time: 'Hace 3 horas',
    unread: true,
  },
  {
    id: 3,
    type: 'oferta',
    title: 'Nueva oferta que encaja contigo',
    body: 'Diseñador/a UX en Retail Sur · Remoto · con adaptaciones.',
    time: 'Hace 6 horas',
    unread: true,
  },
  {
    id: 4,
    type: 'rechazada',
    title: 'Salud Total cerró su proceso',
    body: 'Esta vez no fuiste seleccionada, pero tu perfil quedó guardado.',
    time: 'Ayer',
    unread: false,
  },
]

export default function CandidatoNotificaciones() {
  const { candidato } = useAuth()
  const [items, setItems] = useState(INITIAL)
  useEffect(() => {
    if (!candidato?.access_token) return
    listarNotificaciones(candidato.access_token).then((notifications) => setItems(notifications.map((item) => ({ id: item.id, type: (item.tipo === 'estado' ? 'aceptada' : 'mensaje') as NotifType, title: item.titulo, body: item.cuerpo, time: new Date(item.created_at).toLocaleString('es-PE'), unread: !item.leida })))).catch(() => undefined)
  }, [candidato?.access_token])
  const unreadCount = items.filter((i) => i.unread).length

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            Notificaciones
          </h1>
          <p className="mt-1 flex items-center gap-2 text-muted-foreground">
            Tienes
            <Badge variant="default">{unreadCount} sin leer</Badge>
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={async () => {
            if (candidato?.access_token) await marcarNotificacionesLeidas(candidato.access_token)
            setItems((prev) => prev.map((i) => ({ ...i, unread: false })))
          }}
        >
          Marcar todas como leídas
        </Button>
      </div>

      <ul className="flex flex-col gap-3">
        {items.map((n) => {
          const meta = ICONS[n.type]
          const Icon = meta.icon
          return (
            <li key={n.id}>
              <Card
                className={cn(
                  'flex gap-3 p-4',
                  n.unread && 'border-l-4 border-l-primary',
                )}
              >
                <span
                  className={cn(
                    'flex size-11 shrink-0 items-center justify-center rounded-full',
                    meta.className,
                  )}
                >
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-foreground text-pretty">
                      {n.title}
                    </p>
                    {n.unread && (
                      <span
                        className="mt-1.5 size-2.5 shrink-0 rounded-full bg-primary"
                        aria-label="Sin leer"
                      />
                    )}
                  </div>
                  <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">
                    {n.body}
                  </p>
                  <div className="mt-2 flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">
                      {n.time}
                    </span>
                    {(n.type === 'aceptada' || n.type === 'oferta') && (
                      <Button variant="link" size="sm" className="h-auto px-0">
                        <Briefcase className="size-4" aria-hidden="true" />
                        Ver detalle
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
