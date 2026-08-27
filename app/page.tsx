import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowRight,
  Award,
  BookOpen,
  MapPin,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react'
import { PublicHeader } from '@/components/public-header'
import { SiteFooter } from '@/components/site-footer'
import { RoleSelector } from '@/components/home/role-selector'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'
import { companies, courses } from '@/lib/data'

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PublicHeader />
      <main id="contenido-principal" className="flex-1">
        {/* Hero */}
        <section className="border-b border-primary/20 bg-secondary/40">
          <div className="mx-auto grid max-w-300 items-center gap-10 px-4 py-12 lg:grid-cols-2 lg:px-6 lg:py-16">
            <div>
              <Badge variant="accent">
                <Sparkles aria-hidden="true" />
                Empleo inclusivo en el Perú
              </Badge>
              <h1 className="mt-4 font-display text-4xl font-extrabold leading-[1.1] tracking-tight text-foreground text-balance sm:text-5xl">
                Conectamos talento con discapacidad y empresas que{' '}
                <span className="text-primary">incluyen de verdad</span>
              </h1>
              <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground">
                Encuentra vacantes con adaptaciones reales, capacítate con
                cursos gratuitos del Estado y postula con confianza. Todo en
                una plataforma diseñada para ser accesible.
              </p>
              <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
                <Stat icon={<Users aria-hidden="true" />} label="+8,500 candidatos" />
                <Stat icon={<Award aria-hidden="true" />} label="+320 empresas inclusivas" />
                <Stat icon={<BookOpen aria-hidden="true" />} label="45 cursos del Estado" />
              </div>
            </div>
            <div className="flex flex-col gap-5">
              <div className="overflow-hidden rounded-2xl border border-border">
                <Image
                  src="/hero-inclusion.png"
                  alt="Equipo diverso de trabajadores peruanos colaborando en una oficina moderna y accesible, incluyendo una persona en silla de ruedas y una persona comunicándose en lengua de señas."
                  width={720}
                  height={480}
                  priority
                  className="h-auto w-full object-cover"
                />
              </div>
              <RoleSelector />
            </div>
          </div>
        </section>

        {/* Empresas destacadas */}
        <section id="empresas" className="border-b border-border">
          <div className="mx-auto max-w-300 px-4 py-12 lg:px-6">
            <SectionHeader
              title="Empresas destacadas"
              description="Organizaciones con sellos y acreditaciones de inclusión laboral verificadas."
              action={['Ver todas', '/candidato']}
            />
            <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {companies.map((c) => (
                <li key={c.id}>
                  <Card className="h-full transition-colors hover:border-primary">
                    <CardContent className="flex h-full flex-col gap-3 p-5">
                      <div className="flex items-center gap-3">
                        <span
                          aria-hidden="true"
                          className="flex size-12 items-center justify-center rounded-lg bg-primary/10 font-display text-lg font-black text-primary"
                        >
                          {c.initials}
                        </span>
                        <div>
                          <h3 className="font-display font-bold text-foreground">
                            {c.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {c.sector}
                          </p>
                        </div>
                      </div>
                      <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <MapPin className="size-4" aria-hidden="true" />
                        {c.location}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {c.accreditations.map((a) => (
                          <Badge key={a} variant="success">
                            <ShieldCheck aria-hidden="true" />
                            {a}
                          </Badge>
                        ))}
                      </div>
                      <Link
                        href={`/candidato/empresa/${c.id}`}
                        className="mt-auto inline-flex items-center gap-1 text-sm font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring"
                      >
                        {c.openRoles} vacantes abiertas
                        <ArrowRight className="size-4" aria-hidden="true" />
                      </Link>
                    </CardContent>
                  </Card>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Cursos del Estado */}
        <section className="border-b border-border bg-secondary/40">
          <div className="mx-auto max-w-300 px-4 py-12 lg:px-6">
            <SectionHeader
              title="Cursos gratuitos del Estado"
              description="Capacitaciones oficiales de MTPE, CONADIS y SENATI para potenciar tu empleabilidad."
              action={['Ver catálogo', '/candidato/cursos']}
            />
            <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {courses.slice(0, 3).map((course) => (
                <li key={course.id}>
                  <Card className="h-full">
                    <CardContent className="flex h-full flex-col gap-3 p-5">
                      <div className="flex items-center justify-between">
                        <Badge>{course.entity}</Badge>
                        <Badge variant="muted">{course.modality}</Badge>
                      </div>
                      <h3 className="font-display font-bold text-foreground text-pretty">
                        {course.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {course.duration} · {course.seats}
                      </p>
                      <Link
                        href="/candidato/cursos"
                        className={`${buttonVariants({ variant: 'outline', size: 'sm' })} mt-auto`}
                      >
                        Ver curso
                      </Link>
                    </CardContent>
                  </Card>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Compromiso de accesibilidad */}
        <section className="bg-success/5">
          <div className="mx-auto max-w-300 px-4 py-12 lg:px-6">
            <SectionHeader
              title="Diseñada para todas las personas"
              description="Cumplimos con las pautas WCAG 2.1 nivel AA en cada pantalla."
            />
            <ul className="mt-6 grid gap-4 sm:grid-cols-3">
              <Feature
                title="Alto contraste"
                text="Colores con relación de contraste mínima de 4.5:1 y modo de contraste reforzado."
              />
              <Feature
                title="Tamaño de letra ajustable"
                text="Aumenta o reduce el texto desde la barra superior sin perder la maquetación."
              />
              <Feature
                title="Feedback multisensorial"
                text="Estados de error y éxito con icono más texto explicativo, nunca solo color."
              />
            </ul>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}

function Stat({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="flex items-center gap-2 text-sm font-semibold text-foreground [&_svg]:size-5 [&_svg]:text-primary">
      {icon}
      {label}
    </span>
  )
}

function SectionHeader({
  title,
  description,
  action,
}: {
  title: string
  description: string
  action?: [string, string]
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {title}
        </h2>
        <p className="mt-1 max-w-2xl text-muted-foreground">{description}</p>
      </div>
      {action && (
        <Link
          href={action[1]}
          className="inline-flex items-center gap-1 rounded-md text-sm font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          {action[0]}
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      )}
    </div>
  )
}

function Feature({ title, text }: { title: string; text: string }) {
  return (
    <li>
      <Card className="h-full">
        <CardContent className="flex h-full flex-col gap-2 p-5">
          <span className="flex size-11 items-center justify-center rounded-lg bg-accent/12 text-accent-strong">
            <ShieldCheck className="size-6" aria-hidden="true" />
          </span>
          <h3 className="mt-1 font-display font-bold text-foreground">
            {title}
          </h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {text}
          </p>
        </CardContent>
      </Card>
    </li>
  )
}
