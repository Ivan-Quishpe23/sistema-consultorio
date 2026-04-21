'use client'

import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Calendar, Users, Clock, UserPlus, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useStore } from '@/lib/store'

const statusConfig = {
  scheduled: { label: 'Programado', variant: 'secondary' as const },
  waiting: { label: 'En Espera', variant: 'default' as const },
  in_consultation: { label: 'En Consulta', variant: 'default' as const },
  completed: { label: 'Atendido', variant: 'secondary' as const },
  cancelled: { label: 'Cancelado', variant: 'destructive' as const },
  absent: { label: 'Ausente', variant: 'destructive' as const },
}

export default function ReceptionistDashboard() {
  const router = useRouter()
  const store = useStore()
  
  const today = new Date().toISOString().split('T')[0]
  const todayAppointments = store.appointments.filter(a => a.date === today)
  
  const stats = {
    total: todayAppointments.length,
    waiting: todayAppointments.filter(a => a.status === 'waiting').length,
    inConsultation: todayAppointments.filter(a => a.status === 'in_consultation').length,
    completed: todayAppointments.filter(a => a.status === 'completed').length,
  }

  const upcomingAppointments = todayAppointments
    .filter(a => a.status === 'scheduled' || a.status === 'waiting')
    .sort((a, b) => a.time.localeCompare(b.time))
    .slice(0, 10)

  const getPatient = (patientId: string) => store.patients.find(p => p.id === patientId)
  const getDoctor = (doctorId: string) => store.doctors.find(d => d.id === doctorId)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Panel de Recepción</h2>
          <p className="text-muted-foreground">
            {format(new Date(), "EEEE d 'de' MMMM, yyyy", { locale: es })}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push('/receptionist/pacientes')}>
            <UserPlus className="w-4 h-4 mr-2" />
            Nuevo Paciente
          </Button>
          <Button onClick={() => router.push('/receptionist/nuevo-turno')}>
            <Calendar className="w-4 h-4 mr-2" />
            Nuevo Turno
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Turnos Hoy</p>
                <p className="text-2xl font-bold text-foreground">{stats.total}</p>
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
                <p className="text-sm text-muted-foreground">En Espera</p>
                <p className="text-2xl font-bold text-foreground">{stats.waiting}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">En Consulta</p>
                <p className="text-2xl font-bold text-foreground">{stats.inConsultation}</p>
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
                <p className="text-2xl font-bold text-foreground">{stats.completed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Turnos Pendientes</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => router.push('/receptionist/buscar')}>
              Ver todos
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardHeader>
          <CardContent>
            {upcomingAppointments.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-muted-foreground">No hay turnos pendientes</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingAppointments.map((appointment) => {
                  const patient = getPatient(appointment.patientId)
                  const doctor = getDoctor(appointment.doctorId)
                  const status = statusConfig[appointment.status]
                  
                  return (
                    <div
                      key={appointment.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-center">
                          <p className="text-lg font-bold text-primary">{appointment.time}</p>
                          <p className="text-xs text-muted-foreground font-mono">#{appointment.ticketNumber}</p>
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{patient?.fullName}</p>
                          <p className="text-sm text-muted-foreground">{doctor?.name}</p>
                        </div>
                      </div>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Médicos Activos Hoy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {store.doctors.filter(d => d.active).map((doctor) => {
                const specialty = store.specialties.find(s => s.id === doctor.specialtyId)
                const doctorAppointments = todayAppointments.filter(a => a.doctorId === doctor.id)
                const currentPatient = doctorAppointments.find(a => a.status === 'in_consultation')
                const waitingCount = doctorAppointments.filter(a => a.status === 'waiting').length
                
                return (
                  <div
                    key={doctor.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                        {doctor.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{doctor.name}</p>
                        <p className="text-sm text-muted-foreground">{specialty?.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">{doctor.consultRoom}</p>
                      <Badge variant={currentPatient ? 'default' : 'secondary'}>
                        {currentPatient ? 'Atendiendo' : `${waitingCount} esperando`}
                      </Badge>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
