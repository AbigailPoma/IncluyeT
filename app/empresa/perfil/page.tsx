"use client"

import { useState } from "react"
import { Check, ChevronLeft, ChevronRight, HeartHandshake, ImagePlus, Info, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Field, Input, Select, Textarea } from "@/components/ui/field"
import { cn } from "@/lib/utils"
import { useAuth } from "@/Backend/context/auth-context"

const STEPS = ["Datos institucionales", "Instalaciones", "Políticas de inclusión", "Revisión"]

const POLICIES = [
  "Ajustes razonables en el puesto de trabajo",
  "Proceso de selección accesible",
  "Capacitación en trato inclusivo al personal",
  "Modalidades de trabajo flexibles",
  "Accesibilidad digital (web y software)",
  "Plan de contratación con cuota de inclusión",
]

export default function EmpresaPerfilWizard() {
  const { empresa, updateEmpresaProfile, deleteAccount } = useAuth()
  const [step, setStep] = useState(0)
  const [razonSocial, setRazonSocial] = useState(empresa?.razon_social || "")
  const [sector, setSector] = useState("Tecnología")
  const [ciudad, setCiudad] = useState("Lima")
  const [colaboradores, setColaboradores] = useState("201-500")
  const [descripcion, setDescripcion] = useState("")
  const [error, setError] = useState("")
  const progress = ((step + 1) / STEPS.length) * 100

  async function handleSave() {
    try {
      await updateEmpresaProfile({ razon_social: razonSocial, sector, ciudad, colaboradores, descripcion })
      setError("Perfil actualizado correctamente.")
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : "No se pudo actualizar el perfil.")
    }
  }

  async function handleDelete() {
    if (!window.confirm("¿Seguro que deseas eliminar tu cuenta? Esta acción no se puede deshacer.")) return
    try {
      await deleteAccount("empresa")
      window.location.href = "/"
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : "No se pudo eliminar la cuenta.")
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
        Perfil institucional
      </h1>
      <p className="mt-1 text-muted-foreground">
        Completa la información de tu empresa para atraer al mejor talento inclusivo.
      </p>
      {error && <p className="mt-3 rounded-md border border-primary/30 bg-primary/5 p-3 text-sm font-medium text-primary">{error}</p>}

      <div className="mt-6">
        <div className="mb-2 flex items-center justify-between text-sm font-semibold text-foreground">
          <span>
            Paso {step + 1} de {STEPS.length}: {STEPS[step]}
          </span>
          <span aria-hidden="true">{Math.round(progress)}%</span>
        </div>
        <div
          className="h-2.5 w-full overflow-hidden rounded-full bg-secondary"
          role="progressbar"
          aria-valuenow={Math.round(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Progreso del perfil institucional"
        >
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
        </div>
        <ol className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
          {STEPS.map((s, i) => (
            <li key={s} className="flex items-center gap-1.5 text-sm" aria-current={i === step ? "step" : undefined}>
              <span
                className={cn(
                  "flex size-6 items-center justify-center rounded-full text-xs font-bold",
                  i < step
                    ? "bg-success text-success-foreground"
                    : i === step
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground",
                )}
              >
                {i < step ? <Check className="size-3.5" aria-hidden="true" /> : i + 1}
              </span>
              <span className={cn("font-semibold", i === step ? "text-foreground" : "text-muted-foreground")}>{s}</span>
            </li>
          ))}
        </ol>
      </div>

      <Card className="mt-6">
        <CardContent className="p-6">
          {step === 0 && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Razón social" htmlFor="razon" required className="sm:col-span-2">
                <Input id="razon" value={razonSocial} onChange={(e) => setRazonSocial(e.target.value)} />
              </Field>
              <Field label="RUC" htmlFor="ruc" required>
                <Input id="ruc" defaultValue="20123456789" inputMode="numeric" readOnly />
              </Field>
              <Field label="Sector" htmlFor="sector">
                <Select id="sector" value={sector} onChange={(e) => setSector(e.target.value)}>
                  <option>Tecnología</option>
                  <option>Finanzas</option>
                  <option>Salud</option>
                  <option>Comercio</option>
                  <option>Educación</option>
                </Select>
              </Field>
              <Field label="Ciudad" htmlFor="ciudad">
                <Input id="ciudad" value={ciudad} onChange={(e) => setCiudad(e.target.value)} />
              </Field>
              <Field label="N° de colaboradores" htmlFor="size">
                <Select id="size" value={colaboradores} onChange={(e) => setColaboradores(e.target.value)}>
                  <option>1-50</option>
                  <option>51-200</option>
                  <option>201-500</option>
                  <option>500+</option>
                </Select>
              </Field>
              <Field label="Descripción de la empresa" htmlFor="desc" className="sm:col-span-2">
                <Textarea id="desc" placeholder="Cuéntanos sobre la misión y los valores de tu empresa…" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
              </Field>
            </div>
          )}

          {step === 1 && (
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-2 rounded-lg border border-primary/40 bg-primary/5 p-3">
                <Info className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
                <p className="text-sm leading-relaxed text-foreground">
                  Sube fotos de tus instalaciones adaptadas (rampas, ascensores, baños accesibles). Esto genera
                  confianza en las personas candidatas.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {["Entrada accesible", "Área de trabajo", "Baño adaptado"].map((cap) => (
                  <button
                    key={cap}
                    type="button"
                    className="flex aspect-square flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-input bg-secondary/40 p-4 text-center text-sm font-medium text-muted-foreground transition-colors hover:border-primary hover:text-foreground focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  >
                    <ImagePlus className="size-6 text-primary" aria-hidden="true" />
                    {cap}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <HeartHandshake className="size-5 text-accent-strong" aria-hidden="true" />
                <h2 className="font-display font-bold text-foreground">Políticas de inclusión</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                Marca las políticas que tu empresa aplica. Se mostrarán como acreditaciones en tu perfil público.
              </p>
              <fieldset className="grid gap-2 sm:grid-cols-2">
                <legend className="sr-only">Políticas de inclusión aplicadas</legend>
                {POLICIES.map((p) => (
                  <label
                    key={p}
                    className="flex cursor-pointer items-start gap-2.5 rounded-lg border-2 border-input p-3 text-sm font-medium text-foreground hover:bg-muted"
                  >
                    <input
                      type="checkbox"
                      defaultChecked
                      className="mt-0.5 size-4 accent-primary focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring"
                    />
                    {p}
                  </label>
                ))}
              </fieldset>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className="flex size-10 items-center justify-center rounded-full bg-success/15 text-success">
                  <Check className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <h2 className="font-display font-bold text-foreground">Perfil listo para publicar</h2>
                  <p className="text-sm text-muted-foreground">Revisa el resumen antes de guardar.</p>
                </div>
              </div>
              <dl className="mt-2 divide-y divide-border rounded-lg border border-border">
                <SummaryRow label="Razón social" value={razonSocial} />
                <SummaryRow label="RUC" value={empresa?.ruc || "No disponible"} />
                <SummaryRow label="Sector" value={sector} />
                <SummaryRow label="Políticas de inclusión" value="6 aplicadas" />
              </dl>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mt-6 flex items-center justify-between">
        <Button type="button" variant="outline" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
          <ChevronLeft className="size-4" aria-hidden="true" />
          Anterior
        </Button>
        {step < STEPS.length - 1 ? (
          <Button type="button" onClick={() => setStep((s) => s + 1)}>
            Siguiente
            <ChevronRight className="size-4" aria-hidden="true" />
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={handleDelete}>
              <Trash2 className="size-4" aria-hidden="true" />
              Eliminar cuenta
            </Button>
            <Button type="button" variant="success" onClick={handleSave}>
              <Check className="size-4" aria-hidden="true" />
              Guardar perfil
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-sm font-semibold text-foreground">{value}</dd>
    </div>
  )
}
