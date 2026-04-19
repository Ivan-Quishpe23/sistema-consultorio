export type UserRole = 'admin' | 'doctor' | 'receptionist' | 'patient'

export type AppointmentStatus = 'scheduled' | 'waiting' | 'in_consultation' | 'completed' | 'cancelled' | 'absent'

export interface User {
  id: string
  email: string
  password: string
  role: UserRole
  name: string
  createdAt: Date
}

export interface Patient {
  id: string
  userId: string
  fullName: string
  cedula: string
  birthDate: string
  phone: string
  email: string
  active: boolean
  createdAt: Date
}

export interface Specialty {
  id: string
  name: string
  description: string
  active: boolean
}

export interface Doctor {
  id: string
  userId: string
  name: string
  specialtyId: string
  consultationDuration: number // minutes
  workDays: number[] // 0-6, Sunday to Saturday
  startTime: string // HH:mm
  endTime: string // HH:mm
  consultRoom: string
  active: boolean
}

export interface Appointment {
  id: string
  ticketNumber: string
  patientId: string
  doctorId: string
  specialtyId: string
  date: string
  time: string
  status: AppointmentStatus
  requestedAt: Date
  attendedAt?: Date
  cancelledAt?: Date
  cancelledBy?: string
}

export interface TimeSlot {
  time: string
  available: boolean
}

export interface DoctorException {
  id: string
  doctorId: string
  date: string
  reason: string
}

export interface ReportData {
  totalAppointments: number
  attended: number
  cancelled: number
  absent: number
  averageWaitTime: number
  absenteeismRate: number
}
