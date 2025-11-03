import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, Plus } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function TodayPage() {
  // In a real app, fetch today's viewings from the database
  const todaysViewings: any[] = []

  return (
    <div className="space-y-6 p-4">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Today's Viewings</h1>
        <p className="text-sm text-gray-600">
          {new Date().toLocaleDateString('en-GB', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </p>
      </div>

      {todaysViewings.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="mb-4 h-16 w-16 text-gray-400" />
            <h3 className="mb-2 text-lg font-semibold">No viewings today</h3>
            <p className="mb-6 text-center text-sm text-gray-600">
              Create a viewing report to get started
            </p>
            <Link href="/new-viewing">
              <Button size="lg">
                <Plus className="mr-2 h-5 w-5" />
                New Viewing
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {todaysViewings.map((viewing) => (
            <Card key={viewing.id}>
              <CardHeader>
                <CardTitle>{viewing.property.address}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  {viewing.viewingDate.toLocaleTimeString('en-GB', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
