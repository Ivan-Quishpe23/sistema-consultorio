'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { format, addDays, isBefore, startOfDay } from 'date-fns'
import { es } from 'date-fns/locale'
import { Calendar, Clock, User, CheckCircle, ArrowLeft, ArrowRight, MapPin } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useStore } from '@/lib/store'
import { cn } from '@/lib/utils'

type Step = 'specialty' | 'doctor' | 'datetime' | 'confirm'

export default function BookingPage() {
  const router = useRouter()
  const store = useStore()
  
  const [step, setStep] = useState<Step>('specialty')
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null)
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [bookingComplete, setBookingComplete] = useState(false)
  const [newAppointment, setNewAppointment] = useState<{ ticketNumber: string } | null>(null)

  const patient = store.patients.find(p => p.userId === store.currentUser?.id)
  const activeSpecialties = store.specialties.filter(s => s.active)
  const availableDoctors = selectedSpecialty ? store.getDoctorsBySpecialty(selectedSpecialty) : []
  
  const selectedDoctorData = store.doctors.find(d => d.id === selectedDoctor)
  const selectedSpecialtyData = store.specialties.find(s => s.id === selectedSpecialty)

  const today = startOfDay(new Date())
  const nextDays = Array.from({ length: 14 }, (_, i) => addDays(today, i))
  
  const availableSlots = selectedDoctor && selectedDate
    ? store.getAvailableSlots(selectedDoctor, selectedDate)
    : []

  const hasExistingAppointment = () => {
    if (!patient || !selectedDoctor) return false
    return store.appointments.some(
      a => a.patientId === patient.id && 
           a.doctorId === selectedDoctor && 
           (a.status === 'scheduled' || a.status === 'waiting')
    )
  }

  const handleSubmit = async () => {
    if (!patient || !selectedSpecialty || !selectedDoctor || !selectedDate || !selectedTime) return
    
    if (hasExistingAppointment()) {
      alert('Ya tienes un turno activo con este medico')
      return
    }

    setIsSubmitting(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const appointment = store.addAppointment({
      patientId: patient.id,
      doctorId: selectedDoctor,
      specialtyId: selectedSpecialty,
      date: selectedDate,
      time: selectedTime,
      status: 'scheduled',
    })
    
    setNewAppointment(appointment)
    setBookingComplete(true)
    setIsSubmitting(false)
  }

  const steps = [
    { key: 'specialty', label: 'Especialidad', icon: Calendar },
    { key: 'doctor', label: 'Medico', icon: User },
    { key: 'datetime', label: 'Fecha y Hora', icon: Clock },
    { key: 'confirm', label: 'Confirmar', icon: CheckCircle },
  ]

  const currentStepIndex = steps.findIndex(s => s.key === step)

  if (bookingComplete && newAppointment) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Turno Confirmado</h2>
            <p className="text-muted-foreground mb-6">
              Tu turno ha sido registrado exitosamente
            </p>
            
            <div className="bg-muted/50 rounded-xl p-6 mb-6 text-left">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Numero de Turno</p>
                  <p className="font-bold text-xl text-primary">#{newAppointment.ticketNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Fecha</p>
                  <p className="font-semibold">
                    {selectedDate && format(new Date(selectedDate + 'T12:00:00'), "d 'de' MMMM, yyyy", { locale: es })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Hora</p>
                  <p className="font-semibold">{selectedTime}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Medico</p>
                  <p className="font-semibold">{selectedDoctorData?.name}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Consultorio</p>
                  <p className="font-semibold">{selectedDoctorData?.consultRoom}</p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button className="flex-1" onClick={() => router.push('/patient/turnos')}>
                Ver Mis Turnos
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => router.push('/patient')}>
                Volver al Inicio
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Solicitar Turno</h2>
          <p className="text-muted-foreground">Completa los pasos para agendar tu cita</p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-8 overflow-x-auto pb-2">
        {steps.map((s, i) => (
          <div key={s.key} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center transition-colors',
                  i <= currentStepIndex
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                <s.icon className="w-5 h-5" />
              </div>
              <span className={cn(
                'text-xs mt-1 whitespace-nowrap',
                i <= currentStepIndex ? 'text-foreground font-medium' : 'text-muted-foreground'
              )}>
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={cn(
                  'w-12 sm:w-24 h-0.5 mx-2',
                  i < currentStepIndex ? 'bg-primary' : 'bg-muted'
                )}
              />
            )}
          </div>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {step === 'specialty' && 'Selecciona una Especialidad'}
            {step === 'doctor' && 'Selecciona un Medico'}
            {step === 'datetime' && 'Selecciona Fecha y Hora'}
            {step === 'confirm' && 'Confirma tu Turno'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {step === 'specialty' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeSpecialties.map((specialty) => (
                <button
                  key={specialty.id}
                  onClick={() => {
                    setSelectedSpecialty(specialty.id)
                    setSelectedDoctor(null)
                    setSelectedDate(null)
                    setSelectedTime(null)
                    setStep('doctor')
                  }}
                  className={cn(
                    'p-4 rounded-xl border-2 text-left transition-all hover:border-primary',
                    selectedSpecialty === specialty.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border'
                  )}
                >
                  <p className="font-semibold text-foreground">{specialty.name}</p>
                  <p className="text-sm text-muted-foreground mt-1">{specialty.description}</p>
                </button>
              ))}
            </div>
          )}

          {step === 'doctor' && (
            <div className="space-y-4">
              {availableDoctors.length === 0 ? (
                <div className="text-center py-8">
                  <User className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                  <p className="text-muted-foreground">No hay medicos disponibles para esta especialidad</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {availableDoctors.map((doctor) => (
                    <button
                      key={doctor.id}
                      onClick={() => {
                        setSelectedDoctor(doctor.id)
                        setSelectedDate(null)
                        setSelectedTime(null)
                        setStep('datetime')
                      }}
                      className={cn(
                        'p-4 rounded-xl border-2 text-left transition-all hover:border-primary',
                        selectedDoctor === doctor.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border'
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                          {doctor.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{doctor.name}</p>
                          <p className="text-sm text-muted-foreground">{selectedSpecialtyData?.name}</p>
                          <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                            <MapPin className="w-3 h-3" />
                            {doctor.consultRoom}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              <Button variant="outline" onClick={() => setStep('specialty')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
            </div>
          )}

          {step === 'datetime' && (
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-medium text-foreground mb-3">Selecciona una fecha</h4>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {nextDays.map((date) => {
                    const dateStr = format(date, 'yyyy-MM-dd')
                    const dayOfWeek = date.getDay()
                    const isWorkDay = selectedDoctorData?.workDays.includes(dayOfWeek)
                    const hasException = store.exceptions.some(
                      e => e.doctorId === selectedDoctor && e.date === dateStr
                    )
                    const isAvailable = isWorkDay && !hasException
                    
                    return (
                      <button
                        key={dateStr}
                        disabled={!isAvailable}
                        onClick={() => {
                          setSelectedDate(dateStr)
                          setSelectedTime(null)
                        }}
                        className={cn(
                          'flex flex-col items-center p-3 rounded-xl min-w-[70px] transition-all',
                          !isAvailable && 'opacity-40 cursor-not-allowed',
                          selectedDate === dateStr
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted hover:bg-muted/80'
                        )}
                      >
                        <span className="text-xs uppercase">
                          {format(date, 'EEE', { locale: es })}
                        </span>
                        <span className="text-lg font-bold">{format(date, 'd')}</span>
                        <span className="text-xs">{format(date, 'MMM', { locale: es })}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {selectedDate && (
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-3">Selecciona un horario</h4>
                  {availableSlots.filter(s => s.available).length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">
                      No hay horarios disponibles para esta fecha
                    </p>
                  ) : (
                    <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2">
                      {availableSlots.map((slot) => (
                        <button
                          key={slot.time}
                          disabled={!slot.available}
                          onClick={() => setSelectedTime(slot.time)}
                          className={cn(
                            'py-2 px-3 rounded-lg text-sm font-medium transition-all',
                            !slot.available && 'opacity-40 cursor-not-allowed line-through',
                            selectedTime === slot.time
                              ? 'bg-primary text-primary-foreground'
                              : slot.available
                                ? 'bg-muted hover:bg-muted/80'
                                : 'bg-muted/50'
                          )}
                        >
                          {slot.time}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep('doctor')}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver
                </Button>
                <Button
                  disabled={!selectedDate || !selectedTime}
                  onClick={() => setStep('confirm')}
                  className="flex-1"
                >
                  Continuar
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {step === 'confirm' && (
            <div className="space-y-6">
              <div className="bg-muted/50 rounded-xl p-6">
                <h4 className="text-sm font-medium text-muted-foreground mb-4">Resumen de tu turno</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Especialidad</p>
                    <p className="font-semibold text-foreground">{selectedSpecialtyData?.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Medico</p>
                    <p className="font-semibold text-foreground">{selectedDoctorData?.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Fecha</p>
                    <p className="font-semibold text-foreground">
                      {selectedDate && format(new Date(selectedDate + 'T12:00:00'), "EEEE d 'de' MMMM, yyyy", { locale: es })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Hora</p>
                    <p className="font-semibold text-foreground">{selectedTime}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-sm text-muted-foreground">Consultorio</p>
                    <p className="font-semibold text-foreground">{selectedDoctorData?.consultRoom}</p>
                  </div>
                </div>
              </div>

              {hasExistingAppointment() && (
                <div className="bg-destructive/10 text-destructive rounded-xl p-4">
                  Ya tienes un turno activo con este medico. No puedes solicitar otro hasta que el actual sea atendido o cancelado.
                </div>
              )}

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep('datetime')}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleSubmit}
                  disabled={isSubmitting || hasExistingAppointment()}
                >
                  {isSubmitting ? 'Confirmando...' : 'Confirmar Turno'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
