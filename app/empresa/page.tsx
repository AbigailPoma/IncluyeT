'use client'

import Link from 'next/link'
import { useState } from 'react'
import {
  Accessibility,
  Brain,
  Briefcase,
  Building2,
  CheckCircle2,
  Cpu,
  Loader2,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  User,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useAuth } from '@/Backend/context/auth-context'
import { obtenerMatchIA } from '@/lib/api'

interface MatchResult {
  match_percentage: number
  nivel: string
  metrica: string
  detalles: {
    procesado: boolean
    vector_dim: number
  }
}

interface OfertaEmpleo {
  id: string
  titulo: string
  empresa: string
  ubicacion: string
  tipo: string
  descripcion: string
  adaptaciones: string[]
}

const ofertasIniciales: OfertaEmpleo[] = [
  {
    id: 'oferta-1',
    titulo: 'Analista de Datos Junior',
    empresa: 'Tech Perú S.A.',
    ubicacion: 'Lima / Remoto',
    tipo: 'Tiempo Completo',
    descripcion:
      'Buscamos Analista de Datos con sólidos conocimientos en SQL, Python, modelado de bases de datos y herramientas de visualización como PowerBI. Modalidad 100% remota con soporte para software de lectura de pantalla y jornada flexible.',
    adaptaciones: ['Remoto', 'Lector de pantalla', 'Jornada flexible'],
  },
  {
    id: 'oferta-2',
    titulo: 'Desarrollador/a Frontend Accessible',
    empresa: 'Innova Software',
    ubicacion: 'Remoto',
    tipo: 'Tiempo Completo',
    descripcion:
      'Buscamos desarrollador Frontend especializado en React, Next.js, HTML semántico y accesibilidad web WCAG 2.1. Entorno colaborativo adaptable para personas con movilidad reducida.',
    adaptaciones: ['Remoto', 'Jornada flexible'],
  },
  {
    id: 'oferta-3',
    titulo: 'Asistente de Soporte Técnico',
    empresa: 'Servicios Digitales SAC',
    ubicacion: 'Miraflores, Lima',
    tipo: 'Medio Tiempo',
    descripcion:
      'Atención de tickets de soporte, instalación de software y mantenimiento básico de redes e infraestructura. Instalaciones físicas adaptadas con rampas y ascensores.',
    adaptaciones: ['Accesibilidad física', 'Estacionamiento reservado'],
  },
]

