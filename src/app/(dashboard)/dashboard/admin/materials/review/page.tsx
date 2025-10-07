"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { MaterialContentService } from "@/services/material-content-service"
import { NotificationService } from "@/services/notification-service"
import MaterialViewer from "@/components/materials/material-viewer"
import { Id } from "@/../convex/_generated/dataModel"

interface MaterialContent {
  _id: Id<"materialContents">
  title: string
  description: string
  category: string
  level: number
  difficulty: string
  estimatedHours: number
  content: string
  videoUrl?: string
  thumbnailUrl?: string
  attachments: Array<{
    name: string
    url: string
    type: string
  }>
  tags: string[]
  prerequisites: string[]
  objectives: string[]
  authorId: string
  authorRole: string
  status: string
  reviewerId?: string
  reviewNotes?: string
  reviewedAt?: string
  isPublic: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
  publishedAt?: string
}

export default function MaterialReviewPage() {
  const { data: session } = useSession()
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialContent | null>(null)
  const [reviewNotes, setReviewNotes] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [activeTab, setActiveTab] = useState<"pending" | "all">("pending")

  // Fetch materials
  const pendingMaterials = MaterialContentService.usePendingReview()
  const allMaterials = MaterialContentService.useMaterialContents()

  // Mutations
  const approveMaterial = MaterialContentService.useApproveMaterial()
  const rejectMaterial = MaterialContentService.useRejectMaterial()
  const requestRevision = MaterialContentService.useRequestRevision()
  const createNotification = NotificationService.useCreateNotification()

  const userId = session?.user?.id || ""

  const displayMaterials = activeTab === "pending"
    ? pendingMaterials?.filter((m: MaterialContent) => m.status === "pending_review") || []
    : allMaterials || []

  const handleApprove = async (material: MaterialContent) => {
    if (!confirm(`Approve material "${material.title}"?`)) return

    setIsProcessing(true)
    try {
      await approveMaterial({
        id: material._id,
        reviewerId: userId,
        reviewNotes: reviewNotes || "Approved - Material meets quality standards",
      })

      // Create notification for mentor
      await createNotification({
        userId: material.authorId,
        type: "material_approved",
        title: "Material Approved! 🎉",
        message: `Your material "${material.title}" has been approved and is now published!`,
        relatedId: material._id,
        relatedType: "material",
        recipientType: "mentor",
        senderId: userId,
        senderType: "admin",
      })

      alert("Material approved successfully!")
      setSelectedMaterial(null)
      setReviewNotes("")
    } catch (error) {
      console.error("Error approving material:", error)
      alert("Failed to approve material")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReject = async (material: MaterialContent) => {
    if (!reviewNotes.trim()) {
      alert("Please provide review notes explaining why this material is being rejected")
      return
    }

    if (!confirm(`Reject material "${material.title}"?`)) return

    setIsProcessing(true)
    try {
      await rejectMaterial({
        id: material._id,
        reviewerId: userId,
        reviewNotes: reviewNotes,
      })

      // Create notification for mentor
      await createNotification({
        userId: material.authorId,
        type: "material_rejected",
        title: "Material Rejected",
        message: `Your material "${material.title}" has been rejected. Please review the feedback.`,
        relatedId: material._id,
        relatedType: "material",
        recipientType: "mentor",
        senderId: userId,
        senderType: "admin",
      })

      alert("Material rejected")
      setSelectedMaterial(null)
      setReviewNotes("")
    } catch (error) {
      console.error("Error rejecting material:", error)
      alert("Failed to reject material")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleRequestRevision = async (material: MaterialContent) => {
    if (!reviewNotes.trim()) {
      alert("Please provide review notes explaining what needs to be revised")
      return
    }

    if (!confirm(`Request revision for "${material.title}"?`)) return

    setIsProcessing(true)
    try {
      await requestRevision({
        id: material._id,
        reviewerId: userId,
        reviewNotes: reviewNotes,
      })

      // Create notification for mentor
      await createNotification({
        userId: material.authorId,
        type: "material_revision_requested",
        title: "Revision Requested",
        message: `Admin has requested revisions for your material "${material.title}"`,
        relatedId: material._id,
        relatedType: "material",
        recipientType: "mentor",
        senderId: userId,
        senderType: "admin",
      })

      alert("Revision requested successfully")
      setSelectedMaterial(null)
      setReviewNotes("")
    } catch (error) {
      console.error("Error requesting revision:", error)
      alert("Failed to request revision")
    } finally {
      setIsProcessing(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      pending_review: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
      draft: "bg-gray-100 text-gray-800",
      published: "bg-blue-100 text-blue-800",
    }
    return badges[status as keyof typeof badges] || "bg-gray-100 text-gray-800"
  }

  const pendingCount = pendingMaterials?.filter((m: MaterialContent) => m.status === "pending_review").length || 0

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Material Review Center</h1>
        <p className="text-gray-600 mt-2">Review and approve materials submitted by mentors</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="text-yellow-600 text-sm font-medium">Pending Review</div>
          <div className="text-3xl font-bold text-yellow-900 mt-1">{pendingCount}</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-green-600 text-sm font-medium">Approved Today</div>
          <div className="text-3xl font-bold text-green-900 mt-1">
            {allMaterials?.filter((m: MaterialContent) =>
              m.status === "approved" &&
              m.reviewedAt &&
              new Date(m.reviewedAt).toDateString() === new Date().toDateString()
            ).length || 0}
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-blue-600 text-sm font-medium">Total Published</div>
          <div className="text-3xl font-bold text-blue-900 mt-1">
            {allMaterials?.filter((m: MaterialContent) => m.status === "published").length || 0}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("pending")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "pending"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Pending Review
            {pendingCount > 0 && (
              <span className="ml-2 bg-yellow-100 text-yellow-800 py-0.5 px-2 rounded-full text-xs">
                {pendingCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("all")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "all"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            All Materials
          </button>
        </nav>
      </div>

      {/* Materials List */}
      {!selectedMaterial ? (
        <div className="grid grid-cols-1 gap-4">
          {displayMaterials.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500">
                {activeTab === "pending"
                  ? "No materials pending review"
                  : "No materials found"}
              </p>
            </div>
          ) : (
            displayMaterials.map((material: MaterialContent) => (
              <div
                key={material._id}
                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">{material.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(material.status)}`}>
                        {material.status.replace("_", " ").toUpperCase()}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-4">{material.description}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <span>📚 {material.category}</span>
                      <span>⭐ Level {material.level}</span>
                      <span>📊 {material.difficulty}</span>
                      <span>⏱️ {material.estimatedHours}h</span>
                      <span>👤 By: {material.authorRole}</span>
                    </div>
                    {material.reviewNotes && (
                      <div className="mt-4 p-3 bg-gray-50 rounded border border-gray-200">
                        <p className="text-sm font-medium text-gray-700">Review Notes:</p>
                        <p className="text-sm text-gray-600 mt-1">{material.reviewNotes}</p>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => setSelectedMaterial(material)}
                    className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Review
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        // Material Review Panel
        <div className="bg-white rounded-lg shadow-lg">
          <div className="border-b border-gray-200 p-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedMaterial.title}</h2>
                <p className="text-gray-600 mt-1">{selectedMaterial.description}</p>
              </div>
              <button
                onClick={() => {
                  setSelectedMaterial(null)
                  setReviewNotes("")
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕ Close
              </button>
            </div>
          </div>

          {/* Material Content */}
          <div className="p-6 max-h-[500px] overflow-y-auto">
            <MaterialViewer material={selectedMaterial} />
          </div>

          {/* Review Actions */}
          <div className="border-t border-gray-200 p-6 bg-gray-50">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Review Notes
              </label>
              <textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Provide feedback or notes for the author..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => handleApprove(selectedMaterial)}
                disabled={isProcessing}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition-colors"
              >
                {isProcessing ? "Processing..." : "✓ Approve & Publish"}
              </button>
              <button
                onClick={() => handleRequestRevision(selectedMaterial)}
                disabled={isProcessing || !reviewNotes.trim()}
                className="flex-1 px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition-colors"
              >
                {isProcessing ? "Processing..." : "↻ Request Revision"}
              </button>
              <button
                onClick={() => handleReject(selectedMaterial)}
                disabled={isProcessing || !reviewNotes.trim()}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition-colors"
              >
                {isProcessing ? "Processing..." : "✗ Reject"}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              * Review notes are required for rejection and revision requests
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
