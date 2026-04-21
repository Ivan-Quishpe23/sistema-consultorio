/**
 * Agenda un turno médico validando que no exista otro turno con el mismo médico, fecha y hora.
 * @param {Array<Object>} appointments - Lista de turnos existentes.
 * @param {Object} appointmentData - Datos del nuevo turno.
 * @param {string} appointmentData.patientId
 * @param {string} appointmentData.doctorId
 * @param {string} appointmentData.specialtyId
 * @param {string} appointmentData.date
 * @param {string} appointmentData.time
 * @param {string} appointmentData.status
 * @returns {{ success: boolean, message: string, appointment?: Object }}
 */
export function scheduleAppointment(appointments, appointmentData) {
  const { doctorId, date, time } = appointmentData || {}

  if (!doctorId || !date || !time) {
    return {
      success: false,
      message: 'Debe especificar el médico, la fecha y la hora del turno.',
    }
  }

  const conflict = appointments.some(
    (appointment) =>
      appointment.doctorId === doctorId &&
      appointment.date === date &&
      appointment.time === time &&
      appointment.status !== 'cancelled'
  )

  if (conflict) {
    return {
      success: false,
      message: 'Ya existe otro turno para el mismo médico en esa fecha y hora.',
    }
  }

  const appointment = {
    ...appointmentData,
    id: `apt-${Date.now()}`,
    ticketNumber: `A${String(appointments.length + 1).padStart(3, '0')}`,
    requestedAt: new Date(),
  }

  return {
    success: true,
    message: 'Turno agendado con éxito.',
    appointment,
  }
}
