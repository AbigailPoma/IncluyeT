'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

type FontScale = 'sm' | 'md' | 'lg'

const SCALE_MAP: Record<FontScale, string> = {
  sm: '100%',
  md: '112.5%',
  lg: '125%',
}

const SCALE_ORDER: FontScale[] = ['sm', 'md', 'lg']

type AccessibilityContextValue = {
  fontScale: FontScale
  highContrast: boolean
  setFontScale: (scale: FontScale) => void
  increaseFont: () => void
  decreaseFont: () => void
  toggleContrast: () => void
}

const AccessibilityContext = createContext<AccessibilityContextValue | null>(
  null,
)

export function AccessibilityProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [fontScale, setFontScaleState] = useState<FontScale>('sm')
  const [highContrast, setHighContrast] = useState(false)

  // Load saved accessibility preferences
  useEffect(() => {
    const savedScale = window.localStorage.getItem(
      'a11y-font-scale',
    ) as FontScale | null
    const savedContrast = window.localStorage.getItem('a11y-contrast')
    if (savedScale && SCALE_MAP[savedScale]) setFontScaleState(savedScale)
    if (savedContrast === 'true') setHighContrast(true)
  }, [])

  // Apply font scale to the root element
  useEffect(() => {
    document.documentElement.style.fontSize = SCALE_MAP[fontScale]
    window.localStorage.setItem('a11y-font-scale', fontScale)
  }, [fontScale])

  // Apply high-contrast class
  useEffect(() => {
    document.documentElement.classList.toggle('hc', highContrast)
    window.localStorage.setItem('a11y-contrast', String(highContrast))
  }, [highContrast])

  const setFontScale = useCallback((scale: FontScale) => {
    setFontScaleState(scale)
  }, [])

  const increaseFont = useCallback(() => {
    setFontScaleState((current) => {
      const idx = SCALE_ORDER.indexOf(current)
      return SCALE_ORDER[Math.min(idx + 1, SCALE_ORDER.length - 1)]
    })
  }, [])

  const decreaseFont = useCallback(() => {
    setFontScaleState((current) => {
      const idx = SCALE_ORDER.indexOf(current)
      return SCALE_ORDER[Math.max(idx - 1, 0)]
    })
  }, [])

  const toggleContrast = useCallback(() => {
    setHighContrast((v) => !v)
  }, [])

  const value = useMemo(
    () => ({
      fontScale,
      highContrast,
      setFontScale,
      increaseFont,
      decreaseFont,
      toggleContrast,
    }),
    [fontScale, highContrast, setFontScale, increaseFont, decreaseFont, toggleContrast],
  )

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  )
}

export function useAccessibility() {
  const ctx = useContext(AccessibilityContext)
  if (!ctx) {
    throw new Error(
      'useAccessibility must be used within an AccessibilityProvider',
    )
  }
  return ctx
}
