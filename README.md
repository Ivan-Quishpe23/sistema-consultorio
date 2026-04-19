# Sistema Consultorio

## Dashboard del Proyecto

Este proyecto es un sistema de gestión para un consultorio médico, que organiza pacientes, turnos, agendas, y roles de acceso para administración, recepción y doctores.

## Resumen del alcance

- Gestión de usuarios y roles: administrador, recepcionista, doctor y paciente.
- Control de turnos y agenda médica.
- Registro y consulta de pacientes.
- Paneles personalizados por tipo de usuario.
- Módulos de reportes, especialidades, excepciones y sala de espera.
- Interfaz basada en componentes modernos con navegación y diseño responsivo.

## Participantes y roles

- **Administrador**: configura el sistema, administra especialidades, médicos y reportes.
- **Recepcionista**: gestiona turnos, busca pacientes y registra nuevos turnos.
- **Doctor**: revisa agenda, consulta pacientes y accede a su configuración personal.
- **Paciente**: solicita turnos, visualiza perfil y consulta turnos asignados.

## Módulos del sistema

- **Admin**
  - Especialidades
  - Excepciones
  - Médicos
  - Reportes
- **Doctor**
  - Agenda
  - Configuración
  - Pacientes
- **Patient**
  - Perfil
  - Solicitar turno
  - Turnos
- **Recepcionist**
  - Buscar
  - Nuevo turno
  - Pacientes
- **Sala de espera**
  - Vista de control de sala de espera

## Documentación

- Código fuente en `app/`, `components/`, `lib/`.
- Configuración de Next.js en `next.config.mjs`.
- Tipos y utilidades en `lib/types.ts`, `lib/utils.ts`.
- Componentes UI reutilizables en `components/ui/`.

## Prototipo de interfaz

El prototipo de la interfaz está organizado por rutas en `app/` con layouts específicos para cada rol. Se utiliza un diseño de dashboard con navegación lateral y páginas de gestión for cada módulo.

## Stack tecnológico

- Framework: **Next.js 14**
- Lenguaje: **TypeScript**
- Estilos: **CSS modular** con `globals.css`
- Paquetes: **pnpm**
- Componentes: librería propia dentro de `components/ui/`
- Estado y datos: componentes React y utilidades locales
- Plataforma: **Web** responsive
Prueba de pipeline CI
