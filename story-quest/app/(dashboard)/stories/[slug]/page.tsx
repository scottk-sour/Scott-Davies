'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Clock, Star, BookOpen, Heart, Shield } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { ContentWarning } from '@/components/story/ContentWarning'

interface StoryDetailProps {
  params: { slug: string }
}

export default function StoryDetailPage({ params }: StoryDetailProps) {
  const router = useRouter()
  const [story, setStory] = useState<any>(null)
  const [children, setChildren] = useState<any[]>([])
  const [selectedChildId, setSelectedChildId] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [showWarning, setShowWarning] = useState(false)

  useEffect(() => {
    fetchStory()
    fetchChildren()
  }, [params.slug])

  const fetchStory = async () => {
    try {
      const response = await fetch(`/api/stories/${params.slug}`)
      const data = await response.json()
      setStory(data.story)
    } catch (error) {
      console.error('Failed to fetch story:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchChildren = async () => {
    try {
      const response = await fetch('/api/children')
      const data = await response.json()
      setChildren(data.children || [])
      if (data.children?.length > 0) {
        setSelectedChildId(data.children[0].id)
      }
    } catch (error) {
      console.error('Failed to fetch children:', error)
    }
  }

  const handleStartReading = () => {
    if (!selectedChildId) {
      alert('Please select a child first')
      return
    }

    // Show content warning if there are trauma topics
    if (story.traumaTopics?.length > 0 || story.contentWarnings?.length > 0) {
      setShowWarning(true)
    } else {
      startSession()
    }
  }

  const startSession = async () => {
    try {
      const response = await fetch('/api/reading-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          childId: selectedChildId,
          storyId: story.id,
        }),
      })

      const data = await response.json()
      router.push(`/dashboard/stories/${params.slug}/read?session=${data.session.id}`)
    } catch (error) {
      console.error('Failed to start session:', error)
      alert('Failed to start reading session')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-600">Loading story...</p>
      </div>
    )
  }

  if (!story) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Story not found</p>
        <Link href="/dashboard/stories">
          <Button className="mt-4">Back to Stories</Button>
        </Link>
      </div>
    )
  }

  return (
    <div>
      {/* Back Link */}
      <Link
        href="/dashboard/stories"
        className="inline-flex items-center text-purple-600 hover:text-purple-700 mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Stories
      </Link>

      {/* Story Header */}
      <div className="grid md:grid-cols-3 gap-8 mb-8">
        {/* Cover Image */}
        <div className="md:col-span-1">
          <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden shadow-lg">
            <Image
              src={story.coverImage}
              alt={story.title}
              fill
              className="object-cover"
            />
          </div>
        </div>

        {/* Story Info */}
        <div className="md:col-span-2">
          <div className="flex flex-wrap gap-2 mb-4">
            {story.featured && <Badge variant="default">Featured</Badge>}
            {story.freeForCareChildren && <Badge variant="success">Free</Badge>}
            <Badge variant="secondary">{formatCategory(story.category)}</Badge>
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-2">{story.title}</h1>
          {story.subtitle && (
            <p className="text-xl text-gray-600 mb-4">{story.subtitle}</p>
          )}

          <p className="text-gray-700 text-lg leading-relaxed mb-6">
            {story.description}
          </p>

          {/* Meta Info */}
          <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-6">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{story.duration} minutes</span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <span>{story.wordCount} words</span>
            </div>
            {story.averageRating && (
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span>{story.averageRating.toFixed(1)}</span>
              </div>
            )}
          </div>

          {/* Start Reading */}
          <Card>
            <CardContent className="pt-6">
              {children.length === 0 ? (
                <div className="text-center">
                  <p className="text-gray-600 mb-4">
                    Please add a child profile first
                  </p>
                  <Link href="/dashboard/children">
                    <Button>Add Child</Button>
                  </Link>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Who will read this story?
                  </label>
                  <select
                    value={selectedChildId}
                    onChange={(e) => setSelectedChildId(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4"
                  >
                    {children.map((child) => (
                      <option key={child.id} value={child.id}>
                        {child.name} (Age {child.age})
                      </option>
                    ))}
                  </select>
                  <Button onClick={handleStartReading} size="lg" className="w-full">
                    Start Reading
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Therapeutic Information */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Therapeutic Themes */}
        {story.therapeuticThemes?.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-purple-600" />
                Therapeutic Themes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {story.therapeuticThemes.map((theme: string) => (
                  <Badge key={theme} variant="default">
                    {formatTheme(theme)}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Healing Goals */}
        {story.healingGoals?.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-purple-600" />
                What This Story Helps With
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {story.healingGoals.map((goal: string, i: number) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-purple-600 mt-0.5">•</span>
                    <span className="text-gray-700">{goal}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Content Warning Modal */}
      {showWarning && (
        <ContentWarning
          warnings={story.contentWarnings || []}
          traumaTopics={story.traumaTopics || []}
          onAccept={() => {
            setShowWarning(false)
            startSession()
          }}
          onDecline={() => {
            setShowWarning(false)
            router.push('/dashboard/stories')
          }}
        />
      )}
    </div>
  )
}

function formatCategory(category: string): string {
  return category.replace(/_/g, ' & ')
}

function formatTheme(theme: string): string {
  const themeMap: Record<string, string> = {
    SAFETY: 'Safety',
    TRUST: 'Trust',
    EMPOWERMENT: 'Empowerment',
    SELF_WORTH: 'Self-Worth',
    EMOTIONAL_REGULATION: 'Emotional Regulation',
    ATTACHMENT: 'Attachment',
    BOUNDARIES: 'Boundaries',
    RESILIENCE: 'Resilience',
    HOPE: 'Hope',
    HEALING: 'Healing',
  }
  return themeMap[theme] || theme
}
