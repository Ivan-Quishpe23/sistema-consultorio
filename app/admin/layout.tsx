'use client'

import { Home, Stethoscope, Users, BarChart3, Settings, Calendar } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'

const navItems = [
  { label: 'Dashboard', href: '/admin', icon: Home },
  { label: 'Especialidades', href: '/admin/especialidades', icon: Stethoscope },
  { label: 'Medicos', href: '/admin/medicos', icon: Users },
  { label: 'Excepciones', href: '/admin/excepciones', icon: Calendar },
  { label: 'Reportes', href: '/admin/reportes', icon: BarChart3 },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <DashboardLayout navItems={navItems} title="Administracion">
      {children}
    </DashboardLayout>
  )
}
