import { Card, CardContent } from '@/components/ui/card'
import { Book } from 'lucide-react'

export default function StoriesPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Stories</h1>
      <Card>
        <CardContent className="pt-12 pb-12 text-center">
          <div className="mx-auto h-16 w-16 rounded-full bg-purple-100 flex items-center justify-center mb-4">
            <Book className="h-8 w-8 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Coming Soon</h3>
          <p className="text-gray-600 max-w-md mx-auto">
            Our therapeutic story library is being built. You'll be able to browse
            trauma-informed interactive stories here.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
