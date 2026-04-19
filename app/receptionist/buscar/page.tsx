'use client'

import { useState } from 'react'
import { format, addHours, isBefore } from 'date-fns'
import { es } from 'date-fns/locale'
import { Search, Calendar, X, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useStore } from '@/lib/store'

const statusConfig = {
  scheduled: { label: 'Programado', variant: 'secondary' as const },
  waiting: { label: 'En Espera', variant: 'default' as const },
  in_consultation: { label: 'En Consulta', variant: 'default' as const },
  completed: { label: 'Atendido', variant: 'secondary' as const },
  cancelled: { label: 'Cancelado', variant: 'destructive' as const },
  absent: { label: 'Ausente', variant: 'destructive' as const },
}

export default function SearchAppointmentsPage() {
  const store = useStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [doctorFilter, setDoctorFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [cancelDialog, setCancelDialog] = useState<string | null>(null)
  const [isCancelling, setIsCancelling] = useState(false)

  let filteredAppointments = [...store.appointments]

  if (searchQuery) {
    const query = searchQuery.toLowerCase()
    filteredAppointments = filteredAppointments.filter(a => {
      const patient = store.patients.find(p => p.id === a.patientId)
      return (
        patient?.fullName.toLowerCase().includes(query) ||
        patient?.cedula.includes(query) ||
        a.ticketNumber.toLowerCase().includes(query)
      )
    })
  }

  if (dateFilter) {
    filteredAppointments = filteredAppointments.filter(a => a.date === dateFilter)
  }

  if (doctorFilter !== 'all') {
    filteredAppointments = filteredAppointments.filter(a => a.doctorId === doctorFilter)
  }

  if (statusFilter !== 'all') {
    filteredAppointments = filteredAppointments.filter(a => a.status === statusFilter)
  }

  filteredAppointments.sort((a, b) => {
    if (a.date !== b.date) return b.date.localeCompare(a.date)
    return a.time.localeCompare(b.time)
  })

  const getPatient = (patientId: string) => store.patients.find(p => p.id === patientId)
  const getDoctor = (doctorId: string) => store.doctors.find(d => d.id === doctorId)
  const getSpecialty = (specialtyId: string) => store.specialties.find(s => s.id === specialtyId)

  const canCancel = (appointment: typeof store.appointments[0]) => {
    return appointment.status === 'scheduled' || appointment.status === 'waiting'
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
    ? store.appointments.find(a => a.id === cancelDialog) 
    : null

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Buscar Turnos</h2>
        <p className="text-muted-foreground">Busca y gestiona los turnos del sistema</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Nombre, cedula o # turno"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Fecha</Label>
              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Medico</Label>
              <Select value={doctorFilter} onValueChange={setDoctorFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
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
            <div className="space-y-2">
              <Label>Estado</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="scheduled">Programado</SelectItem>
                  <SelectItem value="waiting">En Espera</SelectItem>
                  <SelectItem value="in_consultation">En Consulta</SelectItem>
                  <SelectItem value="completed">Atendido</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                  <SelectItem value="absent">Ausente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Resultados ({filteredAppointments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredAppointments.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground">No se encontraron turnos</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Turno</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Fecha</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Hora</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Paciente</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Medico</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Estado</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAppointments.map((appointment) => {
                    const patient = getPatient(appointment.patientId)
                    const doctor = getDoctor(appointment.doctorId)
                    const specialty = getSpecialty(appointment.specialtyId)
                    const status = statusConfig[appointment.status]
                    
                    return (
                      <tr key={appointment.id} className="border-b border-border last:border-0">
                        <td className="py-3 px-4">
                          <span className="font-mono font-semibold text-primary">
                            #{appointment.ticketNumber}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-foreground">
                          {format(new Date(appointment.date + 'T12:00:00'), "d MMM yyyy", { locale: es })}
                        </td>
                        <td className="py-3 px-4 text-foreground">{appointment.time}</td>
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium text-foreground">{patient?.fullName}</p>
                            <p className="text-sm text-muted-foreground">{patient?.cedula}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium text-foreground">{doctor?.name}</p>
                            <p className="text-sm text-muted-foreground">{specialty?.name}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={status.variant}>{status.label}</Badge>
                        </td>
                        <td className="py-3 px-4">
                          {canCancel(appointment) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() => setCancelDialog(appointment.id)}
                            >
                              <X className="w-4 h-4 mr-1" />
                              Cancelar
                            </Button>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

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
              <p className="font-semibold">{getPatient(appointmentToCancel.patientId)?.fullName}</p>
              <p className="text-sm text-muted-foreground">
                {format(new Date(appointmentToCancel.date + 'T12:00:00'), "d 'de' MMMM, yyyy", { locale: es })} - {appointmentToCancel.time}
              </p>
              <p className="text-sm text-muted-foreground">{getDoctor(appointmentToCancel.doctorId)?.name}</p>
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
