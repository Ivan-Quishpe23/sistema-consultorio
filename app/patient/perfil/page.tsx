'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { User, Mail, Phone, Calendar, CreditCard, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useStore } from '@/lib/store'

export default function PatientProfile() {
  const store = useStore()
  const patient = store.patients.find(p => p.userId === store.currentUser?.id)
  
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [formData, setFormData] = useState({
    fullName: patient?.fullName || '',
    phone: patient?.phone || '',
    email: patient?.email || '',
  })

  const handleSave = async () => {
    if (!patient) return
    setIsSaving(true)
    await new Promise(resolve => setTimeout(resolve, 500))
    store.updatePatient(patient.id, formData)
    setIsSaving(false)
    setIsEditing(false)
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
  }

  if (!patient) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <User className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
          <p className="text-muted-foreground">No se encontro el perfil del paciente</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Mi Perfil</h2>
        <p className="text-muted-foreground">Gestiona tu informacion personal</p>
      </div>

      {showSuccess && (
        <div className="flex items-center gap-2 p-4 rounded-lg bg-success/10 text-success">
          <CheckCircle className="w-5 h-5" />
          Perfil actualizado exitosamente
        </div>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Informacion Personal</CardTitle>
          {!isEditing && (
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              Editar
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {isEditing ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="fullName">Nombre Completo</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefono</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Correo Electronico</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setIsEditing(false)} className="flex-1">
                  Cancelar
                </Button>
                <Button onClick={handleSave} disabled={isSaving} className="flex-1">
                  {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Nombre Completo</p>
                  <p className="font-semibold text-foreground">{patient.fullName}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Cedula</p>
                  <p className="font-semibold text-foreground">{patient.cedula}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Fecha de Nacimiento</p>
                  <p className="font-semibold text-foreground">
                    {format(new Date(patient.birthDate + 'T12:00:00'), "d 'de' MMMM, yyyy", { locale: es })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Phone className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Telefono</p>
                  <p className="font-semibold text-foreground">{patient.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Correo Electronico</p>
                  <p className="font-semibold text-foreground">{patient.email}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
