'use client'

import React from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'
import rehypeRaw from 'rehype-raw'
import remarkGfm from 'remark-gfm'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  BookOpen,
  Clock,
  Target,
  Video,
  FileText,
  Download,
  CheckCircle2,
  ArrowLeft
} from 'lucide-react'
import { MaterialContent } from '@/services/material-content-service'
import 'highlight.js/styles/github-dark.css'

interface MaterialViewerProps {
  material: MaterialContent
  onBack?: () => void
}

export default function MaterialViewer({ material, onBack }: MaterialViewerProps) {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        {onBack && (
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        )}
      </div>

      {/* Title Card */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <CardTitle className="text-3xl">{material.title}</CardTitle>
                <Badge variant={material.status === 'published' ? 'default' : 'secondary'}>
                  {material.status}
                </Badge>
              </div>
              <CardDescription className="text-base">
                {material.description}
              </CardDescription>
            </div>
          </div>

          {/* Meta Information */}
          <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              <span className="capitalize">{material.category}</span>
            </div>
            <div className="flex items-center gap-1">
              <Target className="h-4 w-4" />
              <span>Level {material.level} - {material.difficulty}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{material.estimatedHours} hours</span>
            </div>
          </div>

          {/* Tags */}
          {material.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {material.tags.map((tag, index) => (
                <Badge key={index} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Learning Objectives */}
      {material.objectives.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Target className="h-5 w-5" />
              Learning Objectives
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {material.objectives.map((objective, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>{objective}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Prerequisites */}
      {material.prerequisites.length > 0 && (
        <Card className="bg-amber-50 border-amber-200">
          <CardHeader>
            <CardTitle className="text-xl">Prerequisites</CardTitle>
            <CardDescription>
              You should be familiar with these topics before starting
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1">
              {material.prerequisites.map((prereq, index) => (
                <li key={index} className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                  <span>{prereq}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Video Content */}
      {material.videoUrl && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Video className="h-5 w-5" />
              Video Content
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
              {material.videoUrl.includes('youtube.com') || material.videoUrl.includes('youtu.be') ? (
                <iframe
                  className="w-full h-full"
                  src={material.videoUrl.replace('watch?v=', 'embed/')}
                  title={material.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video className="w-full h-full" controls src={material.videoUrl}>
                  Your browser does not support the video tag.
                </video>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Content
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-slate max-w-none dark:prose-invert">
            <ReactMarkdown
              rehypePlugins={[rehypeHighlight, rehypeRaw]}
              remarkPlugins={[remarkGfm]}
            >
              {material.content}
            </ReactMarkdown>
          </div>
        </CardContent>
      </Card>

      {/* Attachments */}
      {material.attachments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Download className="h-5 w-5" />
              Attachments & Resources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {material.attachments.map((attachment, index) => (
                <a
                  key={index}
                  href={attachment.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="font-medium">{attachment.name}</p>
                      <p className="text-sm text-muted-foreground capitalize">
                        {attachment.type}
                      </p>
                    </div>
                  </div>
                  <Download className="h-4 w-4 text-gray-400" />
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
