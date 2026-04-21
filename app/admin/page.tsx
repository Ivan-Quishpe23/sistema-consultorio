'use client'

import { format, subDays } from 'date-fns'
import { es } from 'date-fns/locale'
import { Calendar, Users, Stethoscope, CheckCircle, XCircle, Clock, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useStore } from '@/lib/store'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

export default function AdminDashboard() {
  const store = useStore()
  
  const today = new Date()
  const todayStr = format(today, 'yyyy-MM-dd')

  const chartColors = {
    total: '#60A5FA',
    completed: '#38BDF8',
    cancelled: '#7DD3FC',
    absent: '#7DD3FC',
    pending: '#93C5FD',
  }
  
  const stats = {
    totalPatients: store.patients.length,
    activePatients: store.patients.filter(p => p.active).length,
    totalDoctors: store.doctors.length,
    activeDoctors: store.doctors.filter(d => d.active).length,
    totalSpecialties: store.specialties.length,
    activeSpecialties: store.specialties.filter(s => s.active).length,
    todayAppointments: store.appointments.filter(a => a.date === todayStr).length,
    completedToday: store.appointments.filter(a => a.date === todayStr && a.status === 'completed').length,
  }

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(today, 6 - i)
    const dateStr = format(date, 'yyyy-MM-dd')
    const dayAppointments = store.appointments.filter(a => a.date === dateStr)
    return {
      name: format(date, 'EEE', { locale: es }),
      total: dayAppointments.length,
      completed: dayAppointments.filter(a => a.status === 'completed').length,
      cancelled: dayAppointments.filter(a => a.status === 'cancelled').length,
    }
  })

  const statusDistribution = [
    { name: 'Atendidos', value: store.appointments.filter(a => a.status === 'completed').length, color: chartColors.completed },
    { name: 'Cancelados', value: store.appointments.filter(a => a.status === 'cancelled').length, color: chartColors.total },
    { name: 'Ausentes', value: store.appointments.filter(a => a.status === 'absent').length, color: chartColors.absent },
    { name: 'Pendientes', value: store.appointments.filter(a => a.status === 'scheduled' || a.status === 'waiting').length, color: chartColors.pending },
  ]

  const doctorStats = store.doctors.map(doctor => {
    const appointments = store.appointments.filter(a => a.doctorId === doctor.id)
    const specialty = store.specialties.find(s => s.id === doctor.specialtyId)
    return {
      name: doctor.name,
      specialty: specialty?.name || '',
      total: appointments.length,
      completed: appointments.filter(a => a.status === 'completed').length,
      absent: appointments.filter(a => a.status === 'absent').length,
    }
  })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Panel de Administracion</h2>
        <p className="text-muted-foreground">
          {format(new Date(), "EEEE d 'de' MMMM, yyyy", { locale: es })}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pacientes</p>
                <p className="text-2xl font-bold text-foreground">{stats.activePatients}</p>
                <p className="text-xs text-muted-foreground">de {stats.totalPatients} totales</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                <Stethoscope className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Medicos</p>
                <p className="text-2xl font-bold text-foreground">{stats.activeDoctors}</p>
                <p className="text-xs text-muted-foreground">{stats.activeSpecialties} especialidades</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Turnos Hoy</p>
                <p className="text-2xl font-bold text-foreground">{stats.todayAppointments}</p>
                <p className="text-xs text-muted-foreground">{stats.completedToday} completados</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Turnos</p>
                <p className="text-2xl font-bold text-foreground">{store.appointments.length}</p>
                <p className="text-xs text-muted-foreground">historico</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Turnos Ultimos 7 Dias</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={last7Days}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="name" className="text-muted-foreground" />
                  <YAxis className="text-muted-foreground" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="total" name="Total" fill={chartColors.total} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="completed" name="Completados" fill={chartColors.completed} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribucion de Estados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              {statusDistribution.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-muted-foreground">{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Estadisticas por Medico</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Medico</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Especialidad</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Total</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Atendidos</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Ausentes</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Tasa Ausentismo</th>
                </tr>
              </thead>
              <tbody>
                {doctorStats.map((doctor) => {
                  const absenteeRate = doctor.total > 0 ? ((doctor.absent / doctor.total) * 100).toFixed(1) : '0.0'
                  return (
                    <tr key={doctor.name} className="border-b border-border last:border-0">
                      <td className="py-3 px-4 font-medium text-foreground">{doctor.name}</td>
                      <td className="py-3 px-4 text-muted-foreground">{doctor.specialty}</td>
                      <td className="py-3 px-4 text-center text-foreground">{doctor.total}</td>
                      <td className="py-3 px-4 text-center text-success">{doctor.completed}</td>
                      <td className="py-3 px-4 text-center text-destructive">{doctor.absent}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={Number(absenteeRate) > 20 ? 'text-destructive' : 'text-muted-foreground'}>
                          {absenteeRate}%
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
