'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { format, addDays, startOfDay } from 'date-fns'
import { es } from 'date-fns/locale'
import { Search, Calendar, Clock, User, CheckCircle, ArrowLeft, ArrowRight, MapPin } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useStore } from '@/lib/store'
import { cn } from '@/lib/utils'

type Step = 'patient' | 'specialty' | 'doctor' | 'datetime' | 'confirm'

export default function NewAppointmentPage() {
  const router = useRouter()
  const store = useStore()
  
  const [step, setStep] = useState<Step>('patient')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null)
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null)
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [bookingComplete, setBookingComplete] = useState(false)
  const [newAppointment, setNewAppointment] = useState<{ ticketNumber: string } | null>(null)

  const filteredPatients = store.patients.filter(
    p => p.active && (
      p.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.cedula.includes(searchQuery)
    )
  )

  const activeSpecialties = store.specialties.filter(s => s.active)
  const availableDoctors = selectedSpecialty ? store.getDoctorsBySpecialty(selectedSpecialty) : []
  
  const selectedPatientData = store.patients.find(p => p.id === selectedPatient)
  const selectedDoctorData = store.doctors.find(d => d.id === selectedDoctor)
  const selectedSpecialtyData = store.specialties.find(s => s.id === selectedSpecialty)

  const today = startOfDay(new Date())
  const nextDays = Array.from({ length: 14 }, (_, i) => addDays(today, i))
  
  const availableSlots = selectedDoctor && selectedDate
    ? store.getAvailableSlots(selectedDoctor, selectedDate)
    : []

  const handleSubmit = async () => {
    if (!selectedPatient || !selectedSpecialty || !selectedDoctor || !selectedDate || !selectedTime) return

    setIsSubmitting(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const appointment = store.addAppointment({
      patientId: selectedPatient,
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
    { key: 'patient', label: 'Paciente', icon: User },
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
            <h2 className="text-2xl font-bold text-foreground mb-2">Turno Registrado</h2>
            <p className="text-muted-foreground mb-6">
              El turno ha sido registrado exitosamente
            </p>
            
            <div className="bg-muted/50 rounded-xl p-6 mb-6 text-left">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Numero de Turno</p>
                  <p className="font-bold text-xl text-primary">#{newAppointment.ticketNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Paciente</p>
                  <p className="font-semibold">{selectedPatientData?.fullName}</p>
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
                <div>
                  <p className="text-sm text-muted-foreground">Consultorio</p>
                  <p className="font-semibold">{selectedDoctorData?.consultRoom}</p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button className="flex-1" onClick={() => {
                setBookingComplete(false)
                setNewAppointment(null)
                setStep('patient')
                setSelectedPatient(null)
                setSelectedSpecialty(null)
                setSelectedDoctor(null)
                setSelectedDate(null)
                setSelectedTime(null)
                setSearchQuery('')
              }}>
                Registrar Otro Turno
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => router.push('/receptionist')}>
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
          <h2 className="text-2xl font-bold text-foreground">Nuevo Turno</h2>
          <p className="text-muted-foreground">Registra un turno para un paciente</p>
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
                  'w-8 sm:w-16 h-0.5 mx-2',
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
            {step === 'patient' && 'Buscar Paciente'}
            {step === 'specialty' && 'Seleccionar Especialidad'}
            {step === 'doctor' && 'Seleccionar Medico'}
            {step === 'datetime' && 'Seleccionar Fecha y Hora'}
            {step === 'confirm' && 'Confirmar Turno'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {step === 'patient' && (
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre o cedula..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              {searchQuery && (
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {filteredPatients.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">
                      No se encontraron pacientes
                    </p>
                  ) : (
                    filteredPatients.map((patient) => (
                      <button
                        key={patient.id}
                        onClick={() => {
                          setSelectedPatient(patient.id)
                          setStep('specialty')
                        }}
                        className={cn(
                          'w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all hover:border-primary',
                          selectedPatient === patient.id
                            ? 'border-primary bg-primary/5'
                            : 'border-border'
                        )}
                      >
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                          {patient.fullName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{patient.fullName}</p>
                          <p className="text-sm text-muted-foreground">Cedula: {patient.cedula}</p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {step === 'specialty' && (
            <div className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-3 mb-4">
                <p className="text-sm text-muted-foreground">Paciente seleccionado</p>
                <p className="font-semibold">{selectedPatientData?.fullName}</p>
              </div>
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
              <Button variant="outline" onClick={() => setStep('patient')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
            </div>
          )}

          {step === 'doctor' && (
            <div className="space-y-4">
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
                <h4 className="text-sm font-medium text-muted-foreground mb-4">Resumen del turno</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Paciente</p>
                    <p className="font-semibold text-foreground">{selectedPatientData?.fullName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Cedula</p>
                    <p className="font-semibold text-foreground">{selectedPatientData?.cedula}</p>
                  </div>
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

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep('datetime')}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Registrando...' : 'Confirmar Turno'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
