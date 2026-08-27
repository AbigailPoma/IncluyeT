'use client'

import { AArrowDown, AArrowUp, Contrast } from 'lucide-react'
import { useAccessibility } from '@/components/accessibility-provider'
import { cn } from '@/lib/utils'

export function AccessibilityControls({
  className,
}: {
  className?: string
}) {
  const {
    fontScale,
    highContrast,
    increaseFont,
    decreaseFont,
    toggleContrast,
  } = useAccessibility()

  const btn =
    'inline-flex size-10 items-center justify-center rounded-md border-2 border-input bg-card text-foreground transition-colors hover:bg-muted focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-40 disabled:cursor-not-allowed'

  return (
    <div
      role="group"
      aria-label="Ajustes de accesibilidad"
      className={cn('flex items-center gap-1.5', className)}
    >
      <button
        type="button"
        className={btn}
        onClick={decreaseFont}
        disabled={fontScale === 'sm'}
        aria-label="Reducir tamaño de letra"
      >
        <AArrowDown className="size-5" aria-hidden="true" />
      </button>
      <button
        type="button"
        className={btn}
        onClick={increaseFont}
        disabled={fontScale === 'lg'}
        aria-label="Aumentar tamaño de letra"
      >
        <AArrowUp className="size-5" aria-hidden="true" />
      </button>
      <button
        type="button"
        className={cn(
          btn,
          highContrast && 'border-primary bg-primary text-primary-foreground',
        )}
        onClick={toggleContrast}
        aria-pressed={highContrast}
        aria-label={
          highContrast
            ? 'Desactivar alto contraste'
            : 'Activar alto contraste'
        }
      >
        <Contrast className="size-5" aria-hidden="true" />
      </button>
    </div>
  )
}
