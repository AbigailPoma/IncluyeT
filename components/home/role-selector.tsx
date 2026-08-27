'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ArrowRight, Briefcase, Building2, Search } from 'lucide-react'
import { cn } from '@/lib/utils'

type Role = 'buscar' | 'publicar'

export function RoleSelector() {
  const [role, setRole] = useState<Role>('buscar')

  return (
    <div className="rounded-2xl border-2 border-primary/20 bg-card p-4 shadow-sm sm:p-5">
      <div
        role="radiogroup"
        aria-label="¿Qué deseas hacer?"
        className="grid grid-cols-2 gap-2"
      >
        <RoleTab
          selected={role === 'buscar'}
          onSelect={() => setRole('buscar')}
          icon={<Search className="size-5" aria-hidden="true" />}
          label="Buscar empleo"
        />
        <RoleTab
          selected={role === 'publicar'}
          onSelect={() => setRole('publicar')}
          icon={<Briefcase className="size-5" aria-hidden="true" />}
          label="Publicar oferta"
        />
      </div>

      <div className="mt-4">
        {role === 'buscar' ? (
          <RolePanel
            icon={<Search className="size-6" aria-hidden="true" />}
            title="Soy candidato/a"
            description="Encuentra vacantes con adaptaciones reales para tu perfil y accede a cursos gratuitos del Estado."
            primary={['Crear mi perfil', '/registro/candidato']}
            secondary={['Ya tengo cuenta', '/login/candidato']}
          />
        ) : (
          <RolePanel
            icon={<Building2 className="size-6" aria-hidden="true" />}
            title="Soy empresa"
            description="Publica ofertas inclusivas, recibe postulaciones de talento diverso y muestra tus acreditaciones de accesibilidad."
            primary={['Registrar empresa', '/registro/empresa']}
            secondary={['Ya tengo cuenta', '/login/empresa']}
          />
        )}
      </div>
    </div>
  )
}

function RoleTab({
  selected,
  onSelect,
  icon,
  label,
}: {
  selected: boolean
  onSelect: () => void
  icon: React.ReactNode
  label: string
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={cn(
        'flex items-center justify-center gap-2 rounded-xl border-2 px-3 py-3 text-sm font-bold transition-colors focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring',
        selected
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-input bg-card text-foreground hover:bg-muted',
      )}
    >
      {icon}
      {label}
    </button>
  )
}

function RolePanel({
  icon,
  title,
  description,
  primary,
  secondary,
}: {
  icon: React.ReactNode
  title: string
  description: string
  primary: [string, string]
  secondary: [string, string]
}) {
  return (
    <div className="rounded-xl border border-border bg-secondary/50 p-4">
      <div className="flex items-start gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </span>
        <div>
          <h3 className="font-display text-base font-bold text-foreground">
            {title}
          </h3>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        </div>
      </div>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <Link
          href={primary[1]}
          className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          {primary[0]}
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
        <Link
          href={secondary[1]}
          className="inline-flex h-11 flex-1 items-center justify-center rounded-lg border-2 border-input px-5 text-sm font-semibold text-foreground hover:bg-muted focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          {secondary[0]}
        </Link>
      </div>
    </div>
  )
}
