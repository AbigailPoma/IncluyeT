'use client'

import Link from 'next/link'
import { ArrowRight, Bell, BriefcaseBusiness, Building2, FilePlus2, Users } from 'lucide-react'
import { useAuth } from '@/Backend/context/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { listarMisOfertas } from '@/lib/api'
import type { OfertaApi } from '@/lib/api'
import { useEffect, useState } from 'react'

export default function EmpresaDashboard() {
  const { empresa } = useAuth()
  const [ofertas, setOfertas] = useState<OfertaApi[]>([])

  useEffect(() => {
    if (!empresa?.access_token) return
    listarMisOfertas(empresa.access_token).then(setOfertas).catch(() => setOfertas([]))
  }, [empresa?.access_token])

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <p className="text-sm font-semibold text-primary">Panel empresarial</p>
        <h1 className="mt-1 font-display text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
          Bienvenida, {empresa?.razon_social || 'tu empresa'}
        </h1>
        <p className="mt-1 text-muted-foreground">
          Gestiona tus ofertas y fortalece tu propuesta de inclusión laboral.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryCard icon={BriefcaseBusiness} label="Ofertas activas" value={String(ofertas.filter((oferta) => oferta).length)} />
        <SummaryCard icon={Users} label="Postulaciones recibidas" value="0" />
        <SummaryCard icon={Bell} label="Notificaciones nuevas" value="0" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <BriefcaseBusiness className="size-5 text-primary" aria-hidden="true" />
            Tus ofertas de empleo
          </CardTitle>
        </CardHeader>
        <CardContent>
          {ofertas.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aún no tienes ofertas publicadas.</p>
          ) : (
            <div className="divide-y divide-border">
              {ofertas.map((oferta) => (
                <div key={oferta.id} className="flex flex-col gap-2 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="font-semibold text-foreground">{oferta.title}</h2>
                    <p className="text-sm text-muted-foreground">{oferta.location || 'Ubicación no especificada'} · {oferta.modality}</p>
                  </div>
                  <span className="text-sm font-medium text-emerald-600">Publicada</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Building2 className="size-5 text-primary" aria-hidden="true" />
            Próximos pasos
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <Link href="/empresa/oferta" className="group rounded-lg border border-border p-4 transition-colors hover:border-primary hover:bg-primary/5">
            <FilePlus2 className="size-5 text-primary" aria-hidden="true" />
            <h2 className="mt-3 font-semibold text-foreground">Publica tu primera oferta</h2>
            <p className="mt-1 text-sm text-muted-foreground">Describe el puesto y las adaptaciones disponibles.</p>
            <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary">
              Publicar oferta <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </span>
          </Link>
          <Link href="/empresa/perfil" className="group rounded-lg border border-border p-4 transition-colors hover:border-primary hover:bg-primary/5">
            <Building2 className="size-5 text-primary" aria-hidden="true" />
            <h2 className="mt-3 font-semibold text-foreground">Completa tu perfil institucional</h2>
            <p className="mt-1 text-sm text-muted-foreground">Comparte información para generar confianza en las personas postulantes.</p>
            <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary">
              Editar perfil <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </span>
          </Link>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Link href="/empresa/oferta">
          <Button>
            <FilePlus2 className="size-4" aria-hidden="true" />
            Nueva oferta
          </Button>
        </Link>
      </div>
    </div>
  )
}

function SummaryCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof BriefcaseBusiness
  label: string
  value: string
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-5">
        <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <div>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  )
}
