'use client'

import { Calendar, Home, Clock, User } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'

const navItems = [
  { label: 'Inicio', href: '/patient', icon: Home },
  { label: 'Solicitar Turno', href: '/patient/solicitar', icon: Calendar },
  { label: 'Mis Turnos', href: '/patient/turnos', icon: Clock },
  { label: 'Mi Perfil', href: '/patient/perfil', icon: User },
]

export default function PatientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <DashboardLayout navItems={navItems} title="Portal del Paciente">
      {children}
    </DashboardLayout>
  )
}