export default function CandidatoDashboardPage() {
  const { candidato } = useAuth()
  const [ofertas] = useState<OfertaEmpleo[]>(ofertasIniciales)
  const [matches, setMatches] = useState<Record<string, MatchResult>>({})
  const [loadingIds, setLoadingIds] = useState<Record<string, boolean>>({})
  const [postulaciones, setPostulaciones] = useState<Record<string, boolean>>({})
  const [busqueda, setBusqueda] = useState('')

  // Obtener perfil dinámico actualizado desde AuthContext (o usar fallback si aún no hay login)
  const perfilTexto =
    candidato?.resumenPerfil ||
    'Profesional en desarrollo y análisis con conocimientos de accesibilidad, trabajo remoto y flexibilidad laboral.'

  const nombreCandidato = candidato?.nombre || 'María Silva'

  // Función para calcular la compatibilidad individual contra FastAPI
  const handleCalcularMatchOferta = async (ofertaId: string, descripcion: string) => {
    setLoadingIds((prev) => ({ ...prev, [ofertaId]: true }))
    try {
      const res = await obtenerMatchIA(perfilTexto, descripcion)
      if (res) {
        setMatches((prev) => ({ ...prev, [ofertaId]: res }))
      }
    } finally {
      setLoadingIds((prev) => ({ ...prev, [ofertaId]: false }))
    }
  }

  // Simulación de postulación a una oferta
  const handlePostular = (ofertaId: string) => {
    setPostulaciones((prev) => ({ ...prev, [ofertaId]: true }))
  }

  const ofertasFiltradas = ofertas.filter(
    (o) =>
      o.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
      o.empresa.toLowerCase().includes(busqueda.toLowerCase()) ||
      o.descripcion.toLowerCase().includes(busqueda.toLowerCase())
  )

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Targeta Header: Saludo y Resumen del Perfil Activo */}
      <Card className="border-primary/20 bg-linear-to-r from-primary/5 via-background to-accent/5">
        <CardContent className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-display text-2xl font-extrabold text-foreground">
                ¡Hola, {nombreCandidato}! 👋
              </h1>
              {candidato?.conadisValido && (
                <Badge variant="accent" className="gap-1 text-xs px-2.5 py-0.5 border-emerald-500/30">
                  <ShieldCheck className="size-3.5 text-emerald-600" />
                  CONADIS Validado ({candidato.numConadis})
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {candidato?.tituloProfesional || 'Desarrolladora Frontend Senior'} •{' '}
              {candidato?.cvNombreFile ? (
                <span className="text-emerald-600 font-medium">CV: {candidato.cvNombreFile}</span>
              ) : (
                'Sin CV en PDF subido'
              )}
            </p>
            <div className="text-xs text-muted-foreground bg-card/70 p-2.5 rounded-md border border-border mt-2">
              <span className="font-bold text-foreground">Texto del Perfil evaluado por la IA: </span>
              <span className="italic">"{perfilTexto}"</span>
            </div>
          </div>

          <Link href="/candidato/perfil">
            <Button variant="outline" className="gap-2 shrink-0 font-semibold">
              <User className="size-4" />
              Editar Mi Perfil / PDF
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Buscador de Empleos */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por cargo, empresa o tecnología..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full rounded-lg border border-input bg-card pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {/* Listado de Ofertas Inclusivas */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Briefcase className="size-5 text-primary" />
          Ofertas de Empleo Sugeridas ({ofertasFiltradas.length})
        </h2>

        {ofertasFiltradas.map((oferta) => {
          const match = matches[oferta.id]
          const isLoading = loadingIds[oferta.id]
          const yaPostulado = postulaciones[oferta.id]

          return (
            <Card key={oferta.id} className="transition-all hover:border-primary/40">
              <CardContent className="p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1">
                    <h3 className="font-bold text-lg text-foreground">{oferta.titulo}</h3>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1 font-semibold text-foreground">
                        <Building2 className="size-3.5 text-primary" />
                        {oferta.empresa}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="size-3.5" />
                        {oferta.ubicacion}
                      </span>
                      <Badge variant="outline" className="text-[11px]">
                        {oferta.tipo}
                      </Badge>
                    </div>
                  </div>

                  {/* Indicador de Porcentaje Match */}
                  <div className="flex items-center gap-2 shrink-0">
                    {match ? (
                      <Badge
                        variant="outline"
                        className={`font-extrabold text-sm px-3 py-1 ${
                          match.match_percentage >= 75
                            ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                            : match.match_percentage >= 50
                            ? 'bg-amber-500/10 text-amber-600 border-amber-500/30'
                            : 'bg-rose-500/10 text-rose-600 border-rose-500/30'
                        }`}
                      >
                        <Sparkles className="size-3.5 mr-1 text-amber-500" />
                        {match.match_percentage}% Compatibilidad
                      </Badge>
                    ) : (
                      <Button
                        onClick={() => handleCalcularMatchOferta(oferta.id, oferta.descripcion)}
                        disabled={isLoading}
                        size="sm"
                        variant="secondary"
                        className="gap-1.5 text-xs font-bold"
                      >
                        {isLoading ? (
                          <Loader2 className="size-3.5 animate-spin text-primary" />
                        ) : (
                          <Sparkles className="size-3.5 text-amber-500" />
                        )}
                        {isLoading ? 'Evaluando IA...' : 'Evaluar Compatibilidad IA'}
                      </Button>
                    )}
                  </div>
                </div>

                <p className="text-sm text-muted-foreground leading-relaxed">{oferta.descripcion}</p>

                {/* Etiquetas de Accesibilidad y Adaptación */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-xs font-semibold text-muted-foreground mr-1">Adaptaciones disponibles:</span>
                  {oferta.adaptaciones.map((a) => (
                    <Badge key={a} variant="accent" className="text-xs">
                      <Accessibility className="size-3 mr-1" />
                      {a}
                    </Badge>
                  ))}
                </div>

                {/* Footer de Tarjeta con Info SBERT y Botón de Postulación */}
                <div className="pt-3 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
                  {match ? (
                    <div className="text-[11px] text-muted-foreground flex items-center gap-3 bg-muted/40 px-3 py-1.5 rounded-lg w-full sm:w-auto">
                      <span className="flex items-center gap-1 font-medium text-foreground">
                        <Brain className="size-3.5 text-primary" />
                        SBERT vector ({match.detalles.vector_dim}D)
                      </span>
                      <span className="flex items-center gap-1">
                        <Cpu className="size-3 text-primary" />
                        {match.metrica} ({match.nivel})
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      Haz clic en "Evaluar Compatibilidad IA" para comparar este puesto con tu perfil actualizado.
                    </span>
                  )}

                  <Button
                    onClick={() => handlePostular(oferta.id)}
                    disabled={yaPostulado}
                    className={`w-full sm:w-auto gap-2 font-semibold ${
                      yaPostulado ? 'bg-emerald-600 hover:bg-emerald-600 text-white' : ''
                    }`}
                  >
                    {yaPostulado ? (
                      <>
                        <CheckCircle2 className="size-4" />
                        ¡Postulado con Éxito!
                      </>
                    ) : (
                      'Postular Ahora'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}