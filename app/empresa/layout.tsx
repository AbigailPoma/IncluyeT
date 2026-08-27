"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { AppShell, type NavItem } from "@/components/app-shell"
import { useAuth } from "@/Backend/context/auth-context"

const nav: NavItem[] = [
  { label: "Panel", href: "/empresa", icon: "dashboard" },
  { label: "Publicar oferta", href: "/empresa/oferta", icon: "offer" },
  { label: "Perfil institucional", href: "/empresa/perfil", icon: "companies" },
  { label: "Notificaciones", href: "/empresa/notificaciones", icon: "notifications" },
]

export default function EmpresaLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { empresa, isInitialized } = useAuth()

  useEffect(() => {
    if (isInitialized && (!empresa || !empresa.emailVerificado)) {
      router.replace("/login/empresa")
    }
  }, [empresa, isInitialized, router])

  if (!isInitialized || !empresa || !empresa.emailVerificado) return null

  return (
    <AppShell role="empresa" nav={nav}>
      {children}
    </AppShell>
  )
}
