'use client'

import { Home, Users, Calendar, Settings } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'

const navItems = [
  { label: 'Mi Cola', href: '/doctor', icon: Home },
  { label: 'Pacientes del Dia', href: '/doctor/pacientes', icon: Users },
  { label: 'Mi Agenda', href: '/doctor/agenda', icon: Calendar },
  { label: 'Configuracion', href: '/doctor/configuracion', icon: Settings },
]

export default function DoctorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <DashboardLayout navItems={navItems} title="Panel del Medico">
      {children}
    </DashboardLayout>
  )
}
