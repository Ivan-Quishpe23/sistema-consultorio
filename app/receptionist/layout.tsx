'use client'

import { Home, UserPlus, Calendar, Users, Search } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'

const navItems = [
  { label: 'Inicio', href: '/receptionist', icon: Home },
  { label: 'Nuevo Turno', href: '/receptionist/nuevo-turno', icon: Calendar },
  { label: 'Pacientes', href: '/receptionist/pacientes', icon: Users },
  { label: 'Buscar Turnos', href: '/receptionist/buscar', icon: Search },
]

export default function ReceptionistLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <DashboardLayout navItems={navItems} title="Recepcion">
      {children}
    </DashboardLayout>
  )
}
