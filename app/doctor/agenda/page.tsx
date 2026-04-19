'use client'

import { useState } from 'react'
import { format, addDays, startOfWeek, isSameDay } from 'date-fns'
import { es } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useStore } from '@/lib/store'
import { cn } from '@/lib/utils'

export default function DoctorAgenda() {
  const store = useStore()
  const [currentDate, setCurrentDate] = useState(new Date())
  
  const doctor = store.doctors.find(d => d.userId === store.currentUser?.id)
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  const getAppointmentsForDate = (date: Date) => {
    if (!doctor) return []
    const dateStr = format(date, 'yyyy-MM-dd')
    return store.getDoctorAppointments(doctor.id, dateStr)
  }

  const getPatient = (patientId: string) => store.patients.find(p => p.id === patientId)

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => addDays(prev, direction === 'next' ? 7 : -7))
  }

  const statusColors = {
    scheduled: 'bg-secondary text-secondary-foreground',
    waiting: 'bg-warning/20 text-warning border border-warning/30',
    in_consultation: 'bg-primary/20 text-primary border border-primary/30',
    completed: 'bg-success/20 text-success border border-success/30',
    cancelled: 'bg-destructive/20 text-destructive border border-destructive/30',
    absent: 'bg-destructive/20 text-destructive border border-destructive/30',
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Mi Agenda</h2>
          <p className="text-muted-foreground">Vista semanal de tus citas</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => navigateWeek('prev')}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm font-medium min-w-[200px] text-center">
            {format(weekStart, "d MMM", { locale: es })} - {format(addDays(weekStart, 6), "d MMM yyyy", { locale: es })}
          </span>
          <Button variant="outline" size="icon" onClick={() => navigateWeek('next')}>
            <ChevronRight className="w-4 h-4" />
          </Button>
          <Button variant="outline" onClick={() => setCurrentDate(new Date())}>
            Hoy
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="grid grid-cols-7 border-b border-border">
            {weekDays.map((day) => {
              const isToday = isSameDay(day, new Date())
              const dayOfWeek = day.getDay()
              const isWorkDay = doctor?.workDays.includes(dayOfWeek)
              
              return (
                <div
                  key={day.toISOString()}
                  className={cn(
                    'p-3 text-center border-r border-border last:border-r-0',
                    isToday && 'bg-primary/5',
                    !isWorkDay && 'bg-muted/50'
                  )}
                >
                  <p className="text-xs text-muted-foreground uppercase">
                    {format(day, 'EEE', { locale: es })}
                  </p>
                  <p className={cn(
                    'text-lg font-semibold',
                    isToday ? 'text-primary' : 'text-foreground'
                  )}>
                    {format(day, 'd')}
                  </p>
                  {!isWorkDay && (
                    <Badge variant="secondary" className="text-xs mt-1">No laboral</Badge>
                  )}
                </div>
              )
            })}
          </div>
          <div className="grid grid-cols-7 min-h-[400px]">
            {weekDays.map((day) => {
              const appointments = getAppointmentsForDate(day)
              const dayOfWeek = day.getDay()
              const isWorkDay = doctor?.workDays.includes(dayOfWeek)
              const isToday = isSameDay(day, new Date())
              
              return (
                <div
                  key={day.toISOString()}
                  className={cn(
                    'border-r border-border last:border-r-0 p-2',
                    isToday && 'bg-primary/5',
                    !isWorkDay && 'bg-muted/30'
                  )}
                >
                  {appointments.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-4">
                      {isWorkDay ? 'Sin citas' : ''}
                    </p>
                  ) : (
                    <div className="space-y-1">
                      {appointments.map((appointment) => {
                        const patient = getPatient(appointment.patientId)
                        return (
                          <div
                            key={appointment.id}
                            className={cn(
                              'p-2 rounded-lg text-xs',
                              statusColors[appointment.status]
                            )}
                          >
                            <p className="font-semibold truncate">{appointment.time}</p>
                            <p className="truncate">{patient?.fullName}</p>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-4 justify-center">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-secondary" />
          <span className="text-sm text-muted-foreground">Programado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-warning/20 border border-warning/30" />
          <span className="text-sm text-muted-foreground">En Espera</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-primary/20 border border-primary/30" />
          <span className="text-sm text-muted-foreground">En Consulta</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-success/20 border border-success/30" />
          <span className="text-sm text-muted-foreground">Completado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-destructive/20 border border-destructive/30" />
          <span className="text-sm text-muted-foreground">Cancelado/Ausente</span>
        </div>
      </div>
    </div>
  )
}
