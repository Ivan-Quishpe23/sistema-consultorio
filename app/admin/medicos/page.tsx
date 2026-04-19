'use client'

import { useState } from 'react'
import { Plus, Edit, Users, CheckCircle } from 'lucide-react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { useStore } from '@/lib/store'

const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado']

export default function DoctorsPage() {
  const store = useStore()
  const [showNewModal, setShowNewModal] = useState(false)
  const [editDoctor, setEditDoctor] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    specialtyId: '',
    consultationDuration: 30,
    workDays: [1, 2, 3, 4, 5] as number[],
    startTime: '08:00',
    endTime: '17:00',
    consultRoom: '',
    userId: '',
    active: true,
  })

  const handleSubmitNew = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    await new Promise(resolve => setTimeout(resolve, 500))
    
    store.addDoctor(formData)
    
    setIsSaving(false)
    setShowNewModal(false)
    setFormData({
      name: '',
      specialtyId: '',
      consultationDuration: 30,
      workDays: [1, 2, 3, 4, 5],
      startTime: '08:00',
      endTime: '17:00',
      consultRoom: '',
      userId: '',
      active: true,
    })
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
  }

  const handleEdit = (doctorId: string) => {
    const doctor = store.doctors.find(d => d.id === doctorId)
    if (doctor) {
      setFormData({
        name: doctor.name,
        specialtyId: doctor.specialtyId,
        consultationDuration: doctor.consultationDuration,
        workDays: [...doctor.workDays],
        startTime: doctor.startTime,
        endTime: doctor.endTime,
        consultRoom: doctor.consultRoom,
        userId: doctor.userId,
        active: doctor.active,
      })
      setEditDoctor(doctorId)
    }
  }

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editDoctor) return
    setIsSaving(true)
    await new Promise(resolve => setTimeout(resolve, 500))
    
    store.updateDoctor(editDoctor, formData)
    
    setIsSaving(false)
    setEditDoctor(null)
    setFormData({
      name: '',
      specialtyId: '',
      consultationDuration: 30,
      workDays: [1, 2, 3, 4, 5],
      startTime: '08:00',
      endTime: '17:00',
      consultRoom: '',
      userId: '',
      active: true,
    })
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
  }

  const handleToggleActive = (doctorId: string, active: boolean) => {
    store.updateDoctor(doctorId, { active: !active })
  }

  const toggleWorkDay = (day: number) => {
    if (formData.workDays.includes(day)) {
      setFormData({ ...formData, workDays: formData.workDays.filter(d => d !== day) })
    } else {
      setFormData({ ...formData, workDays: [...formData.workDays, day].sort() })
    }
  }

  const FormContent = () => (
    <>
      <div className="space-y-2">
        <Label htmlFor="name">Nombre Completo *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="specialty">Especialidad *</Label>
        <Select value={formData.specialtyId} onValueChange={(v) => setFormData({ ...formData, specialtyId: v })}>
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar especialidad" />
          </SelectTrigger>
          <SelectContent>
            {store.specialties.filter(s => s.active).map((specialty) => (
              <SelectItem key={specialty.id} value={specialty.id}>
                {specialty.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="consultRoom">Consultorio *</Label>
        <Input
          id="consultRoom"
          value={formData.consultRoom}
          onChange={(e) => setFormData({ ...formData, consultRoom: e.target.value })}
          placeholder="Ej: Consultorio 101"
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startTime">Hora Inicio *</Label>
          <Input
            id="startTime"
            type="time"
            value={formData.startTime}
            onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endTime">Hora Fin *</Label>
          <Input
            id="endTime"
            type="time"
            value={formData.endTime}
            onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
            required
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="duration">Duracion Consulta (minutos) *</Label>
        <Input
          id="duration"
          type="number"
          min={10}
          max={120}
          value={formData.consultationDuration}
          onChange={(e) => setFormData({ ...formData, consultationDuration: parseInt(e.target.value) })}
          required
        />
      </div>
      <div className="space-y-2">
        <Label>Dias Laborables</Label>
        <div className="flex flex-wrap gap-2">
          {dayNames.map((day, index) => (
            <div key={day} className="flex items-center gap-2">
              <Checkbox
                id={`day-${index}`}
                checked={formData.workDays.includes(index)}
                onCheckedChange={() => toggleWorkDay(index)}
              />
              <Label htmlFor={`day-${index}`} className="text-sm cursor-pointer">
                {day.slice(0, 3)}
              </Label>
            </div>
          ))}
        </div>
      </div>
    </>
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Medicos</h2>
          <p className="text-muted-foreground">Gestiona los medicos del sistema</p>
        </div>
        <Button onClick={() => setShowNewModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Medico
        </Button>
      </div>

      {showSuccess && (
        <div className="flex items-center gap-2 p-4 rounded-lg bg-success/10 text-success">
          <CheckCircle className="w-5 h-5" />
          Medico guardado exitosamente
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Lista de Medicos ({store.doctors.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {store.doctors.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground">No hay medicos registrados</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Medico</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Especialidad</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Consultorio</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Horario</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Estado</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {store.doctors.map((doctor) => {
                    const specialty = store.specialties.find(s => s.id === doctor.specialtyId)
                    return (
                      <tr key={doctor.id} className="border-b border-border last:border-0">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-semibold">
                              {doctor.name.charAt(0)}
                            </div>
                            <span className="font-medium text-foreground">{doctor.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">{specialty?.name}</td>
                        <td className="py-3 px-4 text-muted-foreground">{doctor.consultRoom}</td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {doctor.startTime} - {doctor.endTime}
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={doctor.active ? 'default' : 'secondary'}>
                            {doctor.active ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" onClick={() => handleEdit(doctor.id)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleActive(doctor.id, doctor.active)}
                            >
                              {doctor.active ? 'Desactivar' : 'Activar'}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showNewModal} onOpenChange={setShowNewModal}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nuevo Medico</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitNew} className="space-y-4">
            <FormContent />
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

      <Dialog open={!!editDoctor} onOpenChange={(open) => !open && setEditDoctor(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Medico</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitEdit} className="space-y-4">
            <FormContent />
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => setEditDoctor(null)} className="flex-1">
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
