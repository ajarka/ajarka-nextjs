'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Plus, Edit, Trash2, Search, Filter, BookOpen, Clock, Users, Target } from 'lucide-react'
import { learningService, type LearningMaterial } from '@/lib/learning-service'

export default function MaterialManagement() {
  const [materials, setMaterials] = useState<LearningMaterial[]>([])
  const [filteredMaterials, setFilteredMaterials] = useState<LearningMaterial[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [levelFilter, setLevelFilter] = useState<string>('all')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingMaterial, setEditingMaterial] = useState<LearningMaterial | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    category: 'frontend' as const,
    subcategory: 'fundamental' as const,
    level: 1,
    prerequisites: [] as string[],
    estimatedHours: 1,
    meetingsRequired: 1,
    description: '',
    learningObjectives: [''],
    resources: [{ type: 'video' as const, title: '', url: '', duration: 0 }],
    skills: [''],
    difficulty: 'beginner' as const,
    isActive: true
  })

  useEffect(() => {
    fetchMaterials()
  }, [])

  useEffect(() => {
    filterMaterials()
  }, [materials, searchTerm, categoryFilter, levelFilter])

  const fetchMaterials = async () => {
    try {
      setIsLoading(true)
      const data = await learningService.getLearningMaterials()
      setMaterials(data)
    } catch (error) {
      console.error('Failed to fetch materials:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterMaterials = () => {
    let filtered = materials

    if (searchTerm) {
      filtered = filtered.filter(material =>
        material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        material.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        material.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(material => material.category === categoryFilter)
    }

    if (levelFilter !== 'all') {
      const levelRange = levelFilter.split('-').map(Number)
      if (levelRange.length === 2) {
        filtered = filtered.filter(material => 
          material.level >= levelRange[0] && material.level <= levelRange[1]
        )
      }
    }

    setFilteredMaterials(filtered)
  }

  const resetForm = () => {
    setFormData({
      title: '',
      category: 'frontend',
      subcategory: 'fundamental',
      level: 1,
      prerequisites: [],
      estimatedHours: 1,
      meetingsRequired: 1,
      description: '',
      learningObjectives: [''],
      resources: [{ type: 'video', title: '', url: '', duration: 0 }],
      skills: [''],
      difficulty: 'beginner',
      isActive: true
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const materialData = {
        ...formData,
        learningObjectives: formData.learningObjectives.filter(obj => obj.trim()),
        skills: formData.skills.filter(skill => skill.trim()),
        resources: formData.resources.filter(resource => resource.title && resource.url),
        assignments: [],
        projects: []
      }

      if (editingMaterial) {
        await learningService.updateLearningMaterial(editingMaterial.id, materialData)
      } else {
        await learningService.createLearningMaterial(materialData)
      }

      await fetchMaterials()
      setShowCreateForm(false)
      setEditingMaterial(null)
      resetForm()
    } catch (error) {
      console.error('Failed to save material:', error)
    }
  }

  const handleEdit = (material: LearningMaterial) => {
    setEditingMaterial(material)
    setFormData({
      title: material.title,
      category: material.category,
      subcategory: material.subcategory,
      level: material.level,
      prerequisites: material.prerequisites,
      estimatedHours: material.estimatedHours,
      meetingsRequired: material.meetingsRequired,
      description: material.description,
      learningObjectives: material.learningObjectives,
      resources: material.resources.length ? material.resources : [{ type: 'video', title: '', url: '', duration: 0 }],
      skills: material.skills,
      difficulty: material.difficulty,
      isActive: material.isActive
    })
    setShowCreateForm(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this material?')) {
      try {
        await learningService.deleteLearningMaterial(id)
        await fetchMaterials()
      } catch (error) {
        console.error('Failed to delete material:', error)
      }
    }
  }

  const addArrayField = (field: 'learningObjectives' | 'skills' | 'resources') => {
    if (field === 'resources') {
      setFormData(prev => ({
        ...prev,
        resources: [...prev.resources, { type: 'video', title: '', url: '', duration: 0 }]
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], '']
      }))
    }
  }

  const updateArrayField = (field: 'learningObjectives' | 'skills', index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }))
  }

  const updateResourceField = (index: number, resourceField: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      resources: prev.resources.map((resource, i) => 
        i === index ? { ...resource, [resourceField]: value } : resource
      )
    }))
  }

  const removeArrayField = (field: 'learningObjectives' | 'skills' | 'resources', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }))
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800'
      case 'intermediate': return 'bg-yellow-100 text-yellow-800'
      case 'advanced': return 'bg-orange-100 text-orange-800'
      case 'expert': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'frontend': return 'bg-blue-100 text-blue-800'
      case 'backend': return 'bg-green-100 text-green-800'
      case 'fullstack': return 'bg-purple-100 text-purple-800'
      case 'mobile': return 'bg-orange-100 text-orange-800'
      case 'devops': return 'bg-indigo-100 text-indigo-800'
      case 'data': return 'bg-pink-100 text-pink-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className=\"p-6 space-y-6\">
      <div className=\"flex justify-between items-center\">
        <div>
          <h1 className=\"text-3xl font-bold\">Learning Materials Management</h1>
          <p className=\"text-muted-foreground\">Create and manage learning materials for different journeys</p>
        </div>
        <Button 
          onClick={() => {
            resetForm()
            setShowCreateForm(true)
            setEditingMaterial(null)
          }}
          className=\"flex items-center gap-2\"
        >
          <Plus size={16} />
          Create Material
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className=\"flex items-center gap-2\">
            <Filter size={20} />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className=\"grid grid-cols-1 md:grid-cols-4 gap-4\">
            <div className=\"space-y-2\">
              <Label>Search Materials</Label>
              <div className=\"relative\">
                <Search className=\"absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground\" size={16} />
                <Input
                  placeholder=\"Search by title, description, skills...\"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className=\"pl-9\"
                />
              </div>
            </div>
            <div className=\"space-y-2\">
              <Label>Category</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value=\"all\">All Categories</SelectItem>
                  <SelectItem value=\"frontend\">Frontend</SelectItem>
                  <SelectItem value=\"backend\">Backend</SelectItem>
                  <SelectItem value=\"fullstack\">Full-Stack</SelectItem>
                  <SelectItem value=\"mobile\">Mobile</SelectItem>
                  <SelectItem value=\"devops\">DevOps</SelectItem>
                  <SelectItem value=\"data\">Data Science</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className=\"space-y-2\">
              <Label>Level Range</Label>
              <Select value={levelFilter} onValueChange={setLevelFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value=\"all\">All Levels</SelectItem>
                  <SelectItem value=\"1-10\">Beginner (1-10)</SelectItem>
                  <SelectItem value=\"11-30\">Intermediate (11-30)</SelectItem>
                  <SelectItem value=\"31-60\">Advanced (31-60)</SelectItem>
                  <SelectItem value=\"61-100\">Expert (61-100)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className=\"space-y-2\">
              <Label>Statistics</Label>
              <div className=\"text-sm text-muted-foreground\">
                <div>Total: {materials.length}</div>
                <div>Filtered: {filteredMaterials.length}</div>
                <div>Active: {materials.filter(m => m.isActive).length}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingMaterial ? 'Edit Material' : 'Create New Material'}</CardTitle>
            <CardDescription>
              {editingMaterial ? 'Update the learning material details' : 'Add a new learning material to the system'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className=\"space-y-6\">
              <div className=\"grid grid-cols-1 md:grid-cols-2 gap-4\">
                <div className=\"space-y-2\">
                  <Label htmlFor=\"title\">Title *</Label>
                  <Input
                    id=\"title\"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder=\"e.g., HTML5 Semantic Elements\"
                    required
                  />
                </div>
                <div className=\"space-y-2\">
                  <Label htmlFor=\"category\">Category *</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value: any) => setFormData(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value=\"frontend\">Frontend</SelectItem>
                      <SelectItem value=\"backend\">Backend</SelectItem>
                      <SelectItem value=\"fullstack\">Full-Stack</SelectItem>
                      <SelectItem value=\"mobile\">Mobile</SelectItem>
                      <SelectItem value=\"devops\">DevOps</SelectItem>
                      <SelectItem value=\"data\">Data Science</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className=\"space-y-2\">
                  <Label htmlFor=\"subcategory\">Subcategory</Label>
                  <Select 
                    value={formData.subcategory} 
                    onValueChange={(value: any) => setFormData(prev => ({ ...prev, subcategory: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value=\"fundamental\">Fundamental</SelectItem>
                      <SelectItem value=\"framework\">Framework</SelectItem>
                      <SelectItem value=\"advanced\">Advanced</SelectItem>
                      <SelectItem value=\"specialization\">Specialization</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className=\"space-y-2\">
                  <Label htmlFor=\"difficulty\">Difficulty</Label>
                  <Select 
                    value={formData.difficulty} 
                    onValueChange={(value: any) => setFormData(prev => ({ ...prev, difficulty: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value=\"beginner\">Beginner</SelectItem>
                      <SelectItem value=\"intermediate\">Intermediate</SelectItem>
                      <SelectItem value=\"advanced\">Advanced</SelectItem>
                      <SelectItem value=\"expert\">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className=\"space-y-2\">
                  <Label htmlFor=\"level\">Level (1-100)</Label>
                  <Input
                    id=\"level\"
                    type=\"number\"
                    min=\"1\"
                    max=\"100\"
                    value={formData.level}
                    onChange={(e) => setFormData(prev => ({ ...prev, level: parseInt(e.target.value) || 1 }))}
                  />
                </div>
                <div className=\"space-y-2\">
                  <Label htmlFor=\"estimatedHours\">Estimated Hours</Label>
                  <Input
                    id=\"estimatedHours\"
                    type=\"number\"
                    min=\"0.5\"
                    step=\"0.5\"
                    value={formData.estimatedHours}
                    onChange={(e) => setFormData(prev => ({ ...prev, estimatedHours: parseFloat(e.target.value) || 1 }))}
                  />
                </div>
                <div className=\"space-y-2\">
                  <Label htmlFor=\"meetingsRequired\">Meetings Required</Label>
                  <Input
                    id=\"meetingsRequired\"
                    type=\"number\"
                    min=\"1\"
                    value={formData.meetingsRequired}
                    onChange={(e) => setFormData(prev => ({ ...prev, meetingsRequired: parseInt(e.target.value) || 1 }))}
                  />
                </div>
                <div className=\"space-y-2 flex items-center gap-3\">
                  <Label htmlFor=\"isActive\">Active</Label>
                  <Switch
                    id=\"isActive\"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                  />
                </div>
              </div>

              <div className=\"space-y-2\">
                <Label htmlFor=\"description\">Description</Label>
                <Textarea
                  id=\"description\"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder=\"Describe what students will learn in this material\"
                  rows={3}
                />
              </div>

              {/* Learning Objectives */}
              <div className=\"space-y-2\">
                <Label>Learning Objectives</Label>
                {formData.learningObjectives.map((objective, index) => (
                  <div key={index} className=\"flex gap-2\">
                    <Input
                      value={objective}
                      onChange={(e) => updateArrayField('learningObjectives', index, e.target.value)}
                      placeholder=\"e.g., Understand semantic HTML structure\"
                    />
                    {formData.learningObjectives.length > 1 && (
                      <Button
                        type=\"button\"
                        variant=\"outline\"
                        size=\"sm\"
                        onClick={() => removeArrayField('learningObjectives', index)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type=\"button\"
                  variant=\"outline\"
                  size=\"sm\"
                  onClick={() => addArrayField('learningObjectives')}
                >
                  <Plus size={16} />
                  Add Objective
                </Button>
              </div>

              {/* Skills */}
              <div className=\"space-y-2\">
                <Label>Skills Taught</Label>
                {formData.skills.map((skill, index) => (
                  <div key={index} className=\"flex gap-2\">
                    <Input
                      value={skill}
                      onChange={(e) => updateArrayField('skills', index, e.target.value)}
                      placeholder=\"e.g., HTML, CSS, JavaScript\"
                    />
                    {formData.skills.length > 1 && (
                      <Button
                        type=\"button\"
                        variant=\"outline\"
                        size=\"sm\"
                        onClick={() => removeArrayField('skills', index)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type=\"button\"
                  variant=\"outline\"
                  size=\"sm\"
                  onClick={() => addArrayField('skills')}
                >
                  <Plus size={16} />
                  Add Skill
                </Button>
              </div>

              {/* Resources */}
              <div className=\"space-y-2\">
                <Label>Learning Resources</Label>
                {formData.resources.map((resource, index) => (
                  <div key={index} className=\"space-y-2 p-4 border rounded-lg\">
                    <div className=\"grid grid-cols-1 md:grid-cols-4 gap-2\">
                      <Select
                        value={resource.type}
                        onValueChange={(value) => updateResourceField(index, 'type', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value=\"video\">Video</SelectItem>
                          <SelectItem value=\"article\">Article</SelectItem>
                          <SelectItem value=\"documentation\">Documentation</SelectItem>
                          <SelectItem value=\"tool\">Tool</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        placeholder=\"Resource title\"
                        value={resource.title}
                        onChange={(e) => updateResourceField(index, 'title', e.target.value)}
                      />
                      <Input
                        placeholder=\"Resource URL\"
                        value={resource.url}
                        onChange={(e) => updateResourceField(index, 'url', e.target.value)}
                      />
                      <div className=\"flex gap-2\">
                        <Input
                          type=\"number\"
                          placeholder=\"Duration (min)\"
                          value={resource.duration}
                          onChange={(e) => updateResourceField(index, 'duration', parseInt(e.target.value) || 0)}
                        />
                        {formData.resources.length > 1 && (
                          <Button
                            type=\"button\"
                            variant=\"outline\"
                            size=\"sm\"
                            onClick={() => removeArrayField('resources', index)}
                          >
                            <Trash2 size={16} />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <Button
                  type=\"button\"
                  variant=\"outline\"
                  size=\"sm\"
                  onClick={() => addArrayField('resources')}
                >
                  <Plus size={16} />
                  Add Resource
                </Button>
              </div>

              <Separator />

              <div className=\"flex justify-end gap-3\">
                <Button
                  type=\"button\"
                  variant=\"outline\"
                  onClick={() => {
                    setShowCreateForm(false)
                    setEditingMaterial(null)
                    resetForm()
                  }}
                >
                  Cancel
                </Button>
                <Button type=\"submit\">
                  {editingMaterial ? 'Update Material' : 'Create Material'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Materials List */}
      <div className=\"grid gap-4\">
        {isLoading ? (
          <div className=\"text-center py-8\">Loading materials...</div>
        ) : filteredMaterials.length === 0 ? (
          <Card>
            <CardContent className=\"text-center py-8\">
              <BookOpen className=\"mx-auto h-12 w-12 text-muted-foreground mb-4\" />
              <h3 className=\"text-lg font-medium mb-2\">No materials found</h3>
              <p className=\"text-muted-foreground mb-4\">
                {materials.length === 0 
                  ? \"Get started by creating your first learning material.\"
                  : \"Try adjusting your search or filters.\"
                }
              </p>
              {materials.length === 0 && (
                <Button onClick={() => setShowCreateForm(true)}>
                  <Plus className=\"mr-2\" size={16} />
                  Create First Material
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredMaterials.map((material) => (
            <Card key={material.id} className={!material.isActive ? 'opacity-50' : ''}>
              <CardHeader>
                <div className=\"flex justify-between items-start\">
                  <div className=\"space-y-1\">
                    <CardTitle className=\"flex items-center gap-2\">
                      {material.title}
                      {!material.isActive && (
                        <Badge variant=\"secondary\">Inactive</Badge>
                      )}
                    </CardTitle>
                    <div className=\"flex items-center gap-2 text-sm\">
                      <Badge className={getCategoryColor(material.category)}>
                        {material.category}
                      </Badge>
                      <Badge className={getDifficultyColor(material.difficulty)}>
                        {material.difficulty}
                      </Badge>
                      <Badge variant=\"outline\">Level {material.level}</Badge>
                    </div>
                  </div>
                  <div className=\"flex gap-2\">
                    <Button
                      variant=\"outline\"
                      size=\"sm\"
                      onClick={() => handleEdit(material)}
                    >
                      <Edit size={16} />
                    </Button>
                    <Button
                      variant=\"outline\"
                      size=\"sm\"
                      onClick={() => handleDelete(material.id)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className=\"text-muted-foreground mb-4\">{material.description}</p>
                
                <div className=\"grid grid-cols-2 md:grid-cols-4 gap-4 mb-4\">
                  <div className=\"flex items-center gap-2\">
                    <Clock size={16} className=\"text-muted-foreground\" />
                    <span className=\"text-sm\">{material.estimatedHours}h</span>
                  </div>
                  <div className=\"flex items-center gap-2\">
                    <Users size={16} className=\"text-muted-foreground\" />
                    <span className=\"text-sm\">{material.meetingsRequired} meetings</span>
                  </div>
                  <div className=\"flex items-center gap-2\">
                    <Target size={16} className=\"text-muted-foreground\" />
                    <span className=\"text-sm\">{material.learningObjectives.length} objectives</span>
                  </div>
                  <div className=\"flex items-center gap-2\">
                    <BookOpen size={16} className=\"text-muted-foreground\" />
                    <span className=\"text-sm\">{material.resources.length} resources</span>
                  </div>
                </div>

                <div className=\"space-y-2\">
                  <div>
                    <span className=\"text-sm font-medium\">Skills: </span>
                    <div className=\"flex flex-wrap gap-1 mt-1\">
                      {material.skills.map((skill, index) => (
                        <Badge key={index} variant=\"secondary\" className=\"text-xs\">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  {material.prerequisites.length > 0 && (
                    <div>
                      <span className=\"text-sm font-medium\">Prerequisites: </span>
                      <span className=\"text-sm text-muted-foreground\">
                        {material.prerequisites.length} required materials
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}