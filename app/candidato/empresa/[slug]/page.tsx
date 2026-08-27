import { JobCard } from "@/components/job-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { companyProfile, jobs } from "@/lib/data"
import { Award, Building2, CheckCircle2, Globe, Heart, MapPin, Users } from "lucide-react"

export default function EmpresaPublicProfile({ params }: { params: { slug: string } }) {
  void params
  const company = companyProfile

  return (
    <div className="mx-auto max-w-4xl">
      {/* Header banner */}
      <Card className="overflow-hidden">
        <div className="h-28 w-full bg-primary/15" aria-hidden="true" />
        <CardContent className="p-6">
          <div className="-mt-16 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-4">
              <span
                aria-hidden="true"
                className="flex size-20 shrink-0 items-center justify-center rounded-2xl border-4 border-card bg-primary text-primary-foreground"
              >
                <Building2 className="size-9" />
              </span>
              <div>
                <h1 className="font-display text-2xl font-extrabold tracking-tight text-foreground">
                  {company.name}
                </h1>
                <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="size-4" aria-hidden="true" />
                  {company.location} · {company.sector}
                </p>
              </div>
            </div>
            <Button variant="outline">
              <Globe className="size-4" aria-hidden="true" />
              Sitio web
            </Button>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {company.accreditations.map((a) => (
              <Badge key={a} variant="success">
                <Award className="size-3.5" aria-hidden="true" />
                {a}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="size-5 text-primary" aria-hidden="true" />
                Sobre la empresa
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="leading-relaxed text-muted-foreground">{company.about}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                  <Heart className="size-5 text-accent-strong" aria-hidden="true" />
                Cultura inclusiva
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="flex flex-col gap-2.5">
                {company.culture.map((c) => (
                  <li key={c} className="flex items-start gap-2.5 text-sm text-foreground">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
                    <span className="leading-relaxed">{c}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <section aria-labelledby="vacantes-titulo">
            <h2 id="vacantes-titulo" className="mb-3 font-display text-lg font-bold text-foreground">
              Vacantes abiertas ({jobs.length})
            </h2>
            <ul className="flex flex-col gap-4">
              {jobs.map((job) => (
                <li key={job.id}>
                  <JobCard job={{ ...job, company: company.name }} />
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="flex flex-col gap-4" aria-label="Datos de la empresa">
          <Card>
            <CardContent className="flex flex-col gap-4 p-5">
              <Stat label="Colaboradores" value={company.size} />
              <Stat label="Sector" value={company.sector} />
              <Stat label="Vacantes activas" value={`${jobs.length}`} />
              <Stat label="Índice de inclusión" value={company.inclusionScore} highlight />
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  )
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-2 border-b border-border pb-3 last:border-b-0 last:pb-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={highlight ? "font-display text-base font-bold text-success" : "font-semibold text-foreground"}>
        {value}
      </span>
    </div>
  )
}
