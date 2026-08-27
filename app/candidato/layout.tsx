'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AppShell, type NavItem } from '@/components/app-shell'
import { useAuth } from '@/Backend/context/auth-context'

const nav: NavItem[] = [
  { label: 'Empleos', href: '/candidato', icon: 'dashboard' },
  { label: 'Mi perfil', href: '/candidato/perfil', icon: 'profile' },
  { label: 'Notificaciones', href: '/candidato/notificaciones', icon: 'notifications' },
  { label: 'Cursos del Estado', href: '/candidato/cursos', icon: 'courses' },
  { label: 'Empresas', href: '/candidato/empresa/tech-peru', icon: 'companies' },
]

export default function CandidatoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { candidato, isInitialized } = useAuth()

  useEffect(() => {
    if (isInitialized && (!candidato || !candidato.emailVerificado)) {
      router.replace('/login/candidato')
    }
  }, [candidato, isInitialized, router])

  if (!isInitialized || !candidato || !candidato.emailVerificado) return null

  return (
    <AppShell role="candidato" nav={nav}>
      {children}
    </AppShell>
  )
}
