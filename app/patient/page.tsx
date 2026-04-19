'use client'

import { useRouter } from 'next/navigation'
import { Calendar, Clock, CheckCircle, XCircle, ArrowRight } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useStore } from '@/lib/store'

const statusConfig = {
  scheduled: { label: 'Programado', variant: 'secondary' as const, color: 'bg-secondary' },
  waiting: { label: 'En Espera', variant: 'default' as const, color: 'bg-warning' },
  in_consultation: { label: 'En Consulta', variant: 'default' as const, color: 'bg-primary' },
  completed: { label: 'Completado', variant: 'secondary' as const, color: 'bg-success' },
  cancelled: { label: 'Cancelado', variant: 'destructive' as const, color: 'bg-destructive' },
  absent: { label: 'Ausente', variant: 'destructive' as const, color: 'bg-destructive' },
}

export default function PatientDashboard() {
  const router = useRouter()
  const store = useStore()
  
  const patient = store.patients.find(p => p.userId === store.currentUser?.id)
  const appointments = patient ? store.getPatientAppointments(patient.id) : []
  
  const today = new Date().toISOString().split('T')[0]
  const upcomingAppointments = appointments
    .filter(a => a.date >= today && a.status !== 'cancelled' && a.status !== 'completed' && a.status !== 'absent')
    .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
    .slice(0, 3)

  const stats = {
    total: appointments.length,
    completed: appointments.filter(a => a.status === 'completed').length,
    cancelled: appointments.filter(a => a.status === 'cancelled').length,
    upcoming: upcomingAppointments.length,
  }

  const getDoctor = (doctorId: string) => store.doctors.find(d => d.id === doctorId)
  const getSpecialty = (specialtyId: string) => store.specialties.find(s => s.id === specialtyId)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            Bienvenido, {patient?.fullName || store.currentUser?.name}
          </h2>
          <p className="text-muted-foreground">Gestiona tus citas medicas</p>
        </div>
        <Button onClick={() => router.push('/patient/solicitar')}>
          <Calendar className="w-4 h-4 mr-2" />
          Solicitar Turno
        </Button>
      </div>

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
                <CheckCircle className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completados</p>
                <p className="text-2xl font-bold text-foreground">{stats.completed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                <XCircle className="w-6 h-6 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Cancelados</p>
                <p className="text-2xl font-bold text-foreground">{stats.cancelled}</p>
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
                <p className="text-sm text-muted-foreground">Proximos</p>
                <p className="text-2xl font-bold text-foreground">{stats.upcoming}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Proximos Turnos</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => router.push('/patient/turnos')}>
            Ver todos
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </CardHeader>
        <CardContent>
          {upcomingAppointments.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground">No tienes turnos proximos</p>
              <Button className="mt-4" onClick={() => router.push('/patient/solicitar')}>
                Solicitar Turno
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingAppointments.map((appointment) => {
                const doctor = getDoctor(appointment.doctorId)
                const specialty = getSpecialty(appointment.specialtyId)
                const status = statusConfig[appointment.status]
                const appointmentDate = new Date(appointment.date + 'T12:00:00')
                
                return (
                  <div
                    key={appointment.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-muted/50 gap-4"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-xl bg-primary/10 flex flex-col items-center justify-center text-primary">
                        <span className="text-lg font-bold leading-none">
                          {format(appointmentDate, 'd')}
                        </span>
                        <span className="text-xs uppercase">
                          {format(appointmentDate, 'MMM', { locale: es })}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{doctor?.name}</p>
                        <p className="text-sm text-muted-foreground">{specialty?.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">{appointment.time}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={status.variant}>{status.label}</Badge>
                      <span className="text-sm font-mono text-muted-foreground">
                        #{appointment.ticketNumber}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
