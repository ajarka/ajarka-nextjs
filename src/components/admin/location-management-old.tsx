'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { 
  MapPin,
  Plus,
  Edit,
  Trash2,
  Building,
  Users,
  Wifi,
  Monitor,
  Coffee,
  Car,
  AlertTriangle,
  CheckCircle
} from "lucide-react"
import { AdminService, AdminOfficeLocation } from '@/lib/admin-service'

const FACILITY_OPTIONS = [
  { id: 'wifi', label: 'WiFi', icon: Wifi },
  { id: 'projector', label: 'Projector', icon: Monitor },
  { id: 'whiteboard', label: 'Whiteboard', icon: Edit },
  { id: 'coffee', label: 'Coffee/Tea', icon: Coffee },
  { id: 'parking', label: 'Parking', icon: Car },
  { id: 'ac', label: 'Air Conditioning', icon: Building },
]

export default function LocationManagement() {
  const [locations, setLocations] = useState<AdminOfficeLocation[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showDialog, setShowDialog] = useState(false)
  const [editingLocation, setEditingLocation] = useState<AdminOfficeLocation | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    capacity: 10,
    facilities: [] as string[],
    isActive: true
  })

  const fetchLocations = async () => {
    setLoading(true)
    const data = await AdminService.getOfficeLocations()
    setLocations(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchLocations()
  }, [])

  const resetForm = () => {
    setFormData({
      name: '',
      address: '',
      city: '',
      capacity: 10,
      facilities: [],
      isActive: true
    })
    setEditingLocation(null)
  }

  const openDialog = (location?: AdminOfficeLocation) => {
    if (location) {
      setEditingLocation(location)
      setFormData({
        name: location.name,
        address: location.address,
        city: location.city,
        capacity: location.capacity,
        facilities: location.facilities,
        isActive: location.isActive
      })
    } else {
      resetForm()
    }
    setShowDialog(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      if (editingLocation) {
        await AdminService.updateOfficeLocation(editingLocation.id, formData)
      } else {
        await AdminService.createOfficeLocation(formData)
      }
      await fetchLocations()
      setShowDialog(false)
      resetForm()
    } catch (error) {
      console.error('Error saving location:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    setSaving(true)
    try {
      await AdminService.deleteOfficeLocation(id)
      await fetchLocations()
      setDeleteConfirm(null)
    } catch (error) {
      console.error('Error deleting location:', error)
    } finally {
      setSaving(false)
    }
  }

  const toggleFacility = (facilityId: string) => {
    setFormData(prev => ({
      ...prev,
      facilities: prev.facilities.includes(facilityId)
        ? prev.facilities.filter(f => f !== facilityId)
        : [...prev.facilities, facilityId]
    }))
  }

  const getFacilityIcon = (facilityId: string) => {
    const facility = FACILITY_OPTIONS.find(f => f.id === facilityId)
    return facility ? facility.icon : Building
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Office Location Management</h2>
          <p className="text-muted-foreground">
            Kelola lokasi kantor Ajarka untuk sesi offline
          </p>
        </div>
        <Button onClick={() => openDialog()} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Location
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Locations</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{locations.length}</div>
            <p className="text-xs text-muted-foreground">
              {locations.filter(l => l.isActive).length} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Capacity</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {locations.filter(l => l.isActive).reduce((sum, loc) => sum + loc.capacity, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              people across all locations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cities</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(locations.map(l => l.city)).size}
            </div>
            <p className="text-xs text-muted-foreground">
              unique cities
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Capacity</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(
                locations.reduce((sum, loc) => sum + loc.capacity, 0) / Math.max(locations.length, 1)
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              people per location
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Locations List */}
      <Card>
        <CardHeader>
          <CardTitle>Office Locations</CardTitle>
          <CardDescription>
            Lokasi kantor yang tersedia untuk sesi mentoring offline
          </CardDescription>
        </CardHeader>
        <CardContent>
          {locations.length === 0 ? (
            <div className="text-center py-8">
              <Building className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Locations</h3>
              <p className="text-muted-foreground mb-4">
                Add your first office location for offline mentoring sessions
              </p>
              <Button onClick={() => openDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Location
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {locations.map((location) => (
                <Card key={location.id} className="relative">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold flex items-center gap-2">
                          <Building className="h-4 w-4" />
                          {location.name}
                        </h4>
                        <p className="text-sm text-muted-foreground">{location.city}</p>
                      </div>
                      <Badge variant={location.isActive ? 'default' : 'secondary'}>
                        {location.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <p className="text-sm">{location.address}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm">Capacity: {location.capacity} people</p>
                      </div>
                    </div>

                    {/* Facilities */}
                    <div className="mb-4">
                      <p className="text-sm font-medium mb-2">Facilities:</p>
                      <div className="flex flex-wrap gap-1">
                        {location.facilities.map((facilityId) => {
                          const facility = FACILITY_OPTIONS.find(f => f.id === facilityId)
                          const FacilityIcon = getFacilityIcon(facilityId)
                          return (
                            <Badge key={facilityId} variant="outline" className="text-xs">
                              <FacilityIcon className="h-3 w-3 mr-1" />
                              {facility?.label || facilityId}
                            </Badge>
                          )
                        })}
                        {location.facilities.length === 0 && (
                          <span className="text-xs text-muted-foreground">No facilities listed</span>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openDialog(location)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeleteConfirm(location.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingLocation ? 'Edit Office Location' : 'Add New Office Location'}
            </DialogTitle>
            <DialogDescription>
              Configure office location details for offline mentoring sessions
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Location Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Ajarka Office Jakarta"
                />
              </div>

              <div>
                <Label>City</Label>
                <Input
                  value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                  placeholder="Jakarta"
                />
              </div>
            </div>

            <div>
              <Label>Address</Label>
              <Textarea
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                placeholder="Jl. Sudirman No. 123, Jakarta Pusat 10220"
                rows={3}
              />
            </div>

            <div>
              <Label>Capacity (people)</Label>
              <Input
                type="number"
                min="1"
                max="100"
                value={formData.capacity}
                onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value)})}
              />
            </div>

            <div>
              <Label className="mb-3 block">Facilities</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {FACILITY_OPTIONS.map((facility) => {
                  const Icon = facility.icon
                  const isSelected = formData.facilities.includes(facility.id)
                  
                  return (
                    <Button
                      key={facility.id}
                      type="button"
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleFacility(facility.id)}
                      className="justify-start gap-2"
                    >
                      <Icon className="h-4 w-4" />
                      {facility.label}
                    </Button>
                  )
                })}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isActiveLocation"
                checked={formData.isActive}
                onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
              />
              <Label htmlFor="isActiveLocation">Active Location</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving || !formData.name || !formData.address}>
              {saving ? 'Saving...' : editingLocation ? 'Update Location' : 'Create Location'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteConfirm !== null} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Confirm Deletion
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this office location? This action cannot be undone and may affect existing offline sessions.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
              disabled={saving}
            >
              {saving ? 'Deleting...' : 'Delete Location'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}