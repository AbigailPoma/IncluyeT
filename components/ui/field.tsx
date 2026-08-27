import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

/* ---------- Label ---------- */
export function Label({
  className,
  required,
  children,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement> & { required?: boolean }) {
  return (
    <label
      className={cn(
        'flex items-center gap-1 text-sm font-semibold text-foreground',
        className,
      )}
      {...props}
    >
      {children}
      {required && (
        <span className="text-destructive" aria-hidden="true">
          *
        </span>
      )}
    </label>
  )
}

/* ---------- Input ---------- */
export function Input({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'h-11 w-full rounded-lg border-2 border-input bg-card px-3.5 text-sm text-foreground transition-colors',
        'placeholder:text-muted-foreground',
        'focus-visible:border-ring focus-visible:outline-3 focus-visible:outline-offset-1 focus-visible:outline-ring',
        'disabled:cursor-not-allowed disabled:opacity-60',
        'aria-[invalid=true]:border-destructive',
        className,
      )}
      {...props}
    />
  )
}

/* ---------- Textarea ---------- */
export function Textarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        'min-h-24 w-full rounded-lg border-2 border-input bg-card px-3.5 py-2.5 text-sm text-foreground transition-colors',
        'placeholder:text-muted-foreground',
        'focus-visible:border-ring focus-visible:outline-3 focus-visible:outline-offset-1 focus-visible:outline-ring',
        'aria-[invalid=true]:border-destructive',
        className,
      )}
      {...props}
    />
  )
}

/* ---------- Select (native) ---------- */
export function Select({
  className,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        'h-11 w-full rounded-lg border-2 border-input bg-card px-3 text-sm text-foreground transition-colors',
        'focus-visible:border-ring focus-visible:outline-3 focus-visible:outline-offset-1 focus-visible:outline-ring',
        className,
      )}
      {...props}
    />
  )
}

/* ---------- Field wrapper (label + control + help/error/success) ---------- */
type FieldStatus = 'error' | 'success' | undefined

export function Field({
  label,
  htmlFor,
  required,
  hint,
  status,
  message,
  children,
  className,
}: {
  label: string
  htmlFor: string
  required?: boolean
  hint?: string
  status?: FieldStatus
  message?: string
  children: React.ReactNode
  className?: string
}) {
  const messageId = `${htmlFor}-message`
  const hintId = `${htmlFor}-hint`
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <Label htmlFor={htmlFor} required={required}>
        {label}
      </Label>
      {hint && (
        <p id={hintId} className="text-xs text-muted-foreground">
          {hint}
        </p>
      )}
      {children}
      {message && status === 'error' && (
        <p
          id={messageId}
          role="alert"
          className="flex items-center gap-1.5 text-sm font-medium text-destructive"
        >
          <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
          {message}
        </p>
      )}
      {message && status === 'success' && (
        <p
          id={messageId}
          className="flex items-center gap-1.5 text-sm font-medium text-success"
        >
          <CheckCircle2 className="size-4 shrink-0" aria-hidden="true" />
          {message}
        </p>
      )}
    </div>
  )
}
