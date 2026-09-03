'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import {
  loginCandidato as loginCandidatoApi,
  loginEmpresa as loginEmpresaApi,
  registerCandidato as registerCandidatoApi,
  updateCandidato as updateCandidatoApi,
  deleteCandidato as deleteCandidatoApi,
  updateEmpresa as updateEmpresaApi,
  deleteEmpresa as deleteEmpresaApi,
  verifyAccount as verifyAccountApi,
} from '@/lib/api'

export interface CandidatoUser {
  id: string
  nombre: string
  email: string
  dni: string
  numConadis?: string
  conadisValido: boolean
  tituloProfesional: string
  resumenPerfil: string
  habilidades: string[]
  adaptaciones: string[]
  cvNombreFile?: string
  emailVerificado: boolean
  access_token?: string
}

export interface EmpresaUser {
  id: string
  ruc: string
  razon_social: string
  email: string
  emailVerificado: boolean
  sector?: string
  ciudad?: string
  colaboradores?: string
  descripcion?: string
  access_token?: string
}

interface AuthContextType {
  candidato: CandidatoUser | null
  empresa: EmpresaUser | null
  isInitialized: boolean
  login: (email: string, password: string) => Promise<boolean>
  loginEmpresa: (usuario: string, password: string) => Promise<boolean>
  register: (datos: Omit<CandidatoUser, 'id' | 'emailVerificado'> & { password: string }) => Promise<void>
  verifyAccount: (tipo: 'candidato' | 'empresa', token: string) => Promise<boolean>
  updateProfile: (datos: Partial<CandidatoUser>) => Promise<void>
  updateEmpresaProfile: (datos: Record<string, string>) => Promise<void>
  deleteAccount: (tipo: 'candidato' | 'empresa') => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [candidato, setCandidato] = useState<CandidatoUser | null>(null)
  const [empresa, setEmpresa] = useState<EmpresaUser | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('candidato_session')
    if (saved) {
      try {
        const user = JSON.parse(saved) as CandidatoUser
        setCandidato(user)
      } catch {
        localStorage.removeItem('candidato_session')
      }
    }
    const savedEmpresa = localStorage.getItem('empresa_session')
    if (savedEmpresa) {
      try {
        setEmpresa(JSON.parse(savedEmpresa) as EmpresaUser)
      } catch {
        localStorage.removeItem('empresa_session')
      }
    }
    setIsInitialized(true)
  }, [])

  const saveState = (user: CandidatoUser | null) => {
    setCandidato(user)
    if (user) {
      localStorage.setItem('candidato_session', JSON.stringify(user))
      localStorage.setItem('candidato_account', JSON.stringify(user))
    } else {
      localStorage.removeItem('candidato_session')
      localStorage.removeItem('candidato_account')
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const response = await loginCandidatoApi(email, password)
      if (!response.usuario || !response.verificado) return false
      saveState(response.usuario as unknown as CandidatoUser)
      return true
    } catch (error) {
      throw error
    }
  }

  const loginEmpresa = async (usuario: string, password: string) => {
    try {
      const response = await loginEmpresaApi(usuario, password)
      if (!response.usuario || !response.verificado) return false
      const account = response.usuario as unknown as EmpresaUser
      setEmpresa(account)
      localStorage.setItem('empresa_session', JSON.stringify(account))
      return true
    } catch (error) {
      throw error
    }
  }

  const register = async (datos: Omit<CandidatoUser, 'id' | 'emailVerificado'> & { password: string }) => {
    const response = await registerCandidatoApi({
      nombre: datos.nombre,
      email: datos.email,
      dni: datos.dni,
      password: datos.password,
      numConadis: datos.numConadis || '',
      conadisValido: datos.conadisValido,
    })
    if (response.token_verificacion) {
      localStorage.setItem('verification_token', response.token_verificacion)
    }
  }

  const verifyAccount = async (tipo: 'candidato' | 'empresa', token: string) => {
    const response = await verifyAccountApi(token)
    if (response.usuario) {
      const account = response.usuario as unknown as CandidatoUser & EmpresaUser
      if (tipo === 'candidato') {
        saveState(account as CandidatoUser)
      } else {
        setEmpresa(account as EmpresaUser)
        localStorage.setItem('empresa_session', JSON.stringify(account))
      }
    }
    return response.verificado
  }

  const updateProfile = async (datos: Partial<CandidatoUser>) => {
    if (!candidato) return
    if (!candidato.access_token) throw new Error('Tu sesión expiró. Vuelve a iniciar sesión.')
    const updated = { ...candidato, ...datos }
    const response = await updateCandidatoApi(candidato.id, {
      nombre: updated.nombre,
      numConadis: updated.numConadis || '',
      conadisValido: updated.conadisValido,
      tituloProfesional: updated.tituloProfesional,
      resumenPerfil: updated.resumenPerfil,
      habilidades: updated.habilidades,
      adaptaciones: updated.adaptaciones,
      cvNombreFile: updated.cvNombreFile || '',
    }, candidato.access_token)
    if (response.usuario) saveState({ ...candidato, ...(response.usuario as unknown as CandidatoUser) })
  }

  const updateEmpresaProfile = async (datos: Record<string, string>) => {
    if (!empresa) return
    if (!empresa.access_token) throw new Error('Tu sesión expiró. Vuelve a iniciar sesión.')
    const response = await updateEmpresaApi(empresa.id, datos, empresa.access_token)
    if (response.usuario) {
      const updated = { ...empresa, ...(response.usuario as unknown as EmpresaUser) }
      setEmpresa(updated)
      localStorage.setItem('empresa_session', JSON.stringify(updated))
    }
  }

  const deleteAccount = async (tipo: 'candidato' | 'empresa') => {
    if (tipo === 'candidato' && candidato) {
      if (!candidato.access_token) throw new Error('Tu sesión expiró. Vuelve a iniciar sesión.')
      await deleteCandidatoApi(candidato.id, candidato.access_token)
    }
    if (tipo === 'empresa' && empresa) {
      if (!empresa.access_token) throw new Error('Tu sesión expiró. Vuelve a iniciar sesión.')
      await deleteEmpresaApi(empresa.id, empresa.access_token)
    }
    logout()
  }

  const logout = () => {
    saveState(null)
    setEmpresa(null)
    localStorage.removeItem('empresa_session')
  }

  return (
    <AuthContext.Provider
      value={{ candidato, empresa, isInitialized, login, loginEmpresa, register, verifyAccount, updateProfile, updateEmpresaProfile, deleteAccount, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider')
  }
  return context
}