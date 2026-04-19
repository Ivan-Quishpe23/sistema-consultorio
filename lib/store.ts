'use client'

import { createContext, useContext } from 'react'
import type { User, Patient, Specialty, Doctor, Appointment, DoctorException, TimeSlot } from './types'
import { mockUsers, mockPatients, mockSpecialties, mockDoctors, mockAppointments, mockExceptions } from './mock-data'

interface StoreState {
  users: User[]
  patients: Patient[]
  specialties: Specialty[]
  doctors: Doctor[]
  appointments: Appointment[]
  exceptions: DoctorException[]
  currentUser: User | null
}

interface StoreActions {
  login: (email: string, password: string) => User | null
  logout: () => void
  addPatient: (patient: Omit<Patient, 'id' | 'createdAt'>) => Patient
  updatePatient: (id: string, data: Partial<Patient>) => void
  addAppointment: (appointment: Omit<Appointment, 'id' | 'ticketNumber' | 'requestedAt'>) => Appointment
  updateAppointment: (id: string, data: Partial<Appointment>) => void
  cancelAppointment: (id: string, cancelledBy: string) => void
  callNextPatient: (doctorId: string) => Appointment | null
  getAvailableSlots: (doctorId: string, date: string) => TimeSlot[]
  getDoctorsBySpecialty: (specialtyId: string) => Doctor[]
  getPatientAppointments: (patientId: string) => Appointment[]
  getDoctorAppointments: (doctorId: string, date?: string) => Appointment[]
  getDoctorQueue: (doctorId: string) => Appointment[]
  addSpecialty: (specialty: Omit<Specialty, 'id'>) => Specialty
  updateSpecialty: (id: string, data: Partial<Specialty>) => void
  addDoctor: (doctor: Omit<Doctor, 'id'>) => Doctor
  updateDoctor: (id: string, data: Partial<Doctor>) => void
  addException: (exception: Omit<DoctorException, 'id'>) => DoctorException
  removeException: (id: string) => void
}

export type Store = StoreState & StoreActions

let globalStore: StoreState = {
  users: [...mockUsers],
  patients: [...mockPatients],
  specialties: [...mockSpecialties],
  doctors: [...mockDoctors],
  appointments: [...mockAppointments],
  exceptions: [...mockExceptions],
  currentUser: null,
}

let listeners: Array<() => void> = []

function notifyListeners() {
  listeners.forEach(listener => listener())
}

export function subscribe(listener: () => void) {
  listeners.push(listener)
  return () => {
    listeners = listeners.filter(l => l !== listener)
  }
}

