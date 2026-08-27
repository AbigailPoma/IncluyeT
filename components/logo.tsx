import Link from 'next/link'
import { cn } from '@/lib/utils'

export function Logo({
  href = '/',
  className,
}: {
  href?: string
  className?: string
}) {
  return (
    <Link
      href={href}
      className={cn(
        'inline-flex items-center gap-2 rounded-md focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring',
        className,
      )}
      aria-label="IncluyeT, ir al inicio"
    >
      <span
        aria-hidden="true"
        className="flex size-9 items-center justify-center rounded-lg bg-primary font-display text-lg font-black text-primary-foreground"
      >
        iT
      </span>
      <span className="font-display text-xl font-extrabold tracking-tight text-foreground">
        Incluye<span className="text-primary">T</span>
      </span>
    </Link>
  )
}
