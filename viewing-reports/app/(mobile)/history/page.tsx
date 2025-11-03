import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { History, FileText } from 'lucide-react'

export default function HistoryPage() {
  // In a real app, fetch viewing history from the database
  const viewings: any[] = []

  return (
    <div className="space-y-6 p-4">
      <h1 className="text-2xl font-bold">Viewing History</h1>

      {viewings.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <History className="mb-4 h-16 w-16 text-gray-400" />
            <h3 className="mb-2 text-lg font-semibold">No viewing reports yet</h3>
            <p className="text-center text-sm text-gray-600">
              Your completed viewings will appear here
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {viewings.map((viewing: any) => (
            <Card key={viewing.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">
                      {viewing.property.address}
                    </CardTitle>
                    <p className="mt-1 text-sm text-gray-600">
                      {viewing.viewerName}
                    </p>
                  </div>
                  <FileText className="h-5 w-5 text-gray-400" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-gray-500">
                  {new Date(viewing.viewingDate).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
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
