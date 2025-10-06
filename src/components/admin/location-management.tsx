'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { AdminService, OfficeLocation } from '@/services/admin-service'
import { Id } from '../../convex/_generated/dataModel'

const FACILITY_OPTIONS = [
  { id: 'wifi', label: 'WiFi', icon: Wifi },
  { id: 'projector', label: 'Projector', icon: Monitor },
  { id: 'whiteboard', label: 'Whiteboard', icon: Edit },
  { id: 'coffee', label: 'Coffee/Tea', icon: Coffee },
  { id: 'parking', label: 'Parking', icon: Car },
  { id: 'ac', label: 'Air Conditioning', icon: Building },
]

export default function LocationManagement() {
  // Use Convex hooks - static methods
  const locations = AdminService.useOfficeLocations() || []
  const createLocation = AdminService.useCreateOfficeLocation()
  const updateLocation = AdminService.useUpdateOfficeLocation()
  const deleteLocation = AdminService.useDeleteOfficeLocation()

  const [showDialog, setShowDialog] = useState(false)
  const [editingLocation, setEditingLocation] = useState<OfficeLocation | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<Id<"adminOfficeLocations"> | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    province: '',
    postalCode: '',
    coordinates: {
      latitude: 0,
      longitude: 0,
    },
    facilities: [] as string[],
    capacity: 10,
    operatingHours: {
      weekdays: '09:00 - 17:00',
      weekends: '09:00 - 15:00',
    },
    contactPerson: '',
    contactPhone: '',
    isActive: true,
    photos: [] as string[],
    amenities: [] as string[],
  })

  const resetForm = () => {
    setFormData({
      name: '',
      address: '',
      city: '',
      province: '',
      postalCode: '',
      coordinates: {
        latitude: 0,
        longitude: 0,
      },
      facilities: [],
      capacity: 10,
      operatingHours: {
        weekdays: '09:00 - 17:00',
        weekends: '09:00 - 15:00',
      },
      contactPerson: '',
      contactPhone: '',
      isActive: true,
      photos: [],
      amenities: [],
    })
    setEditingLocation(null)
  }

  const openDialog = (location?: OfficeLocation) => {
    if (location) {
      setEditingLocation(location)
      setFormData({
        name: location.name,
        address: location.address,
        city: location.city,
        province: location.province,
        postalCode: location.postalCode,
        coordinates: location.coordinates,
        facilities: location.facilities,
        capacity: location.capacity,
        operatingHours: location.operatingHours,
        contactPerson: location.contactPerson,
        contactPhone: location.contactPhone,
        isActive: location.isActive,
        photos: location.photos || [],
        amenities: location.amenities || [],
      })
    } else {
      resetForm()
    }
    setShowDialog(true)
  }

  const handleSave = async () => {
    try {
      if (editingLocation) {
        await updateLocation({
          id: editingLocation._id,
          ...formData,
        })
      } else {
        await createLocation(formData)
      }
      setShowDialog(false)
      resetForm()
    } catch (error) {
      console.error('Error saving location:', error)
      alert('Failed to save location. Please try again.')
    }
  }

  const handleDelete = async (id: Id<"adminOfficeLocations">) => {
    try {
      await deleteLocation({ id })
      setDeleteConfirm(null)
    } catch (error) {
      console.error('Error deleting location:', error)
      alert('Failed to delete location. Please try again.')
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

  if (locations === undefined) {
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
          <h2 className="text-2xl font-bold">Location Management</h2>
          <p className="text-muted-foreground">
            Kelola lokasi kantor untuk sesi offline
          </p>
        </div>
        <Button onClick={() => openDialog()} className="gap-2">
          <Plus className="h-4 w-4" />
          Add New Location
        </Button>
      </div>

      {/* Statistics Cards */}
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
              {locations.reduce((sum, loc) => sum + loc.capacity, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              total seats
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
              {Math.round(locations.reduce((sum, loc) => sum + loc.capacity, 0) / Math.max(locations.length, 1))}
            </div>
            <p className="text-xs text-muted-foreground">
              seats per location
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Locations List */}
      <Card>
        <CardHeader>
          <CardTitle>Office Locations</CardTitle>
          <CardDescription>
            Daftar lokasi kantor yang tersedia untuk sesi mentoring offline
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {locations.length === 0 ? (
              <div className="text-center py-8">
                <Building className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Locations</h3>
                <p className="text-muted-foreground mb-4">
                  Add your first office location to enable offline sessions
                </p>
                <Button onClick={() => openDialog()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Location
                </Button>
              </div>
            ) : (
              <div className="grid gap-4">
                {locations.map((location) => (
                  <Card key={location._id} className="relative">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold">{location.name}</h4>
                            <Badge variant={location.isActive ? 'default' : 'secondary'}>
                              {location.isActive ? <><CheckCircle className="h-3 w-3 mr-1" />Active</> : 'Inactive'}
                            </Badge>
                          </div>

                          <div className="space-y-2 text-sm">
                            <div className="flex items-start gap-2">
                              <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                              <div>
                                <p>{location.address}</p>
                                <p className="text-muted-foreground">{location.city}, {location.province}</p>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <span className="text-muted-foreground">Capacity:</span>
                                <p className="font-medium">{location.capacity} seats</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Contact:</span>
                                <p className="font-medium">{location.contactPerson}</p>
                              </div>
                            </div>

                            {location.facilities.length > 0 && (
                              <div>
                                <span className="text-muted-foreground">Facilities:</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {location.facilities.map((facilityId) => {
                                    const facility = FACILITY_OPTIONS.find(f => f.id === facilityId)
                                    return facility ? (
                                      <Badge key={facilityId} variant="outline" className="text-xs">
                                        {facility.label}
                                      </Badge>
                                    ) : null
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 ml-4">
                          <Button variant="outline" size="sm" onClick={() => openDialog(location)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => setDeleteConfirm(location._id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingLocation ? 'Edit Location' : 'Add New Location'}
            </DialogTitle>
            <DialogDescription>
              Provide office location details
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div>
              <Label>Location Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Jakarta Office - Sudirman"
              />
            </div>

            <div>
              <Label>Address</Label>
              <Input
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                placeholder="Full street address"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>City</Label>
                <Input value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} />
              </div>
              <div>
                <Label>Province</Label>
                <Input value={formData.province} onChange={(e) => setFormData({...formData, province: e.target.value})} />
              </div>
              <div>
                <Label>Postal Code</Label>
                <Input value={formData.postalCode} onChange={(e) => setFormData({...formData, postalCode: e.target.value})} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Latitude</Label>
                <Input
                  type="number"
                  step="0.000001"
                  value={formData.coordinates.latitude}
                  onChange={(e) => setFormData({
                    ...formData,
                    coordinates: { ...formData.coordinates, latitude: parseFloat(e.target.value) || 0 }
                  })}
                />
              </div>
              <div>
                <Label>Longitude</Label>
                <Input
                  type="number"
                  step="0.000001"
                  value={formData.coordinates.longitude}
                  onChange={(e) => setFormData({
                    ...formData,
                    coordinates: { ...formData.coordinates, longitude: parseFloat(e.target.value) || 0 }
                  })}
                />
              </div>
            </div>

            <div>
              <Label>Capacity</Label>
              <Input
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value) || 0})}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Weekday Hours</Label>
                <Input
                  value={formData.operatingHours.weekdays}
                  onChange={(e) => setFormData({
                    ...formData,
                    operatingHours: { ...formData.operatingHours, weekdays: e.target.value }
                  })}
                />
              </div>
              <div>
                <Label>Weekend Hours</Label>
                <Input
                  value={formData.operatingHours.weekends}
                  onChange={(e) => setFormData({
                    ...formData,
                    operatingHours: { ...formData.operatingHours, weekends: e.target.value }
                  })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Contact Person</Label>
                <Input
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({...formData, contactPerson: e.target.value})}
                />
              </div>
              <div>
                <Label>Contact Phone</Label>
                <Input
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({...formData, contactPhone: e.target.value})}
                />
              </div>
            </div>

            <div>
              <Label className="mb-2 block">Facilities</Label>
              <div className="grid grid-cols-3 gap-2">
                {FACILITY_OPTIONS.map((facility) => {
                  const Icon = facility.icon
                  return (
                    <button
                      key={facility.id}
                      type="button"
                      onClick={() => toggleFacility(facility.id)}
                      className={`flex items-center gap-2 p-2 border rounded-md transition-colors ${
                        formData.facilities.includes(facility.id)
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-accent'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="text-sm">{facility.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
              />
              <Label htmlFor="isActive">Active Location</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowDialog(false); resetForm(); }}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {editingLocation ? 'Update' : 'Create'}
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
              Are you sure you want to delete this location?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteConfirm && handleDelete(deleteConfirm)}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
