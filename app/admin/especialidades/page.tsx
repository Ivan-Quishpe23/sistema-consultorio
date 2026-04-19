'use client'

import { useState } from 'react'
import { Plus, Edit, Stethoscope, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useStore } from '@/lib/store'

export default function SpecialtiesPage() {
  const store = useStore()
  const [showNewModal, setShowNewModal] = useState(false)
  const [editSpecialty, setEditSpecialty] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    active: true,
  })

  const handleSubmitNew = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    await new Promise(resolve => setTimeout(resolve, 500))
    
    store.addSpecialty(formData)
    
    setIsSaving(false)
    setShowNewModal(false)
    setFormData({ name: '', description: '', active: true })
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
  }

  const handleEdit = (specialtyId: string) => {
    const specialty = store.specialties.find(s => s.id === specialtyId)
    if (specialty) {
      setFormData({
        name: specialty.name,
        description: specialty.description,
        active: specialty.active,
      })
      setEditSpecialty(specialtyId)
    }
  }

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editSpecialty) return
    setIsSaving(true)
    await new Promise(resolve => setTimeout(resolve, 500))
    
    store.updateSpecialty(editSpecialty, formData)
    
    setIsSaving(false)
    setEditSpecialty(null)
    setFormData({ name: '', description: '', active: true })
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
  }

  const handleToggleActive = (specialtyId: string, active: boolean) => {
    store.updateSpecialty(specialtyId, { active: !active })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Especialidades</h2>
          <p className="text-muted-foreground">Gestiona las especialidades medicas</p>
        </div>
        <Button onClick={() => setShowNewModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nueva Especialidad
        </Button>
      </div>

      {showSuccess && (
        <div className="flex items-center gap-2 p-4 rounded-lg bg-success/10 text-success">
          <CheckCircle className="w-5 h-5" />
          Especialidad guardada exitosamente
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {store.specialties.map((specialty) => {
          const doctorCount = store.doctors.filter(d => d.specialtyId === specialty.id).length
          
          return (
            <Card key={specialty.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Stethoscope className="w-6 h-6 text-primary" />
                  </div>
                  <Badge variant={specialty.active ? 'default' : 'secondary'}>
                    {specialty.active ? 'Activa' : 'Inactiva'}
                  </Badge>
                </div>
                <h3 className="font-semibold text-foreground mb-1">{specialty.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{specialty.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{doctorCount} medicos</span>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(specialty.id)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleActive(specialty.id, specialty.active)}
                    >
                      {specialty.active ? 'Desactivar' : 'Activar'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Dialog open={showNewModal} onOpenChange={setShowNewModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nueva Especialidad</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitNew} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descripcion *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => setShowNewModal(false)} className="flex-1">
                Cancelar
              </Button>
              <Button type="submit" disabled={isSaving} className="flex-1">
                {isSaving ? 'Guardando...' : 'Guardar'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editSpecialty} onOpenChange={(open) => !open && setEditSpecialty(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Especialidad</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitEdit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nombre *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Descripcion *</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => setEditSpecialty(null)} className="flex-1">
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
