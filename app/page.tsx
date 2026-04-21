'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, Clock, Users, Shield, ArrowRight, Activity } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useStore } from '@/lib/store'
import { LoginModal } from '@/components/auth/login-modal'
import type { User } from '@/lib/types'

export default function HomePage() {
  const [showLogin, setShowLogin] = useState(false)
  const router = useRouter()
  const store = useStore()

  const handleLoginSuccess = (user: User) => {
    setShowLogin(false)
    switch (user.role) {
      case 'admin':
        router.push('/admin')
        break
      case 'doctor':
        router.push('/doctor')
        break
      case 'receptionist':
        router.push('/receptionist')
        break
      case 'patient':
        router.push('/patient')
        break
    }
  }

  const features = [
    {
      icon: Calendar,
      title: 'Agenda Inteligente',
      description: 'Gestiona tus citas médicas de forma fácil y rápida con nuestro sistema de turnos automatizado.',
    },
    {
      icon: Clock,
      title: 'Tiempo Real',
      description: 'Visualiza el estado de tu turno en tiempo real desde la sala de espera o tu dispositivo.',
    },
    {
      icon: Users,
      title: 'Múltiples Especialidades',
      description: 'Accede a diferentes especialidades médicas y elige el profesional que mejor se adapte a tus necesidades.',
    },
    {
      icon: Shield,
      title: 'Datos Seguros',
      description: 'Tu información personal está protegida con los más altos estándares de seguridad.',
    },
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <Activity className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">MediTurno</span>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
                Características
              </a>
              <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">
                Cómo Funciona
              </a>
              <a href="/sala-espera" className="text-muted-foreground hover:text-foreground transition-colors">
                Sala de Espera
              </a>
            </nav>
            <Button onClick={() => setShowLogin(true)}>
              Iniciar Sesión
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="relative overflow-hidden py-20 sm:py-32">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground tracking-tight text-balance">
                Gestión de Turnos Médicos
                <span className="text-primary"> Simplificada</span>
              </h1>
              <p className="mt-6 text-lg sm:text-xl text-muted-foreground leading-relaxed text-pretty">
                Optimiza la experiencia de tus pacientes con un sistema moderno de gestión de turnos.
                Reduce tiempos de espera y mejora la eficiencia de tu consultorio.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button size="lg" onClick={() => setShowLogin(true)} className="w-full sm:w-auto">
                  Comenzar Ahora
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button size="lg" variant="outline" className="w-full sm:w-auto" asChild>
                  <a href="/sala-espera">Ver Sala de Espera</a>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="py-20 bg-card">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
                Todo lo que necesitas
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Un sistema completo para la gestión eficiente de turnos médicos
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="p-6 rounded-2xl bg-background border border-border hover:border-primary/50 transition-colors"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
                Cómo Funciona
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Tres simples pasos para solicitar tu turno
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { step: '01', title: 'Selecciona Especialidad', desc: 'Elige la especialidad médica que necesitas' },
                { step: '02', title: 'Elige Horario', desc: 'Selecciona el médico y horario disponible' },
                { step: '03', title: 'Confirma tu Turno', desc: 'Recibe la confirmación en tu correo electrónico' },
              ].map((item) => (
                <div key={item.step} className="relative">
                  <div className="text-6xl font-bold text-primary/10 absolute -top-4 left-0">
                    {item.step}
                  </div>
                  <div className="pt-12 pl-4">
                    <h3 className="text-xl font-semibold text-foreground mb-2">{item.title}</h3>
                    <p className="text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 bg-primary">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-primary-foreground mb-4">
              Credenciales de Prueba
            </h2>
            <p className="text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
              Usa estas credenciales para explorar el sistema con diferentes roles
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
              {[
                { role: 'Administrador', email: 'admin@clinica.com', pass: 'admin123' },
                { role: 'Médico', email: 'doctor@clinica.com', pass: 'doctor123' },
                { role: 'Recepcionista', email: 'recepcion@clinica.com', pass: 'recepcion123' },
                { role: 'Paciente', email: 'paciente@email.com', pass: 'paciente123' },
              ].map((cred) => (
                <div key={cred.role} className="bg-primary-foreground/10 backdrop-blur rounded-xl p-4 text-left">
                  <p className="font-semibold text-primary-foreground mb-2">{cred.role}</p>
                  <p className="text-sm text-primary-foreground/80">{cred.email}</p>
                  <p className="text-sm text-primary-foreground/80">{cred.pass}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-card border-t border-border py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Activity className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-semibold text-foreground">MediTurno</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Sistema de Gestión de Turnos Médicos
            </p>
          </div>
        </div>
      </footer>

      <LoginModal 
        open={showLogin} 
        onOpenChange={setShowLogin}
        onSuccess={handleLoginSuccess}
      />
    </div>
  )
}
