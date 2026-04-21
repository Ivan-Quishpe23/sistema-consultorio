"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Activity, Clock, Users, Volume2 } from "lucide-react"
import { useStore } from "@/lib/store"

export default function WaitingRoomPage() {
  const { appointments, doctors, specialties } = useStore()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [announcements, setAnnouncements] = useState<string[]>([])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const today = format(new Date(), "yyyy-MM-dd")
  
  const todayAppointments = appointments
    .filter(apt => apt.date === today)
    .sort((a, b) => a.time.localeCompare(b.time))

  const waitingPatients = todayAppointments.filter(apt => apt.status === "waiting")
  const inProgressPatients = todayAppointments.filter(apt => apt.status === "in-progress")
  const nextPatients = todayAppointments.filter(apt => apt.status === "confirmed").slice(0, 5)

  const getDoctorName = (doctorId: string) => {
    const doctor = doctors.find(d => d.id === doctorId)
    return doctor ? `Dr. ${doctor.name}` : "Doctor"
  }

  const getSpecialtyName = (specialtyId: string) => {
    const specialty = specialties.find(s => s.id === specialtyId)
    return specialty?.name || "Especialidad"
  }

  const getConsultorio = (doctorId: string) => {
    const doctor = doctors.find(d => d.id === doctorId)
    return doctor?.consultorio || "1"
  }

  useEffect(() => {
    const newAnnouncements = inProgressPatients.map(apt => 
      `${apt.patientName} - Consultorio ${getConsultorio(apt.doctorId)}`
    )
    setAnnouncements(newAnnouncements)
  }, [inProgressPatients])

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-6 px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-xl bg-primary-foreground/20 flex items-center justify-center">
              <Activity className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">MediTurno</h1>
              <p className="text-primary-foreground/80">Sistema de Turnos - Sala de Espera</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-4xl font-mono font-bold">
              {format(currentTime, "HH:mm:ss")}
            </div>
            <div className="text-primary-foreground/80 text-lg">
              {format(currentTime, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-8">
        {/* Announcement Banner */}
        {announcements.length > 0 && (
          <div className="mb-8 bg-accent text-accent-foreground rounded-2xl p-6 shadow-lg animate-pulse">
            <div className="flex items-center gap-4">
              <Volume2 className="h-8 w-8 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium uppercase tracking-wider opacity-80">Llamando a:</p>
                <p className="text-2xl font-bold">{announcements[0]}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Currently Being Attended */}
          <div className="lg:col-span-2">
            <div className="bg-card rounded-2xl shadow-lg overflow-hidden">
              <div className="bg-primary/10 px-6 py-4 border-b border-border">
                <h2 className="text-xl font-semibold text-foreground flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full bg-accent animate-pulse" />
                  En Atención
                </h2>
              </div>
              <div className="p-6">
                {inProgressPatients.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No hay pacientes en atención actualmente
                  </p>
                ) : (
                  <div className="grid gap-4">
                    {inProgressPatients.map((apt) => (
                      <div
                        key={apt.id}
                        className="bg-accent/10 border-2 border-accent rounded-xl p-6 flex items-center justify-between"
                      >
                        <div>
                          <p className="text-2xl font-bold text-foreground">
                            {apt.patientName}
                          </p>
                          <p className="text-muted-foreground">
                            {getDoctorName(apt.doctorId)} - {getSpecialtyName(apt.specialtyId)}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-4xl font-bold text-accent">
                            {getConsultorio(apt.doctorId)}
                          </div>
                          <p className="text-sm text-muted-foreground">Consultorio</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Waiting Queue */}
            <div className="bg-card rounded-2xl shadow-lg overflow-hidden mt-8">
              <div className="bg-warning/10 px-6 py-4 border-b border-border">
                <h2 className="text-xl font-semibold text-foreground flex items-center gap-3">
                  <Users className="h-5 w-5 text-warning" />
                  En Espera ({waitingPatients.length})
                </h2>
              </div>
              <div className="p-6">
                {waitingPatients.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No hay pacientes en espera
                  </p>
                ) : (
                  <div className="grid gap-3">
                    {waitingPatients.map((apt, index) => (
                      <div
                        key={apt.id}
                        className="bg-muted/50 rounded-xl p-4 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">
                              {apt.patientName}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {getDoctorName(apt.doctorId)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-mono text-lg text-foreground">{apt.time}</p>
                          <p className="text-sm text-muted-foreground">
                            {getSpecialtyName(apt.specialtyId)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar - Next Appointments */}
          <div className="space-y-8">
            <div className="bg-card rounded-2xl shadow-lg overflow-hidden">
              <div className="bg-primary/10 px-6 py-4 border-b border-border">
                <h2 className="text-xl font-semibold text-foreground flex items-center gap-3">
                  <Clock className="h-5 w-5 text-primary" />
                  Próximos Turnos
                </h2>
              </div>
              <div className="p-6">
                {nextPatients.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No hay más turnos programados
                  </p>
                ) : (
                  <div className="space-y-4">
                    {nextPatients.map((apt) => (
                      <div
                        key={apt.id}
                        className="border border-border rounded-xl p-4"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-semibold text-foreground">
                            {apt.patientName}
                          </p>
                          <span className="font-mono text-primary font-bold">
                            {apt.time}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {getDoctorName(apt.doctorId)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Statistics */}
            <div className="bg-card rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Estadísticas del Día
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-primary/10 rounded-xl p-4 text-center">
                  <p className="text-3xl font-bold text-primary">
                    {todayAppointments.length}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Turnos</p>
                </div>
                <div className="bg-accent/10 rounded-xl p-4 text-center">
                  <p className="text-3xl font-bold text-accent">
                    {todayAppointments.filter(a => a.status === "completed").length}
                  </p>
                  <p className="text-sm text-muted-foreground">Atendidos</p>
                </div>
                <div className="bg-warning/10 rounded-xl p-4 text-center">
                  <p className="text-3xl font-bold text-warning">
                    {waitingPatients.length}
                  </p>
                  <p className="text-sm text-muted-foreground">En Espera</p>
                </div>
                <div className="bg-muted rounded-xl p-4 text-center">
                  <p className="text-3xl font-bold text-foreground">
                    {nextPatients.length}
                  </p>
                  <p className="text-sm text-muted-foreground">Pendientes</p>
                </div>
              </div>
            </div>

            {/* Doctors Available */}
            <div className="bg-card rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Médicos Disponibles
              </h3>
              <div className="space-y-3">
                {doctors.filter(d => d.isActive).map((doctor) => (
                  <div
                    key={doctor.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-xl"
                  >
                    <div>
                      <p className="font-medium text-foreground">
                        Dr. {doctor.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {getSpecialtyName(doctor.specialtyId)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-accent" />
                      <span className="text-sm text-muted-foreground">
                        Cons. {doctor.consultorio}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 py-6 bg-muted/50">
        <div className="max-w-7xl mx-auto px-8 text-center text-muted-foreground">
          <p>Por favor, espere a ser llamado. Gracias por su paciencia.</p>
        </div>
      </footer>
    </div>
  )
}
