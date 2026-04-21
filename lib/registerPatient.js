/**
 * Registra un paciente evitando duplicados por correo.
 * @param {Array<Object>} patients - Lista de pacientes existentes.
 * @param {Object} patientData - Datos del nuevo paciente.
 * @param {string} patientData.fullName
 * @param {string} patientData.cedula
 * @param {string} patientData.birthDate
 * @param {string} patientData.phone
 * @param {string} patientData.email
 * @param {boolean} patientData.active
 * @returns {{ success: boolean, message: string, patient?: Object, patients: Array<Object> }}
 */
export function registerPatient(patients, patientData) {
  const email = patientData?.email?.trim().toLowerCase()

  if (!email) {
    return {
      success: false,
      message: 'Debe proporcionar un correo electrónico válido.',
      patients,
    }
  }

  const duplicate = patients.some(
    (patient) => patient.email.trim().toLowerCase() === email
  )

  if (duplicate) {
    return {
      success: false,
      message: 'Ya existe un paciente registrado con ese correo electrónico.',
      patients,
    }
  }

  const patient = {
    ...patientData,
    id: `pat-${Date.now()}`,
    email,
    createdAt: new Date(),
  }

  return {
    success: true,
    message: 'Paciente registrado con éxito.',
    patient,
    patients: [...patients, patient],
  }
}
