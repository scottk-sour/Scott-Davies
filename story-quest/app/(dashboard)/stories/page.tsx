'use client'

import { useEffect, useState } from 'react'
import { StoryCard } from '@/components/story/StoryCard'
import { Select } from '@/components/ui/select'
import { Book } from 'lucide-react'

interface Story {
  id: string
  title: string
  description: string
  coverImage: string
  category: string
  duration: number
  therapeuticThemes: string[]
  ageGroup: string[]
  freeForCareChildren: boolean
  featured: boolean
  slug: string
  playCount: number
  averageRating?: number
}

export default function StoriesPage() {
  const [stories, setStories] = useState<Story[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [ageFilter, setAgeFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')

  useEffect(() => {
    fetchStories()
  }, [ageFilter, categoryFilter])

  const fetchStories = async () => {
    try {
      const params = new URLSearchParams()
      if (ageFilter) params.append('ageGroup', ageFilter)
      if (categoryFilter) params.append('category', categoryFilter)

      const response = await fetch(`/api/stories?${params.toString()}`)
      const data = await response.json()
      setStories(data.stories || [])
    } catch (error) {
      console.error('Failed to fetch stories:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const featuredStories = stories.filter((s) => s.featured)
  const regularStories = stories.filter((s) => !s.featured)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-600">Loading stories...</p>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Story Library</h1>
        <p className="text-gray-600 mt-1">
          Discover therapeutic stories designed to support healing and growth
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-8">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Age Group
          </label>
          <Select value={ageFilter} onChange={(e) => setAgeFilter(e.target.value)}>
            <option value="">All Ages</option>
            <option value="AGES_4_6">Ages 4-6</option>
            <option value="AGES_7_10">Ages 7-10</option>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <Select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">All Categories</option>
            <option value="SAFETY_SECURITY">Safety & Security</option>
            <option value="FEELINGS_EMOTIONS">Feelings & Emotions</option>
            <option value="TRUST_RELATIONSHIPS">Trust & Relationships</option>
            <option value="RESILIENCE_STRENGTH">Resilience & Strength</option>
            <option value="IDENTITY_BELONGING">Identity & Belonging</option>
            <option value="HEALING_GROWTH">Healing & Growth</option>
          </Select>
        </div>
      </div>

      {stories.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <Book className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold mb-2">No stories yet</h3>
          <p className="text-gray-600">
            Our therapeutic story library is being developed. Check back soon!
          </p>
        </div>
      ) : (
        <>
          {/* Featured Stories */}
          {featuredStories.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Stories</h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {featuredStories.map((story) => (
                  <StoryCard key={story.id} story={story} />
                ))}
              </div>
            </div>
          )}

          {/* All Stories */}
          {regularStories.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">All Stories</h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {regularStories.map((story) => (
                  <StoryCard key={story.id} story={story} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