export function getStore(): Store {
  return {
    ...globalStore,
    login: (email: string, password: string) => {
      const user = globalStore.users.find(u => u.email === email && u.password === password)
      if (user) {
        globalStore = { ...globalStore, currentUser: user }
        notifyListeners()
        return user
      }
      return null
    },
    logout: () => {
      globalStore = { ...globalStore, currentUser: null }
      notifyListeners()
    },
    addPatient: (patientData) => {
      const patient: Patient = {
        ...patientData,
        id: `pat-${Date.now()}`,
        createdAt: new Date(),
      }
      globalStore = { ...globalStore, patients: [...globalStore.patients, patient] }
      notifyListeners()
      return patient
    },
    updatePatient: (id, data) => {
      globalStore = {
        ...globalStore,
        patients: globalStore.patients.map(p => p.id === id ? { ...p, ...data } : p),
      }
      notifyListeners()
    },
    addAppointment: (appointmentData) => {
      const ticketNum = globalStore.appointments.length + 1
      const appointment: Appointment = {
        ...appointmentData,
        id: `apt-${Date.now()}`,
        ticketNumber: `A${String(ticketNum).padStart(3, '0')}`,
        requestedAt: new Date(),
      }
      globalStore = { ...globalStore, appointments: [...globalStore.appointments, appointment] }
      notifyListeners()
      return appointment
    },
    updateAppointment: (id, data) => {
      globalStore = {
        ...globalStore,
        appointments: globalStore.appointments.map(a => a.id === id ? { ...a, ...data } : a),
      }
      notifyListeners()
    },
    cancelAppointment: (id, cancelledBy) => {
      globalStore = {
        ...globalStore,
        appointments: globalStore.appointments.map(a =>
          a.id === id ? { ...a, status: 'cancelled', cancelledAt: new Date(), cancelledBy } : a
        ),
      }
      notifyListeners()
    },
    callNextPatient: (doctorId) => {
      const today = new Date().toISOString().split('T')[0]
      const queue = globalStore.appointments
        .filter(a => a.doctorId === doctorId && a.date === today && a.status === 'waiting')
        .sort((a, b) => a.time.localeCompare(b.time))
      
      if (queue.length === 0) return null
      
      const currentInConsultation = globalStore.appointments.find(
        a => a.doctorId === doctorId && a.date === today && a.status === 'in_consultation'
      )
      
      if (currentInConsultation) {
        globalStore = {
          ...globalStore,
          appointments: globalStore.appointments.map(a =>
            a.id === currentInConsultation.id ? { ...a, status: 'completed', attendedAt: new Date() } : a
          ),
        }
      }
      
      const nextPatient = queue[0]
      globalStore = {
        ...globalStore,
        appointments: globalStore.appointments.map(a =>
          a.id === nextPatient.id ? { ...a, status: 'in_consultation' } : a
        ),
      }
      notifyListeners()
      return nextPatient
    },
    getAvailableSlots: (doctorId, date) => {
      const doctor = globalStore.doctors.find(d => d.id === doctorId)
      if (!doctor) return []
      
      const dayOfWeek = new Date(date + 'T12:00:00').getDay()
      if (!doctor.workDays.includes(dayOfWeek)) return []
      
      const hasException = globalStore.exceptions.some(e => e.doctorId === doctorId && e.date === date)
      if (hasException) return []
      
      const bookedTimes = globalStore.appointments
        .filter(a => a.doctorId === doctorId && a.date === date && a.status !== 'cancelled')
        .map(a => a.time)
      
      const slots: TimeSlot[] = []
      const [startH, startM] = doctor.startTime.split(':').map(Number)
      const [endH, endM] = doctor.endTime.split(':').map(Number)
      const startMinutes = startH * 60 + startM
      const endMinutes = endH * 60 + endM
      
      for (let m = startMinutes; m < endMinutes; m += doctor.consultationDuration) {
        const hours = Math.floor(m / 60)
        const mins = m % 60
        const timeStr = `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`
        slots.push({
          time: timeStr,
          available: !bookedTimes.includes(timeStr),
        })
      }
      
      return slots
    },
    getDoctorsBySpecialty: (specialtyId) => {
      return globalStore.doctors.filter(d => d.specialtyId === specialtyId && d.active)
    },
    getPatientAppointments: (patientId) => {
      return globalStore.appointments.filter(a => a.patientId === patientId)
    },
    getDoctorAppointments: (doctorId, date) => {
      let appointments = globalStore.appointments.filter(a => a.doctorId === doctorId)
      if (date) {
        appointments = appointments.filter(a => a.date === date)
      }
      return appointments.sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date)
        return a.time.localeCompare(b.time)
      })
    },
    getDoctorQueue: (doctorId) => {
      const today = new Date().toISOString().split('T')[0]
      return globalStore.appointments
        .filter(a => a.doctorId === doctorId && a.date === today && (a.status === 'waiting' || a.status === 'in_consultation'))
        .sort((a, b) => a.time.localeCompare(b.time))
    },
    addSpecialty: (specialtyData) => {
      const specialty: Specialty = {
        ...specialtyData,
        id: `spec-${Date.now()}`,
      }
      globalStore = { ...globalStore, specialties: [...globalStore.specialties, specialty] }
      notifyListeners()
      return specialty
    },
    updateSpecialty: (id, data) => {
      globalStore = {
        ...globalStore,
        specialties: globalStore.specialties.map(s => s.id === id ? { ...s, ...data } : s),
      }
      notifyListeners()
    },
    addDoctor: (doctorData) => {
      const doctor: Doctor = {
        ...doctorData,
        id: `doc-${Date.now()}`,
      }
      globalStore = { ...globalStore, doctors: [...globalStore.doctors, doctor] }
      notifyListeners()
      return doctor
    },
    updateDoctor: (id, data) => {
      globalStore = {
        ...globalStore,
        doctors: globalStore.doctors.map(d => d.id === id ? { ...d, ...data } : d),
      }
      notifyListeners()
    },
    addException: (exceptionData) => {
      const exception: DoctorException = {
        ...exceptionData,
        id: `exc-${Date.now()}`,
      }
      globalStore = { ...globalStore, exceptions: [...globalStore.exceptions, exception] }
      notifyListeners()
      return exception
    },
    removeException: (id) => {
      globalStore = {
        ...globalStore,
        exceptions: globalStore.exceptions.filter(e => e.id !== id),
      }
      notifyListeners()
    },
  }
}

export const StoreContext = createContext<Store | null>(null)

export function useStore(): Store {
  const context = useContext(StoreContext)
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider')
  }
  return context
}
