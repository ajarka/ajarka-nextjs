'use client'

import React from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CheckCircle, Video, Globe, Target, BookOpen } from 'lucide-react'

interface MentorScheduleDialogProps {
  isOpen: boolean
  onClose: () => void
  newSchedule: any
  setNewSchedule: (schedule: any) => void
  availableMaterials: any[]
  adminPricingRules: any[]
  adminLocations: any[]
  calculatedPrice: number
  mentorFee: number
  saving: boolean
  onSubmit: () => void
}

export default function MentorScheduleDialog({
  isOpen,
  onClose,
  newSchedule,
  setNewSchedule,
  availableMaterials,
  adminPricingRules,
  adminLocations,
  calculatedPrice,
  mentorFee,
  saving,
  onSubmit
}: MentorScheduleDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0 pb-4 border-b">
          <DialogTitle className="text-xl font-bold">Buat Jadwal Mentoring Baru</DialogTitle>
          <DialogDescription className="text-gray-600">
            Atur detail jadwal mentoring yang akan tersedia untuk booking siswa
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden">
          <Tabs defaultValue="basic" className="w-full h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-4 flex-shrink-0">
              <TabsTrigger value="basic" className="text-sm">
                📋 Basic Info
              </TabsTrigger>
              <TabsTrigger value="materials" className="text-sm">
                📚 Materials
              </TabsTrigger>
              <TabsTrigger value="levels" className="text-sm">
                🎯 Level Settings
              </TabsTrigger>
              <TabsTrigger value="meeting" className="text-sm">
                💻 Meeting Setup
              </TabsTrigger>
            </TabsList>
            
            <div className="flex-1 overflow-y-auto mt-4 pr-2 -mr-2">
              <TabsContent value="basic" className="space-y-4 mt-0">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-sm font-medium">
                      Judul Session *
                    </Label>
                    <Input
                      id="title"
                      value={newSchedule.title}
                      onChange={(e) => setNewSchedule({ ...newSchedule, title: e.target.value })}
                      placeholder="e.g., Frontend Mentoring Session"
                      required
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration" className="text-sm font-medium">
                      Durasi (menit) *
                    </Label>
                    <Select 
                      value={newSchedule.duration.toString()} 
                      onValueChange={(value) => setNewSchedule({ ...newSchedule, duration: parseInt(value) })}
                    >
                      <SelectTrigger className="h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 menit</SelectItem>
                        <SelectItem value="60">60 menit</SelectItem>
                        <SelectItem value="90">90 menit</SelectItem>
                        <SelectItem value="120">120 menit</SelectItem>
                        <SelectItem value="180">180 menit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium">
                    Deskripsi Session
                  </Label>
                  <Textarea
                    id="description"
                    value={newSchedule.description}
                    onChange={(e) => setNewSchedule({ ...newSchedule, description: e.target.value })}
                    placeholder="Jelaskan apa yang akan dipelajari dalam session ini..."
                    rows={3}
                    className="resize-none"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="capacity" className="text-sm font-medium">
                      Maksimal Peserta
                    </Label>
                    <Input
                      id="capacity"
                      type="number"
                      min="1"
                      max="20"
                      value={newSchedule.maxCapacity}
                      onChange={(e) => setNewSchedule({ ...newSchedule, maxCapacity: parseInt(e.target.value) })}
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="meetingType" className="text-sm font-medium">
                      Tipe Meeting
                    </Label>
                    <Select 
                      value={newSchedule.meetingType} 
                      onValueChange={(value: 'online' | 'offline') => setNewSchedule({ ...newSchedule, meetingType: value })}
                    >
                      <SelectTrigger className="h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="online">🌐 Online</SelectItem>
                        <SelectItem value="offline">🏢 Tatap Muka</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="materials" className="space-y-4 mt-0">
                {/* Learning Materials Selection */}
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium">Learning Materials (Structured Curriculum)</Label>
                    <p className="text-xs text-gray-500 mt-1">
                      Pilih materi pembelajaran terstruktur untuk session ini. Siswa akan melihat level requirements.
                    </p>
                  </div>
                  
                  <div className="max-h-80 overflow-y-auto border border-gray-300 rounded-lg p-3">
                    {availableMaterials.length > 0 ? (
                      <div className="space-y-2">
                        {availableMaterials.map((material) => {
                          const isSelected = newSchedule.materialIds?.includes(material.id) || false
                          return (
                            <div
                              key={material.id}
                              className={`p-3 border rounded-lg cursor-pointer transition-all hover:shadow-sm ${
                                isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                              }`}
                              onClick={() => {
                                const currentIds = newSchedule.materialIds || []
                                if (isSelected) {
                                  setNewSchedule({
                                    ...newSchedule,
                                    materialIds: currentIds.filter(id => id !== material.id)
                                  })
                                } else {
                                  setNewSchedule({
                                    ...newSchedule,
                                    materialIds: [...currentIds, material.id]
                                  })
                                }
                              }}
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-medium text-sm truncate">{material.title}</h4>
                                    {isSelected && (
                                      <CheckCircle className="h-4 w-4 text-blue-500 flex-shrink-0" />
                                    )}
                                  </div>
                                  <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                                    {material.description}
                                  </p>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <Badge variant="outline" className="text-xs">
                                      Level {material.level}
                                    </Badge>
                                    <Badge variant="secondary" className="text-xs capitalize">
                                      {material.category}
                                    </Badge>
                                    <Badge variant="secondary" className="text-xs">
                                      {material.estimatedHours}h
                                    </Badge>
                                    <Badge variant="outline" className="text-xs">
                                      {material.difficulty}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <BookOpen className="mx-auto h-12 w-12 mb-3 text-gray-400" />
                        <p className="text-sm font-medium">No learning materials available</p>
                        <p className="text-xs mt-1">Add materials from admin panel first</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Traditional Materials */}
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium">Additional Materials (Legacy)</Label>
                    <p className="text-xs text-gray-500 mt-1">
                      Materi tambahan untuk kompatibilitas dengan sistem pricing yang ada.
                    </p>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 p-3 border border-gray-300 rounded-lg min-h-[60px]">
                    {adminPricingRules.map((rule) => 
                      rule.materials.map((material: string) => {
                        const isSelected = newSchedule.materials.includes(material)
                        return (
                          <button
                            key={material}
                            type="button"
                            onClick={() => {
                              if (isSelected) {
                                setNewSchedule({
                                  ...newSchedule,
                                  materials: newSchedule.materials.filter((m: string) => m !== material)
                                })
                              } else {
                                setNewSchedule({
                                  ...newSchedule,
                                  materials: [...newSchedule.materials, material]
                                })
                              }
                            }}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                              isSelected
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {material}
                          </button>
                        )
                      })
                    )}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="levels" className="space-y-4 mt-0">
                <div className="p-4 border border-blue-200 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50">
                  <div className="flex items-center gap-2 mb-4">
                    <Target className="h-5 w-5 text-blue-600" />
                    <h3 className="font-semibold text-blue-900">Student Level Requirements</h3>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <Label htmlFor="requiredLevel" className="text-sm font-medium text-blue-800">
                        Minimum Required Level
                      </Label>
                      <Input
                        id="requiredLevel"
                        type="number"
                        min="1"
                        max="100"
                        value={newSchedule.requiredLevel || 1}
                        onChange={(e) => setNewSchedule({ 
                          ...newSchedule, 
                          requiredLevel: parseInt(e.target.value) || 1 
                        })}
                        className="bg-white h-10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="maxLevelGap" className="text-sm font-medium text-blue-800">
                        Max Level Gap Between Students
                      </Label>
                      <Input
                        id="maxLevelGap"
                        type="number"
                        min="1"
                        max="10"
                        value={newSchedule.maxLevelGap || 2}
                        onChange={(e) => setNewSchedule({ 
                          ...newSchedule, 
                          maxLevelGap: parseInt(e.target.value) || 2 
                        })}
                        className="bg-white h-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="verificationRequired"
                        checked={newSchedule.verificationRequired || false}
                        onChange={(e) => setNewSchedule({ 
                          ...newSchedule, 
                          verificationRequired: e.target.checked 
                        })}
                        className="w-4 h-4 text-blue-600 rounded border-2 border-blue-300"
                      />
                      <Label htmlFor="verificationRequired" className="text-sm text-blue-800 font-medium">
                        Require Level Verification
                      </Label>
                    </div>

                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="autoLevelCheck"
                        checked={newSchedule.autoLevelCheck !== false}
                        onChange={(e) => setNewSchedule({ 
                          ...newSchedule, 
                          autoLevelCheck: e.target.checked 
                        })}
                        className="w-4 h-4 text-blue-600 rounded border-2 border-blue-300"
                      />
                      <Label htmlFor="autoLevelCheck" className="text-sm text-blue-800 font-medium">
                        Automatically Check Student Levels
                      </Label>
                    </div>

                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="allowLevelJumpers"
                        checked={newSchedule.allowLevelJumpers || false}
                        onChange={(e) => setNewSchedule({ 
                          ...newSchedule, 
                          allowLevelJumpers: e.target.checked 
                        })}
                        className="w-4 h-4 text-blue-600 rounded border-2 border-blue-300"
                      />
                      <Label htmlFor="allowLevelJumpers" className="text-sm text-blue-800 font-medium">
                        Allow Level Jump Verified Students
                      </Label>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="meeting" className="space-y-4 mt-0">
                {newSchedule.meetingType === 'online' && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <Video className="h-5 w-5 text-blue-600" />
                      <h4 className="font-semibold text-blue-900">Online Meeting Setup</h4>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="meetingProvider" className="text-sm font-medium">
                        Platform Meeting
                      </Label>
                      <Select 
                        value={newSchedule.meetingProvider} 
                        onValueChange={(value: 'zoom' | 'google-meet') => setNewSchedule({ ...newSchedule, meetingProvider: value })}
                      >
                        <SelectTrigger className="bg-white h-10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="google-meet">
                            <div className="flex items-center gap-2">
                              <Video className="h-4 w-4" />
                              Google Meet
                            </div>
                          </SelectItem>
                          <SelectItem value="zoom">
                            <div className="flex items-center gap-2">
                              <Video className="h-4 w-4" />
                              Zoom
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {newSchedule.meetingType === 'offline' && (
                  <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <Globe className="h-5 w-5 text-orange-600" />
                      <h4 className="font-semibold text-orange-900">Offline Meeting Setup</h4>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location" className="text-sm font-medium">
                        Lokasi Meeting
                      </Label>
                      <Select 
                        value={newSchedule.locationId?.toString() || ''} 
                        onValueChange={(value) => setNewSchedule({ ...newSchedule, locationId: parseInt(value) })}
                      >
                        <SelectTrigger className="bg-white h-10">
                          <SelectValue placeholder="Pilih lokasi office" />
                        </SelectTrigger>
                        <SelectContent>
                          {adminLocations.map((location) => (
                            <SelectItem key={location.id} value={location.id.toString()}>
                              <div className="flex items-center gap-2">
                                <Globe className="h-4 w-4" />
                                {location.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {/* Pricing Display */}
                {calculatedPrice > 0 && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-green-800 mb-2">Your Earnings per Session</h4>
                        <div className="text-center p-3 bg-white rounded-lg">
                          <div className="text-3xl font-bold text-green-600 mb-1">
                            Rp {mentorFee.toLocaleString('id-ID')}
                          </div>
                          <p className="text-xs text-green-700">
                            Dihitung otomatis oleh admin (70% dari harga siswa)
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>
            </div>
          </Tabs>
        </div>

        <DialogFooter className="flex-shrink-0 border-t pt-4 flex justify-between items-center">
          <div className="text-xs text-gray-500">
            * Field yang wajib diisi
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} disabled={saving}>
              Batal
            </Button>
            <Button 
              onClick={onSubmit} 
              disabled={saving || !newSchedule.title || newSchedule.duration < 30}
              className="min-w-[100px]"
            >
              {saving ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </div>
              ) : (
                'Simpan Jadwal'
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}