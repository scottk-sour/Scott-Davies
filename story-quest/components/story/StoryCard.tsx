import Link from 'next/link'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Clock, Star } from 'lucide-react'

interface StoryCardProps {
  story: {
    id: string
    title: string
    description: string
    coverImage: string
    category: string
    duration: number
    therapeuticThemes: string[]
    freeForCareChildren: boolean
    featured: boolean
    slug: string
    playCount: number
    averageRating?: number
  }
}

export function StoryCard({ story }: StoryCardProps) {
  return (
    <Link href={`/dashboard/stories/${story.slug}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full">
        {/* Cover Image */}
        <div className="relative h-48 w-full bg-gray-100">
          <Image
            src={story.coverImage}
            alt={story.title}
            fill
            className="object-cover"
          />
          {story.featured && (
            <div className="absolute top-2 right-2">
              <Badge variant="default" className="bg-amber-500">
                Featured
              </Badge>
            </div>
          )}
          {story.freeForCareChildren && (
            <div className="absolute top-2 left-2">
              <Badge variant="success">Free</Badge>
            </div>
          )}
        </div>

        <CardHeader>
          <h3 className="text-lg font-bold text-gray-900 line-clamp-2">
            {story.title}
          </h3>
        </CardHeader>

        <CardContent>
          <p className="text-sm text-gray-600 line-clamp-2 mb-4">
            {story.description}
          </p>

          {/* Therapeutic Themes */}
          <div className="flex flex-wrap gap-1 mb-4">
            {story.therapeuticThemes.slice(0, 2).map((theme) => (
              <Badge key={theme} variant="secondary" className="text-xs">
                {formatTheme(theme)}
              </Badge>
            ))}
            {story.therapeuticThemes.length > 2 && (
              <Badge variant="secondary" className="text-xs">
                +{story.therapeuticThemes.length - 2}
              </Badge>
            )}
          </div>

          {/* Meta Info */}
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{story.duration} min</span>
            </div>
            {story.averageRating && (
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span>{story.averageRating.toFixed(1)}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

function formatTheme(theme: string): string {
  const themeMap: Record<string, string> = {
    SAFETY: 'Safety',
    TRUST: 'Trust',
    EMPOWERMENT: 'Empowerment',
    SELF_WORTH: 'Self-Worth',
    EMOTIONAL_REGULATION: 'Emotions',
    ATTACHMENT: 'Attachment',
    BOUNDARIES: 'Boundaries',
    RESILIENCE: 'Resilience',
    HOPE: 'Hope',
    HEALING: 'Healing',
  }
  return themeMap[theme] || theme
}
