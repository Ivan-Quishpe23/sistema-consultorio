'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Users, UserCheck, Clock, PlayCircle, CheckCircle, AlertCircle } from 'lucide-react'
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
import { useStore } from '@/lib/store'
import { cn } from '@/lib/utils'

export default function DoctorQueue() {
  const store = useStore()
  const [isCallingNext, setIsCallingNext] = useState(false)
  const [markAbsentDialog, setMarkAbsentDialog] = useState<string | null>(null)
  
  const doctor = store.doctors.find(d => d.userId === store.currentUser?.id)
  const queue = doctor ? store.getDoctorQueue(doctor.id) : []
  const currentPatient = queue.find(a => a.status === 'in_consultation')
  const waitingPatients = queue.filter(a => a.status === 'waiting')

  const getPatient = (patientId: string) => store.patients.find(p => p.id === patientId)

  const handleCallNext = async () => {
    if (!doctor) return
    setIsCallingNext(true)
    await new Promise(resolve => setTimeout(resolve, 500))
    store.callNextPatient(doctor.id)
    setIsCallingNext(false)
  }

  const handleMarkAbsent = async () => {
    if (!markAbsentDialog) return
    store.updateAppointment(markAbsentDialog, { status: 'absent' })
    setMarkAbsentDialog(null)
  }

  const handleFinishConsultation = () => {
    if (!currentPatient) return
    store.updateAppointment(currentPatient.id, { status: 'completed', attendedAt: new Date() })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Mi Cola de Atencion</h2>
          <p className="text-muted-foreground">
            {format(new Date(), "EEEE d 'de' MMMM, yyyy", { locale: es })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-base px-3 py-1">
            <Users className="w-4 h-4 mr-2" />
            {waitingPatients.length} en espera
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className={cn(
            'border-2',
            currentPatient ? 'border-primary' : 'border-border'
          )}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-primary" />
                En Consulta Ahora
              </CardTitle>
            </CardHeader>
            <CardContent>
              {currentPatient ? (
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold">
                      {getPatient(currentPatient.patientId)?.fullName.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-primary">
                          #{currentPatient.ticketNumber}
                        </span>
                        <Badge>En Consulta</Badge>
                      </div>
                      <p className="text-xl font-semibold text-foreground mt-1">
                        {getPatient(currentPatient.patientId)?.fullName}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span>Cedula: {getPatient(currentPatient.patientId)?.cedula}</span>
                        <span>Hora cita: {currentPatient.time}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button 
                      className="flex-1" 
                      variant="outline"
                      onClick={() => setMarkAbsentDialog(currentPatient.id)}
                    >
                      <AlertCircle className="w-4 h-4 mr-2" />
                      Marcar Ausente
                    </Button>
                    <Button className="flex-1" onClick={handleFinishConsultation}>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Finalizar Consulta
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <UserCheck className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">No hay paciente en consulta</p>
                  <Button 
                    onClick={handleCallNext} 
                    disabled={isCallingNext || waitingPatients.length === 0}
                  >
                    <PlayCircle className="w-4 h-4 mr-2" />
                    {isCallingNext ? 'Llamando...' : 'Llamar Siguiente'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Pacientes en Espera</CardTitle>
              {currentPatient && waitingPatients.length > 0 && (
                <Button onClick={handleCallNext} disabled={isCallingNext}>
                  <PlayCircle className="w-4 h-4 mr-2" />
                  {isCallingNext ? 'Llamando...' : 'Llamar Siguiente'}
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {waitingPatients.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                  <p className="text-muted-foreground">No hay pacientes en espera</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {waitingPatients.map((appointment, index) => {
                    const patient = getPatient(appointment.patientId)
                    return (
                      <div
                        key={appointment.id}
                        className={cn(
                          'flex items-center justify-between p-4 rounded-xl',
                          index === 0 ? 'bg-primary/5 border-2 border-primary/20' : 'bg-muted/50'
                        )}
                      >
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            'w-10 h-10 rounded-lg flex items-center justify-center font-bold',
                            index === 0 
                              ? 'bg-primary text-primary-foreground' 
                              : 'bg-muted-foreground/20 text-muted-foreground'
                          )}>
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">{patient?.fullName}</p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock className="w-3.5 h-3.5" />
                              {appointment.time}
                              <span className="font-mono">#{appointment.ticketNumber}</span>
                            </div>
                          </div>
                        </div>
                        {index === 0 && (
                          <Badge variant="secondary">Siguiente</Badge>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Resumen del Dia</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {doctor && (() => {
                const today = new Date().toISOString().split('T')[0]
                const todayAppointments = store.getDoctorAppointments(doctor.id, today)
                const completed = todayAppointments.filter(a => a.status === 'completed').length
                const absent = todayAppointments.filter(a => a.status === 'absent').length
                const cancelled = todayAppointments.filter(a => a.status === 'cancelled').length
                const total = todayAppointments.length
                
                return (
                  <>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <span className="text-muted-foreground">Total turnos</span>
                      <span className="font-bold text-foreground">{total}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-success/10">
                      <span className="text-success">Atendidos</span>
                      <span className="font-bold text-success">{completed}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-warning/10">
                      <span className="text-warning">En espera</span>
                      <span className="font-bold text-warning">{waitingPatients.length}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-destructive/10">
                      <span className="text-destructive">Ausentes</span>
                      <span className="font-bold text-destructive">{absent}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <span className="text-muted-foreground">Cancelados</span>
                      <span className="font-bold text-muted-foreground">{cancelled}</span>
                    </div>
                  </>
                )
              })()}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Informacion</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Consultorio</p>
                <p className="font-semibold text-foreground">{doctor?.consultRoom}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Horario</p>
                <p className="font-semibold text-foreground">{doctor?.startTime} - {doctor?.endTime}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Duracion consulta</p>
                <p className="font-semibold text-foreground">{doctor?.consultationDuration} minutos</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={!!markAbsentDialog} onOpenChange={(open) => !open && setMarkAbsentDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Marcar como Ausente</DialogTitle>
            <DialogDescription>
              El paciente sera marcado como ausente y el turno finalizara. Esta accion no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMarkAbsentDialog(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleMarkAbsent}>
              Confirmar Ausencia
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
