'use client'

import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Users, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useStore } from '@/lib/store'

const statusConfig = {
  scheduled: { label: 'Programado', variant: 'secondary' as const, icon: Clock },
  waiting: { label: 'En Espera', variant: 'default' as const, icon: Clock },
  in_consultation: { label: 'En Consulta', variant: 'default' as const, icon: Users },
  completed: { label: 'Atendido', variant: 'secondary' as const, icon: CheckCircle },
  cancelled: { label: 'Cancelado', variant: 'destructive' as const, icon: XCircle },
  absent: { label: 'Ausente', variant: 'destructive' as const, icon: AlertCircle },
}

export default function DoctorPatients() {
  const store = useStore()
  const doctor = store.doctors.find(d => d.userId === store.currentUser?.id)
  const today = new Date().toISOString().split('T')[0]
  const todayAppointments = doctor 
    ? store.getDoctorAppointments(doctor.id, today)
    : []

  const getPatient = (patientId: string) => store.patients.find(p => p.id === patientId)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Pacientes del Dia</h2>
        <p className="text-muted-foreground">
          {format(new Date(), "EEEE d 'de' MMMM, yyyy", { locale: es })}
        </p>
      </div>

      {todayAppointments.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
            <p className="text-muted-foreground">No tienes pacientes programados para hoy</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Lista de Pacientes ({todayAppointments.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Turno</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Hora</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Paciente</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Cedula</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Telefono</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {todayAppointments.map((appointment) => {
                    const patient = getPatient(appointment.patientId)
                    const status = statusConfig[appointment.status]
                    const StatusIcon = status.icon
                    
                    return (
                      <tr key={appointment.id} className="border-b border-border last:border-0">
                        <td className="py-3 px-4">
                          <span className="font-mono font-semibold text-primary">
                            #{appointment.ticketNumber}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-foreground">{appointment.time}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-semibold">
                              {patient?.fullName.charAt(0)}
                            </div>
                            <span className="font-medium text-foreground">{patient?.fullName}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">{patient?.cedula}</td>
                        <td className="py-3 px-4 text-muted-foreground">{patient?.phone}</td>
                        <td className="py-3 px-4">
                          <Badge variant={status.variant} className="gap-1">
                            <StatusIcon className="w-3 h-3" />
                            {status.label}
                          </Badge>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
