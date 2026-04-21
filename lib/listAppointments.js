/**
 * Devuelve todos los turnos ordenados por fecha y hora.
 * @param {Array<Object>} appointments - Lista de turnos existentes.
 * @returns {Array<Object>} Turnos ordenados por fecha (y hora si están presentes).
 */
export function listAppointments(appointments) {
  return [...appointments].sort((a, b) => {
    if (a.date !== b.date) {
      return a.date.localeCompare(b.date)
    }
    if (a.time && b.time) {
      return a.time.localeCompare(b.time)
    }
    return 0
  })
}
