'use client'

import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface ContentWarningProps {
  warnings: string[]
  traumaTopics: string[]
  onAccept: () => void
  onDecline: () => void
}

export function ContentWarning({
  warnings,
  traumaTopics,
  onAccept,
  onDecline,
}: ContentWarningProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="max-w-lg w-full">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4 mb-4">
            <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Content Information
              </h2>
              <p className="text-gray-600">
                This story has been designed to help with difficult topics. Please review
                the following information before continuing.
              </p>
            </div>
          </div>

          {traumaTopics.length > 0 && (
            <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm font-medium text-amber-900 mb-2">
                Therapeutic Topics:
              </p>
              <ul className="text-sm text-amber-800 space-y-1">
                {traumaTopics.map((topic, i) => (
                  <li key={i}>• {formatTopic(topic)}</li>
                ))}
              </ul>
            </div>
          )}

          {warnings.length > 0 && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm font-medium text-blue-900 mb-2">Important Notes:</p>
              <ul className="text-sm text-blue-800 space-y-1">
                {warnings.map((warning, i) => (
                  <li key={i}>• {warning}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-purple-900">
              <strong>Remember:</strong> You can pause or stop the story at any time. If you
              feel uncomfortable, it's okay to take a break or choose a different story.
            </p>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={onDecline} className="flex-1">
              Choose Different Story
            </Button>
            <Button onClick={onAccept} className="flex-1">
              I Understand, Continue
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function formatTopic(topic: string): string {
  const topicMap: Record<string, string> = {
    PHYSICAL_ABUSE: 'Physical harm and safety',
    EMOTIONAL_ABUSE: 'Emotional wellbeing and feelings',
    NEGLECT: 'Care and being looked after',
    SEPARATION_LOSS: 'Separation from loved ones',
    DOMESTIC_VIOLENCE: 'Family conflict',
    SUBSTANCE_ABUSE: 'Substance use in families',
    HOMELESSNESS: 'Housing and stability',
    MULTIPLE_PLACEMENTS: 'Changes in living situations',
    GRIEF_BEREAVEMENT: 'Loss and grief',
  }
  return topicMap[topic] || topic
}
