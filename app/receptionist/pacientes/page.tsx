'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Search, UserPlus, Users, Edit, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useStore } from '@/lib/store'

export default function PatientsPage() {
  const store = useStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [showNewPatient, setShowNewPatient] = useState(false)
  const [editPatient, setEditPatient] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  
  const [formData, setFormData] = useState({
    fullName: '',
    cedula: '',
    birthDate: '',
    phone: '',
    email: '',
  })

  const filteredPatients = store.patients.filter(
    p => p.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
         p.cedula.includes(searchQuery) ||
         p.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSubmitNew = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    await new Promise(resolve => setTimeout(resolve, 500))
    
    store.addPatient({
      ...formData,
      userId: '',
      active: true,
    })
    
    setIsSaving(false)
    setShowNewPatient(false)
    setFormData({ fullName: '', cedula: '', birthDate: '', phone: '', email: '' })
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
  }

  const handleEdit = (patientId: string) => {
    const patient = store.patients.find(p => p.id === patientId)
    if (patient) {
      setFormData({
        fullName: patient.fullName,
        cedula: patient.cedula,
        birthDate: patient.birthDate,
        phone: patient.phone,
        email: patient.email,
      })
      setEditPatient(patientId)
    }
  }

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editPatient) return
    setIsSaving(true)
    await new Promise(resolve => setTimeout(resolve, 500))
    
    store.updatePatient(editPatient, formData)
    
    setIsSaving(false)
    setEditPatient(null)
    setFormData({ fullName: '', cedula: '', birthDate: '', phone: '', email: '' })
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
  }

  const handleToggleActive = (patientId: string, active: boolean) => {
    store.updatePatient(patientId, { active: !active })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Pacientes</h2>
          <p className="text-muted-foreground">Gestiona los pacientes del sistema</p>
        </div>
        <Button onClick={() => setShowNewPatient(true)}>
          <UserPlus className="w-4 h-4 mr-2" />
          Nuevo Paciente
        </Button>
      </div>

      {showSuccess && (
        <div className="flex items-center gap-2 p-4 rounded-lg bg-success/10 text-success">
          <CheckCircle className="w-5 h-5" />
          Paciente guardado exitosamente
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle>Lista de Pacientes ({filteredPatients.length})</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar paciente..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredPatients.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground">No se encontraron pacientes</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Nombre</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Cedula</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Telefono</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Email</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Estado</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPatients.map((patient) => (
                    <tr key={patient.id} className="border-b border-border last:border-0">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-semibold">
                            {patient.fullName.charAt(0)}
                          </div>
                          <span className="font-medium text-foreground">{patient.fullName}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">{patient.cedula}</td>
                      <td className="py-3 px-4 text-muted-foreground">{patient.phone}</td>
                      <td className="py-3 px-4 text-muted-foreground">{patient.email}</td>
                      <td className="py-3 px-4">
                        <Badge variant={patient.active ? 'default' : 'secondary'}>
                          {patient.active ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(patient.id)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleActive(patient.id, patient.active)}
                          >
                            {patient.active ? 'Desactivar' : 'Activar'}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showNewPatient} onOpenChange={setShowNewPatient}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuevo Paciente</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitNew} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nombre Completo *</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cedula">Cedula *</Label>
              <Input
                id="cedula"
                value={formData.cedula}
                onChange={(e) => setFormData({ ...formData, cedula: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="birthDate">Fecha de Nacimiento *</Label>
              <Input
                id="birthDate"
                type="date"
                value={formData.birthDate}
                onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefono *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Correo Electronico *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => setShowNewPatient(false)} className="flex-1">
                Cancelar
              </Button>
              <Button type="submit" disabled={isSaving} className="flex-1">
                {isSaving ? 'Guardando...' : 'Guardar'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editPatient} onOpenChange={(open) => !open && setEditPatient(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Paciente</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitEdit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-fullName">Nombre Completo *</Label>
              <Input
                id="edit-fullName"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-cedula">Cedula *</Label>
              <Input
                id="edit-cedula"
                value={formData.cedula}
                onChange={(e) => setFormData({ ...formData, cedula: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-birthDate">Fecha de Nacimiento *</Label>
              <Input
                id="edit-birthDate"
                type="date"
                value={formData.birthDate}
                onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phone">Telefono *</Label>
              <Input
                id="edit-phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Correo Electronico *</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => setEditPatient(null)} className="flex-1">
                Cancelar
              </Button>
              <Button type="submit" disabled={isSaving} className="flex-1">
                {isSaving ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
