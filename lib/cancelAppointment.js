/**
 * Cancela un turno buscando por su ID y eliminándolo de la lista de turnos.
 * @param {Array<Object>} appointments - Lista de turnos existentes.
 * @param {string} appointmentId - ID del turno a cancelar.
 * @returns {{ success: boolean, message: string, appointments: Array<Object> }}
 */
export function cancelAppointmentById(appointments, appointmentId) {
  if (!appointmentId) {
    return {
      success: false,
      message: 'Debe proporcionar el ID del turno a cancelar.',
      appointments,
    }
  }

  const index = appointments.findIndex((appointment) => appointment.id === appointmentId)

  if (index === -1) {
    return {
      success: false,
      message: 'No se encontró un turno con el ID proporcionado.',
      appointments,
    }
  }

  const updatedAppointments = [...appointments.slice(0, index), ...appointments.slice(index + 1)]

  return {
    success: true,
    message: 'Turno cancelado y eliminado con éxito.',
    appointments: updatedAppointments,
  }
}
