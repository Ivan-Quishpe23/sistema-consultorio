'use client'

import { useState } from 'react'
import { format, subDays, startOfMonth, endOfMonth, startOfWeek, endOfWeek } from 'date-fns'
import { es } from 'date-fns/locale'
import { Download, Calendar, BarChart3, Clock, Users, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useStore } from '@/lib/store'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts'

export default function ReportsPage() {
  const store = useStore()
  const today = new Date()
  
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'custom'>('week')
  const [startDate, setStartDate] = useState(format(subDays(today, 7), 'yyyy-MM-dd'))
  const [endDate, setEndDate] = useState(format(today, 'yyyy-MM-dd'))
  const [doctorFilter, setDoctorFilter] = useState('all')

  const getDateRange = () => {
    switch (dateRange) {
      case 'week':
        return {
          start: format(startOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd'),
          end: format(endOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd'),
        }
      case 'month':
        return {
          start: format(startOfMonth(today), 'yyyy-MM-dd'),
          end: format(endOfMonth(today), 'yyyy-MM-dd'),
        }
      case 'custom':
        return { start: startDate, end: endDate }
    }
  }

  const { start, end } = getDateRange()

  let filteredAppointments = store.appointments.filter(
    a => a.date >= start && a.date <= end
  )

  if (doctorFilter !== 'all') {
    filteredAppointments = filteredAppointments.filter(a => a.doctorId === doctorFilter)
  }

  const stats = {
    total: filteredAppointments.length,
    attended: filteredAppointments.filter(a => a.status === 'completed').length,
    cancelled: filteredAppointments.filter(a => a.status === 'cancelled').length,
    absent: filteredAppointments.filter(a => a.status === 'absent').length,
    pending: filteredAppointments.filter(a => a.status === 'scheduled' || a.status === 'waiting').length,
  }

  const attendanceRate = stats.total > 0 ? ((stats.attended / stats.total) * 100).toFixed(1) : '0.0'
  const absenteeismRate = stats.total > 0 ? ((stats.absent / stats.total) * 100).toFixed(1) : '0.0'
  const cancellationRate = stats.total > 0 ? ((stats.cancelled / stats.total) * 100).toFixed(1) : '0.0'

  const doctorPerformance = store.doctors.map(doctor => {
    const doctorAppointments = filteredAppointments.filter(a => a.doctorId === doctor.id)
    const completed = doctorAppointments.filter(a => a.status === 'completed').length
    const absent = doctorAppointments.filter(a => a.status === 'absent').length
    const total = doctorAppointments.length
    
    return {
      name: doctor.name.split(' ').slice(0, 2).join(' '),
      fullName: doctor.name,
      total,
      completed,
      absent,
      absentRate: total > 0 ? ((absent / total) * 100).toFixed(1) : '0.0',
    }
  }).filter(d => d.total > 0)

  const dailyData = (() => {
    const days: Record<string, { date: string, total: number, completed: number, cancelled: number }> = {}
    filteredAppointments.forEach(a => {
      if (!days[a.date]) {
        days[a.date] = { date: a.date, total: 0, completed: 0, cancelled: 0 }
      }
      days[a.date].total++
      if (a.status === 'completed') days[a.date].completed++
      if (a.status === 'cancelled') days[a.date].cancelled++
    })
    return Object.values(days)
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(d => ({
        ...d,
        name: format(new Date(d.date + 'T12:00:00'), 'd MMM', { locale: es }),
      }))
  })()

  const exportCSV = () => {
    const headers = ['Fecha', 'Hora', 'Paciente', 'Cedula', 'Medico', 'Especialidad', 'Estado']
    const rows = filteredAppointments.map(a => {
      const patient = store.patients.find(p => p.id === a.patientId)
      const doctor = store.doctors.find(d => d.id === a.doctorId)
      const specialty = store.specialties.find(s => s.id === a.specialtyId)
      return [
        a.date,
        a.time,
        patient?.fullName || '',
        patient?.cedula || '',
        doctor?.name || '',
        specialty?.name || '',
        a.status,
      ]
    })
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `reporte-turnos-${start}-${end}.csv`
    link.click()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Reportes</h2>
          <p className="text-muted-foreground">Analisis y estadisticas del sistema</p>
        </div>
        <Button onClick={exportCSV}>
          <Download className="w-4 h-4 mr-2" />
          Exportar CSV
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Periodo</Label>
              <Select value={dateRange} onValueChange={(v: 'week' | 'month' | 'custom') => setDateRange(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Esta Semana</SelectItem>
                  <SelectItem value="month">Este Mes</SelectItem>
                  <SelectItem value="custom">Personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {dateRange === 'custom' && (
              <>
                <div className="space-y-2">
                  <Label>Desde</Label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Hasta</Label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </>
            )}
            <div className="space-y-2">
              <Label>Medico</Label>
              <Select value={doctorFilter} onValueChange={setDoctorFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {store.doctors.map((doctor) => (
                    <SelectItem key={doctor.id} value={doctor.id}>
                      {doctor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Turnos</p>
                <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Atendidos</p>
                <p className="text-2xl font-bold text-foreground">{stats.attended}</p>
                <p className="text-xs text-success">{attendanceRate}% tasa</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ausentes</p>
                <p className="text-2xl font-bold text-foreground">{stats.absent}</p>
                <p className="text-xs text-destructive">{absenteeismRate}% tasa</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
                <Clock className="w-6 h-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Cancelados</p>
                <p className="text-2xl font-bold text-foreground">{stats.cancelled}</p>
                <p className="text-xs text-warning">{cancellationRate}% tasa</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Turnos por Dia</CardTitle>
          </CardHeader>
          <CardContent>
            {dailyData.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No hay datos para el periodo seleccionado
              </div>
            ) : (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dailyData}>
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
                    <Line type="monotone" dataKey="total" name="Total" stroke="hsl(var(--chart-1))" strokeWidth={2} />
                    <Line type="monotone" dataKey="completed" name="Completados" stroke="hsl(var(--chart-2))" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rendimiento por Medico</CardTitle>
          </CardHeader>
          <CardContent>
            {doctorPerformance.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No hay datos para el periodo seleccionado
              </div>
            ) : (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={doctorPerformance} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis type="number" className="text-muted-foreground" />
                    <YAxis dataKey="name" type="category" width={100} className="text-muted-foreground" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar dataKey="completed" name="Atendidos" fill="hsl(var(--chart-2))" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="absent" name="Ausentes" fill="hsl(var(--chart-5))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tasa de Ausentismo por Medico</CardTitle>
        </CardHeader>
        <CardContent>
          {doctorPerformance.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No hay datos para el periodo seleccionado
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Medico</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Total Turnos</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Atendidos</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Ausentes</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Tasa Ausentismo</th>
                  </tr>
                </thead>
                <tbody>
                  {doctorPerformance.map((doctor) => (
                    <tr key={doctor.fullName} className="border-b border-border last:border-0">
                      <td className="py-3 px-4 font-medium text-foreground">{doctor.fullName}</td>
                      <td className="py-3 px-4 text-center text-foreground">{doctor.total}</td>
                      <td className="py-3 px-4 text-center text-success">{doctor.completed}</td>
                      <td className="py-3 px-4 text-center text-destructive">{doctor.absent}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={Number(doctor.absentRate) > 20 ? 'text-destructive font-semibold' : 'text-muted-foreground'}>
                          {doctor.absentRate}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
