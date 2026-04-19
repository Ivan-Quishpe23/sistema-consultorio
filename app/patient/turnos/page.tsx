'use client'

import { useState } from 'react'
import { format, isBefore, addHours } from 'date-fns'
import { es } from 'date-fns/locale'
import { Calendar, Clock, X, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useStore } from '@/lib/store'

const statusConfig = {
  scheduled: { label: 'Programado', variant: 'secondary' as const },
  waiting: { label: 'En Espera', variant: 'default' as const },
  in_consultation: { label: 'En Consulta', variant: 'default' as const },
  completed: { label: 'Completado', variant: 'secondary' as const },
  cancelled: { label: 'Cancelado', variant: 'destructive' as const },
  absent: { label: 'Ausente', variant: 'destructive' as const },
}

export default function PatientAppointments() {
  const store = useStore()
  const [filter, setFilter] = useState<string>('all')
  const [cancelDialog, setCancelDialog] = useState<string | null>(null)
  const [isCancelling, setIsCancelling] = useState(false)
  
  const patient = store.patients.find(p => p.userId === store.currentUser?.id)
  const allAppointments = patient ? store.getPatientAppointments(patient.id) : []
  
  const filteredAppointments = allAppointments
    .filter(a => filter === 'all' || a.status === filter)
    .sort((a, b) => {
      if (a.date !== b.date) return b.date.localeCompare(a.date)
      return b.time.localeCompare(a.time)
    })

  const getDoctor = (doctorId: string) => store.doctors.find(d => d.id === doctorId)
  const getSpecialty = (specialtyId: string) => store.specialties.find(s => s.id === specialtyId)

  const canCancel = (appointment: typeof allAppointments[0]) => {
    if (appointment.status !== 'scheduled' && appointment.status !== 'waiting') return false
    const appointmentDateTime = new Date(`${appointment.date}T${appointment.time}`)
    const oneHourBefore = addHours(appointmentDateTime, -1)
    return isBefore(new Date(), oneHourBefore)
  }

  const handleCancel = async () => {
    if (!cancelDialog || !store.currentUser) return
    setIsCancelling(true)
    await new Promise(resolve => setTimeout(resolve, 500))
    store.cancelAppointment(cancelDialog, store.currentUser.id)
    setIsCancelling(false)
    setCancelDialog(null)
  }

  const appointmentToCancel = cancelDialog 
    ? allAppointments.find(a => a.id === cancelDialog) 
    : null

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Mis Turnos</h2>
          <p className="text-muted-foreground">Historial de todas tus citas medicas</p>
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="scheduled">Programados</SelectItem>
            <SelectItem value="waiting">En Espera</SelectItem>
            <SelectItem value="completed">Completados</SelectItem>
            <SelectItem value="cancelled">Cancelados</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredAppointments.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
            <p className="text-muted-foreground">
              {filter === 'all' 
                ? 'No tienes turnos registrados'
                : 'No hay turnos con este estado'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredAppointments.map((appointment) => {
            const doctor = getDoctor(appointment.doctorId)
            const specialty = getSpecialty(appointment.specialtyId)
            const status = statusConfig[appointment.status]
            const appointmentDate = new Date(appointment.date + 'T12:00:00')
            
            return (
              <Card key={appointment.id}>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-xl bg-primary/10 flex flex-col items-center justify-center text-primary shrink-0">
                        <span className="text-lg font-bold leading-none">
                          {format(appointmentDate, 'd')}
                        </span>
                        <span className="text-xs uppercase">
                          {format(appointmentDate, 'MMM', { locale: es })}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-foreground">{doctor?.name}</p>
                          <Badge variant={status.variant}>{status.label}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{specialty?.name}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {appointment.time}
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="font-mono">#{appointment.ticketNumber}</span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{doctor?.consultRoom}</p>
                      </div>
                    </div>
                    {canCancel(appointment) && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:text-destructive shrink-0"
                        onClick={() => setCancelDialog(appointment.id)}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancelar
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <Dialog open={!!cancelDialog} onOpenChange={(open) => !open && setCancelDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancelar Turno</DialogTitle>
            <DialogDescription>
              Esta accion no se puede deshacer. El horario quedara disponible para otros pacientes.
            </DialogDescription>
          </DialogHeader>
          {appointmentToCancel && (
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="font-semibold">{getDoctor(appointmentToCancel.doctorId)?.name}</p>
              <p className="text-sm text-muted-foreground">
                {format(new Date(appointmentToCancel.date + 'T12:00:00'), "d 'de' MMMM, yyyy", { locale: es })} - {appointmentToCancel.time}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialog(null)}>
              No, mantener turno
            </Button>
            <Button variant="destructive" onClick={handleCancel} disabled={isCancelling}>
              {isCancelling ? 'Cancelando...' : 'Si, cancelar turno'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
