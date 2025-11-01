'use client'

import { use, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { StoryReader } from '@/components/story/StoryReader'

interface ReadingPageProps {
  params: Promise<{ slug: string }>
}

export default function ReadingPage({ params }: ReadingPageProps) {
  const { slug } = use(params)
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionId = searchParams?.get('session')

  const [session, setSession] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (sessionId) {
      fetchSession()
    }
  }, [sessionId])

  const fetchSession = async () => {
    try {
      // For now, we'll fetch the story and session separately
      // In a real app, the session API would return everything needed
      const storyResponse = await fetch(`/api/stories/${slug}`)
      const storyData = await storyResponse.json()

      setSession({
        id: sessionId,
        story: storyData.story,
        childId: 'temp', // Would come from session
      })
    } catch (error) {
      console.error('Failed to fetch session:', error)
      alert('Failed to load reading session')
      router.push('/stories')
    } finally {
      setIsLoading(false)
    }
  }

  const handleComplete = (endingId: string) => {
    // Show completion message and redirect
    router.push(`/stories?completed=true`)
  }

  const handleExit = () => {
    router.push('/stories')
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Loading story...</p>
      </div>
    )
  }

  if (!session || !sessionId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Session not found</p>
      </div>
    )
  }

  return (
    <StoryReader
      storyId={session.story.id}
      sessionId={sessionId}
      content={session.story.content}
      audioFiles={session.story.audioFiles}
      childId={session.childId}
      onComplete={handleComplete}
      onExit={handleExit}
    />
  )
}
