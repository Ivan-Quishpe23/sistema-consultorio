'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Plus, Trash2, Calendar, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { useStore } from '@/lib/store'

export default function ExceptionsPage() {
  const store = useStore()
  const [showNewModal, setShowNewModal] = useState(false)
  const [deleteException, setDeleteException] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  
  const [formData, setFormData] = useState({
    doctorId: '',
    date: '',
    reason: '',
  })

  const handleSubmitNew = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    await new Promise(resolve => setTimeout(resolve, 500))
    
    store.addException(formData)
    
    setIsSaving(false)
    setShowNewModal(false)
    setFormData({ doctorId: '', date: '', reason: '' })
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
  }

  const handleDelete = async () => {
    if (!deleteException) return
    store.removeException(deleteException)
    setDeleteException(null)
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
  }

  const getDoctor = (doctorId: string) => store.doctors.find(d => d.id === doctorId)

  const groupedExceptions = store.exceptions.reduce((acc, exception) => {
    const doctor = getDoctor(exception.doctorId)
    if (!doctor) return acc
    if (!acc[doctor.id]) {
      acc[doctor.id] = { doctor, exceptions: [] }
    }
    acc[doctor.id].exceptions.push(exception)
    return acc
  }, {} as Record<string, { doctor: typeof store.doctors[0], exceptions: typeof store.exceptions }>)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Excepciones de Agenda</h2>
          <p className="text-muted-foreground">Gestiona vacaciones y dias no laborables</p>
        </div>
        <Button onClick={() => setShowNewModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nueva Excepcion
        </Button>
      </div>

      {showSuccess && (
        <div className="flex items-center gap-2 p-4 rounded-lg bg-success/10 text-success">
          <CheckCircle className="w-5 h-5" />
          Cambios guardados exitosamente
        </div>
      )}

      {Object.keys(groupedExceptions).length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
            <p className="text-muted-foreground">No hay excepciones registradas</p>
            <Button className="mt-4" onClick={() => setShowNewModal(true)}>
              Agregar Excepcion
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.values(groupedExceptions).map(({ doctor, exceptions }) => (
            <Card key={doctor.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                    {doctor.name.charAt(0)}
                  </div>
                  {doctor.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {exceptions
                    .sort((a, b) => a.date.localeCompare(b.date))
                    .map((exception) => (
                      <div
                        key={exception.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                      >
                        <div>
                          <p className="font-medium text-foreground">
                            {format(new Date(exception.date + 'T12:00:00'), "EEEE d 'de' MMMM, yyyy", { locale: es })}
                          </p>
                          <p className="text-sm text-muted-foreground">{exception.reason}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setDeleteException(exception.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showNewModal} onOpenChange={setShowNewModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nueva Excepcion</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitNew} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="doctor">Medico *</Label>
              <Select value={formData.doctorId} onValueChange={(v) => setFormData({ ...formData, doctorId: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar medico" />
                </SelectTrigger>
                <SelectContent>
                  {store.doctors.filter(d => d.active).map((doctor) => (
                    <SelectItem key={doctor.id} value={doctor.id}>
                      {doctor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Fecha *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reason">Motivo *</Label>
              <Input
                id="reason"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                placeholder="Ej: Vacaciones, Feriado, Capacitacion"
                required
              />
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => setShowNewModal(false)} className="flex-1">
                Cancelar
              </Button>
              <Button type="submit" disabled={isSaving || !formData.doctorId} className="flex-1">
                {isSaving ? 'Guardando...' : 'Guardar'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteException} onOpenChange={(open) => !open && setDeleteException(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar Excepcion</DialogTitle>
            <DialogDescription>
              Esta accion eliminara la excepcion y el medico quedara disponible para ese dia.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteException(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
