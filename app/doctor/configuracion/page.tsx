'use client'

import { Clock, MapPin, Calendar, Stethoscope } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useStore } from '@/lib/store'

const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado']

export default function DoctorConfig() {
  const store = useStore()
  const doctor = store.doctors.find(d => d.userId === store.currentUser?.id)
  const specialty = doctor ? store.specialties.find(s => s.id === doctor.specialtyId) : null
  const exceptions = doctor ? store.exceptions.filter(e => e.doctorId === doctor.id) : []

  if (!doctor) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">No se encontro la informacion del medico</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Mi Configuracion</h2>
        <p className="text-muted-foreground">Informacion de tu agenda y consultorio</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-primary" />
              Informacion Profesional
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Nombre</p>
              <p className="font-semibold text-foreground">{doctor.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Especialidad</p>
              <p className="font-semibold text-foreground">{specialty?.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Consultorio</p>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <p className="font-semibold text-foreground">{doctor.consultRoom}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Horario de Atencion
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Horario</p>
              <p className="font-semibold text-foreground">{doctor.startTime} - {doctor.endTime}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Duracion de Consulta</p>
              <p className="font-semibold text-foreground">{doctor.consultationDuration} minutos</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Dias Laborables</p>
              <div className="flex flex-wrap gap-2">
                {dayNames.map((day, index) => (
                  <Badge
                    key={day}
                    variant={doctor.workDays.includes(index) ? 'default' : 'secondary'}
                    className={!doctor.workDays.includes(index) ? 'opacity-50' : ''}
                  >
                    {day.slice(0, 3)}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Excepciones de Agenda
            </CardTitle>
          </CardHeader>
          <CardContent>
            {exceptions.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No tienes excepciones programadas (vacaciones, feriados)
              </p>
            ) : (
              <div className="space-y-2">
                {exceptions.map((exception) => (
                  <div
                    key={exception.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div>
                      <p className="font-medium text-foreground">{exception.date}</p>
                      <p className="text-sm text-muted-foreground">{exception.reason}</p>
                    </div>
                    <Badge variant="secondary">No disponible</Badge>
                  </div>
                ))}
              </div>
            )}
            <p className="text-sm text-muted-foreground mt-4">
              Para modificar tu configuracion o agregar excepciones, contacta al administrador.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
